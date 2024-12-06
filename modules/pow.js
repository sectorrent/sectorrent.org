const crypto = require('crypto');
//const difficulty = 4;
const MAX_POW_PER_SESSION = 5;

exports.generateChallenge = (req, config, difficulty = 4) => {
    if(req.session.pow && req.session.pow.length >= MAX_POW_PER_SESSION){
        req.pow.shift();
    }

    const challenge = crypto.randomBytes(16).toString('hex');
    const hmac = crypto.createHmac('sha256', config.token.pow).update(challenge).digest('hex');

    if(req.session.pow){
        /*
        req.session.pow.push({
            challenge,
            hmac,
            difficulty
        });
        */
        req.session.pow.push(hmac);

        return { challenge, hmac, difficulty };
    }

    /*
    req.session.pow = [
        {
            challenge,
            hmac,
            difficulty
        }
    ];
    */
    req.session.pow = [ hmac ];

    return { challenge, hmac, difficulty };
};

exports.validateSolution = (req, config, pow, difficulty = 4) => {
    const index = req.session.pow.indexOf(pow.hmac);
    if(!req.session.pow || index == -1 ){ //NO POW SAVED - LIKELY NEEDS A RELOAD
        return false;
    }

    req.session.pow.splice(index, 1); //REMOVE THE GIVEN HMAC

    if(crypto.createHmac('sha256', config.token.pow).update(pow.challenge).digest('hex') != pow.hmac){ //VERIFY VALIDITY OF CHALLENGE
        return false;
    }

    const hash = crypto.createHash('sha256').update(pow.challenge+pow.nonce).digest('hex');
    return hash.startsWith('0'.repeat(difficulty));
};
