const crypto = require('crypto');
const axios = require('axios');
const notification = require('./notification');
const middleware = require('../middleware');

exports.subscribe = async (req) => {
    if(!req.body.token){
        throw new Error('Subscription is not valid');
    }

    if(!req.body.token.match(/^[a-zA-Z0-9\-_:.]+$/)){
        throw new Error('token is not valid');
    }
    
    const update = await global.mongo.getDatabase().collection('subscriptions').updateOne(
        {
            type: 'android',
            token: req.body.token
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

exports.send = async (subscription, payload, serverToken) => {
    payload.message.token = subscription.token;
    payload.message.android = {
        notification: {
            channel_id: '69420',
            click_action: 'com.sectorrent.android.ui.MainActivity'
        }
    };

    try{
        const response = await axios.post(
            `https://fcm.googleapis.com/v1/projects/${process.env.NOTIFICATIONS_ANDROID_PROJECT_ID}/messages:send`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${serverToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        //const statusCode = response.status;
        //console.log(statusCode);
        
    }catch(error){
        switch(error.response.status){
            case 401:
                await this.generateServerToken();
                break;

            case 404:
                await notification.unsubscribe(subscription._id);
                break;

            default:
                if(error.response.status >= 400){
                    throw new Error(`Unexpected status code: ${error.response.status}`);
                }
        }
    }
};

exports.generateServerToken = async () => {
    const time = Math.floor(Date.now()/1000);

    const token = generateJWT(
        {
            typ: 'JWT',
            alg: 'RS256'
        },
        {
            iss: process.env.NOTIFICATIONS_ANDROID_CLIENT_EMAIL,
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
            aud: process.env.NOTIFICATIONS_ANDROID_TOKEN_URI,
            exp: time+3600,
            iat: time
        },
        crypto.createPrivateKey(process.env.NOTIFICATIONS_ANDROID_PRIVKEY)
    );

    try{
        const response = await axios.post(
            process.env.NOTIFICATIONS_ANDROID_TOKEN_URI,
            `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        const statusCode = response.status;

        switch(statusCode){
            case 200:
                return response.data.access_token;
        }

    }catch(error){
        console.error('Error generating server token:', error.message);
        throw new Error('Error generating server token.');
    }
};

function generateJWT(headers, payload, privateKey){
	const message = notification.base64UrlEncode(JSON.stringify(headers))+'.'+notification.base64UrlEncode(JSON.stringify(payload));
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();
    
    const signature = notification.base64UrlEncode(sign.sign(privateKey));

	return message+'.'+signature;
}
