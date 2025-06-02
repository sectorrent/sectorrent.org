const crypto = require('crypto');

const curveOID = '06082a8648ce3d030107';

exports.create = () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1', // P-256 curve
    });

    const key = crypto.createPrivateKey({
        key: privateKey.export({
            format: 'der',
            type: 'pkcs8'
        }),
        format: 'der',
        type: 'pkcs8'
    }).export({ format: 'jwk' });

    return {
        x: Buffer.from(Buffer.from(key.x, 'base64').toString('hex').padStart(64, '0'), 'hex'),
        y: Buffer.from(Buffer.from(key.y, 'base64').toString('hex').padStart(64, '0'), 'hex'),
        d: Buffer.from(Buffer.from(key.d, 'base64').toString('hex').padStart(64, '0'), 'hex')
    };
};

exports.publicToPEM = (jwk) => {
    const der = Buffer.concat([
        Buffer.from('3059301306072a8648ce3d0201'+curveOID+'03420004', 'hex'),
        jwk.x,
        jwk.y
    ]);

    return bufferToPEM(der, 'PUBLIC KEY');
};

exports.privateToPEM = (jwk) => {
    const der = Buffer.concat([
        Buffer.from('308187020100301306072a8648ce3d0201'+curveOID+'046d306b0201010420', 'hex'),
        jwk.d,
        Buffer.from('a14403420004', 'hex'),
        jwk.x,
        jwk.y
    ]);

    return bufferToPEM(der, 'EC PRIVATE KEY');
};

exports.publicToRaw = (jwk) => {
    return Buffer.concat([
        Buffer.from('04', 'hex'),
        jwk.x,
        jwk.y
    ]);
};

exports.publicToBase64 = (jwk) => {
    return Buffer.concat([Buffer.from('04', 'hex'), jwk.x, jwk.y]).toString('base64');
};

exports.privateToBase64 = (jwk) => {
    return jwk.d.toString('base64');
};

exports.decodePublicKey = (key) => {
    const keyBuf = Buffer.from(key, 'base64');

    if(keyBuf[0] !== 4){
        throw new Error('Invalid data: only uncompressed keys are supported.');
    }

    return [keyBuf.slice(1, 33), keyBuf.slice(33)];
};

exports.decodePrivateKey = (key) => {
    return Buffer.from(key, 'base64');
};

const bufferToPEM = (buffer, type) => {
    const base64 = buffer.toString('base64');
    const pem = `-----BEGIN ${type}-----\n`;
    const lines = base64.match(/.{1,64}/g);
    return pem + lines.join('\n') + `\n-----END ${type}-----`;
};
