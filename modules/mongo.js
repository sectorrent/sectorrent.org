const { MongoClient } = require('mongodb');

let uri, client, db;

exports.connectDatabase = async (config) => {
	uri = 'mongodb://'+((config.user && config.password) ? config.user+':'+encodeURIComponent(config.password)+'@' : '')+config.host+':'+config.port+'/'+config.database;
	
	client = new MongoClient(uri, { });
	client.connect();
	db = client.db();

	await db.collection('users').createIndex({
		email: 1
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
