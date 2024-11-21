const { ObjectId } = require('mongodb');

exports.getCategories = async (req) => {

};

exports.getLatest = async (req) => {

};

exports.getTop = async (req) => {

};

exports.getThread = async (req, id) => {
	id = ObjectId.createFromHexString(id);

	let data = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $match: {
                _id: id
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

exports.postComment = async (req) => {
};

exports.putComment = async (req) => {
};

exports.deleteComment = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};

exports.getComments = async (req) => {
};
