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

exports.send = async (subscription, payload, config, serverToken) => {
    payload.message.token = subscription.token;
    payload.message.android = {
        notification: {
            channel_id: '69420',
            click_action: 'com.octorrent.android.ui.MainActivity'
        }
    };

    try{
        const response = await axios.post(
            `https://fcm.googleapis.com/v1/projects/${config.notifications.android.project_id}/messages:send`,
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
                await this.generateServerToken(config);
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

exports.generateServerToken = async (config) => {
    const time = Math.floor(Date.now()/1000);

    const token = generateJWT(
        {
            typ: 'JWT',
            alg: 'RS256'
        },
        {
            iss: config.notifications.android.client_email,
            scope: 'https://www.googleapis.com/auth/firebase.messaging',
            aud: config.notifications.android.token_uri,
            exp: time+3600,
            iat: time
        },
        crypto.createPrivateKey(config.notifications.android.private_key)
    );

    try{
        const response = await axios.post(
            config.notifications.android.token_uri,
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
