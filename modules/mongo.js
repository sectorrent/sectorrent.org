const { MongoClient } = require('mongodb');

let uri, client, db;

exports.connectDatabase = async () => {
	const uri = 'mongodb://'+((process.env.DB_USERNAME && process.env.DB_PASSWORD) ? process.env.DB_USERNAME+':'+encodeURIComponent(process.env.DB_PASSWORD)+'@' : '')+process.env.DB_HOST+':'+process.env.DB_PORT+'/'+process.env.DB_NAME;
	console.log(uri);

	client = new MongoClient(uri, { });
	client.connect();
	db = client.db();

	await db.collection('users').createIndex({
		email: 1
	},
	{
		unique: true
	});

	await db.collection('users').createIndex({
		username: 1
	},
	{
		unique: true,
        collation: {
			locale: 'en',
			strength: 2
		}
	});

	await db.collection('categories').createIndex({
		slug: 1
	},
	{
		unique: true
	});
};

exports.getURI = () => {
	return uri;
}

exports.getClient = () => {
	return client;
};

exports.getDatabase = () => {
	return db;
};
