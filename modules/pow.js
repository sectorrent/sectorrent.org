const crypto = require('crypto');
//const difficulty = 4;

exports.generateChallenge = (config, difficulty = 4) => {
    const challenge = crypto.randomBytes(16).toString('hex');
    const hmac = crypto.createHmac('sha256', config.token.pow).update(challenge).digest('hex');
    return { challenge, hmac, difficulty };
};

exports.validateSolution = (config, pow, difficulty = 4) => {
    if(crypto.createHmac('sha256', config.token.pow).update(pow.challenge).digest('hex') != pow.hmac){
        return false;
    }

    const hash = crypto.createHash('sha256').update(pow.challenge+pow.nonce).digest('hex');
    return hash.startsWith('0'.repeat(difficulty));
};
