const crypto = require('crypto');
//const jwt = require('./jwt');
//const difficulty = 4;
const MAX_POW_PER_SESSION = 15;

exports.generateChallenge = (req, res, difficulty = 4) => {
    if(req.session.challenges && req.session.challenges.length > MAX_POW_PER_SESSION){
        req.session.challenges.splice(req.session.challenges.indexOf(req.session.challenges.length-1, 1));
    }

    const challenge = crypto.randomBytes(16).toString('hex');
    const hmac = crypto.createHmac('sha256', res.locals.config.token.pow).update(challenge+difficulty).digest('hex');

    if(req.session.challenges){
        req.session.challenges.push(hmac);
        return {
            challenge,
            hmac,
            difficulty
        };
    }

    req.session.challenges = [
        hmac
    ];
    return {
        challenge,
        hmac,
        difficulty
    };
};

exports.validateSolution = (req, res, pow) => {
    if(!req.session.challenges){
        return false;
    }

    try{
        req.session.challenges.splice(req.session.challenges.indexOf(pow.hmac), 1);

    }catch(error){
        return false;
    }

    if(crypto.createHmac('sha256', res.locals.config.token.pow).update(pow.challenge+pow.difficulty).digest('hex') != pow.hmac){
        return false;
    }

    const hash = crypto.createHash('sha256').update(pow.challenge+pow.nonce).digest('hex');
    return hash.startsWith('0'.repeat(pow.difficulty));
};
