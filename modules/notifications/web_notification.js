const crypto = require('crypto');
const axios = require('axios');
const notification = require('./notification');
const middleware = require('../middleware');
const jwk = require('./jwk');

exports.subscribe = async (req) => {
    const { endpoint, keys } = req.body;

    if(!endpoint || !keys || !keys.auth || !keys.p256dh){
        throw new Error('Subscription is not valid');
    }

    if(!isValidUrl(endpoint)){
        throw new Error('Endpoint is not a valid URL');
    }

    if(Buffer.from(notification.base64UrlDecode(keys.auth), 'binary').length !== 16){
        throw new Error('Auth key is not valid');
    }

    const [x, y] = jwk.decodePublicKey(keys.p256dh);
    if(Buffer.from(x, 'binary').length !== 32 || Buffer.from(y, 'binary').length !== 32){
        throw new Error('p256dh key is not valid');
    }

    const update = await global.mongo.getDatabase().collection('subscriptions').updateOne(
        {
            type: 'web',
            endpoint: endpoint,
            keys: {
                p256dh: keys.p256dh,
                auth: keys.auth
            }
        },
        {
            $set: {
                user: middleware.getUserID(req)
            }
        },
        {
            upsert: true
        }
    );

    if(update.modifiedCount !== 1 && update.upsertedCount !== 1){
        throw new Error('Unable to save to DB');
    }

    return {
        subscription: true
    };
};

exports.send = async (subscription, payload, config) => {
    payload = JSON.stringify(payload);
    
    const url = new URL(subscription.endpoint).origin.replace(/\//g, '\/');
    console.log(url);

    const [x, y] = jwk.decodePublicKey(config.notifications.web.public_key);
    const applicationJWK = {
        x: x,
        y: y,
        d: jwk.decodePrivateKey(config.notifications.web.private_key)
    };

    const expiration = Math.floor(Date.now()/1000)+(12*60*60); // 12 hours
    const token = generateJWT(
        {
            alg: 'ES256',
            typ: 'JWT'
        },
        {
            aud: url,
            exp: expiration,
            sub: `mailto:admin@${config.general.domain}`
        },
        crypto.createPrivateKey(jwk.privateToPEM(applicationJWK))
    );

    const localJWK = jwk.create();

    const userJWK = jwk.create();
    const [ux, uy] = jwk.decodePublicKey(subscription.keys.p256dh);
    userJWK.x = ux;
    userJWK.y = uy;

    const ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(localJWK.d, 'der');

    const sharedSecret = ecdh.computeSecret(jwk.publicToRaw(userJWK), 'der');

    const decodedLocalPublicKey = notification.base64UrlDecode(jwk.publicToBase64(localJWK));

    const salt = crypto.randomBytes(16);

    const prk = hkdf(notification.base64UrlDecode(subscription.keys.auth), sharedSecret, Buffer.concat([
        Buffer.from('WebPush: info'+String.fromCharCode(0)),
        notification.base64UrlDecode(subscription.keys.p256dh),
        decodedLocalPublicKey
    ]), 32);
    const cek = hkdf(salt, prk, 'Content-Encoding: aes128gcm'+String.fromCharCode(0), 16);
    const nonce = hkdf(salt, prk, 'Content-Encoding: nonce'+String.fromCharCode(0), 12);

    const payloadLength = Buffer.byteLength(payload, 'binary');
    const paddingLength = 3052 - payloadLength;
    const paddedPayload = Buffer.concat([Buffer.from(payload+String.fromCharCode(2), 'binary'), Buffer.alloc(paddingLength, 0)]);

    const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
    let cipherText = cipher.update(paddedPayload);
    cipherText = Buffer.concat([cipherText, cipher.final(), cipher.getAuthTag()]);

    const fullCipherText = Buffer.concat([salt, Buffer.from([0x00, 0x00, 0x10, 0x00]), Buffer.from([decodedLocalPublicKey.length]), Buffer.from(decodedLocalPublicKey), cipherText]);

    try{
        const response = await axios.post(subscription.endpoint, fullCipherText, {
            headers: {
                'TTL': 60*60*12,
                'Urgency': 'normal',
                'Content-Type': 'application/octet-stream',
                'Content-Encoding': 'aes128gcm',
                'Content-Length': fullCipherText.length,
                'Authorization': `WebPush ${token}`,
                'Crypto-Key': `p256ecdsa=${config.notifications.web.public_key}`
            }
        });
        //const statusCode = response.status;
        //console.log(statusCode);

    }catch(error){
        switch(error.response.status){
            case 404:
            case 410:
                await notification.unsubscribe(subscription._id);
                break;

            case 429:
                throw new Error('Too many requests to endpoint');

            case 413:
                throw new Error('Payload too large');

            default:
                if(error.response.status >= 400){
                    throw new Error(`Unexpected status code: ${error.response.status}`);
                }
        }
    }
};

function isValidUrl(string){
    try{
        new URL(string);
        return true;

    }catch(e){
        return false;
    }
}

function generateJWT(headers, payload, privateKey){
    const message = `${notification.base64UrlEncode(Buffer.from(JSON.stringify(headers)))}.${notification.base64UrlEncode(Buffer.from(JSON.stringify(payload)))}`;
    
    const signature = crypto.sign('sha256', Buffer.from(message), { key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING });
    
    let components = [];
    let pos = 0;
    const size = signature.length;

    while(pos < size){
        const constructed = (signature[pos] >> 5) & 0x01;
        const type = signature[pos++] & 0x1f;
        let len = signature[pos++];

        if(len & 0x80){
            let n = len & 0x1f;
            len = 0;
            while(n-- && pos < size){
                len = (len << 8) | signature[pos++];
            }
        }

        if(type === 0x03){
            pos++;
            components.push(signature.slice(pos, pos + len - 1));
            pos += len-1;

        }else if(!constructed){
            components.push(signature.slice(pos, pos + len));
            pos += len;
        }
    }

    components = components.map(c => {
        if(c.length < 32){
            let paddedComponent = Buffer.alloc(32);
            c.copy(paddedComponent, 32-c.length);
            return paddedComponent;
        }
        return c.slice(-32);
    });

    return `${message}.${notification.base64UrlEncode(Buffer.concat(components))}`;
}

function hkdf(salt, ikm, info, length){
    const prk = crypto.createHmac('sha256', salt).update(ikm).digest();

    let t = Buffer.alloc(0);
    let okm = Buffer.alloc(0);
    const infoBuffer = Buffer.from(info, 'utf8');

    for(let i = 1; okm.length < length; i++){
        t = crypto.createHmac('sha256', prk)
                .update(t)
                .update(infoBuffer)
                .update(Buffer.from([i]))
                .digest();
        okm = Buffer.concat([okm, t]);
    }

    return okm.slice(0, length);
}
