const { ObjectId } = require('mongodb');
const middleware = require('../middleware');
const android = require('./android_notifications');
const web = require('./web_notification');

exports.subscribe = async (req) => {
    console.log(req.body);
    switch(req.body.type){
        case 'android':
            return await android.subscribe(req);

        case 'web':
            return await web.subscribe(req);

        default:
            throw new Error('Malformed POST, please refresh.');
    }
};

exports.unsubscribe = async (id) => {
    //id = ObjectId.createFromHexString(id);

    const update = await global.mongo.getDatabase().collection('subscriptions').deleteOne({
        _id: id
    });

    if(update.deletedCount != 1){
        throw new Error('Failed to remove from DB');
    }
};

exports.saveNotify = async (req, id) => {
    id = ObjectId.createFromHexString(id);

    let data = await global.mongo.getDatabase().collection('media').aggregate([
        {
            $match: {
                _id: id,
                release: {
                    $exists: true
                }
            }
        },
        {
            $project: {
                _id: true,
                title: true,
                genres: true,
                rating: true,
                year: true,
                portrait: true,
                landscape: true,
				color: true,
                type: true,
                release: true
            }
        }
    ]).toArray();

    if(data.length < 1){
        return res.status(404).send("Media ID doesn't exist...");
    }

    data = data[0];
    
    const exists = await global.mongo.getDatabase().collection('notify').findOne(
        {
            user: middleware.getUserID(req),
            media: id
        }
    );

    if(exists){
        return data;
    }

    const insert = await global.mongo.getDatabase().collection('notify').insertOne(
        {
            user: middleware.getUserID(req),
            media: id
        }
    );

    if(!insert.acknowledged){
        throw new Error('Unable to save to db.');
    }

    return data;
};

exports.deleteNotify = async (req, id) => {
    id = ObjectId.createFromHexString(id);

    let data = await global.mongo.getDatabase().collection('media').aggregate([
        {
            $match: {
                _id: id,
                release: {
                    $exists: true
                }
            }
        },
        {
            $project: {
                _id: true,
                title: true,
                genres: true,
                rating: true,
                year: true,
                portrait: true,
                landscape: true,
				color: true,
                type: true,
                release: true
            }
        }
    ]).toArray();

    if(data.length < 1){
        return res.status(404).send("Media ID doesn't exist...");
    }

    data = data[0];

    const update = await global.mongo.getDatabase().collection('notify').deleteOne(
        {
            user: middleware.getUserID(req),
            media: id
        }
    );

    if(update.deletedCount !== 1){
        throw new Error('Unable to save to db.');
    }

    return data;
};

exports.sendToGroup = async (subscriptions, payload, config) => {
    const token = await android.generateServerToken(config);

    for(const subscription of subscriptions){
        try{
            switch(subscription.type){
                case 'android':
                    await android.send(subscription, payload, config, token);
                    break;

                case 'web':
                    await web.send(subscription, payload, config);
                    break;
            }
        }catch(error){
        }
    }
};

exports.send = async (subscription, payload, config) => {
    switch(subscription.type){
        case 'android':
            await android.send(subscription, payload, config, await android.generateServerToken(config));
            break;

        case 'web':
            await web.send(subscription, payload, config);
            break;
    }

    throw new Error('Subscription type not set.');
};

exports.base64UrlEncode = (data) => {
    return Buffer.from(data).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

exports.base64UrlDecode = (data) => {
    data = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(data, 'base64');
};
