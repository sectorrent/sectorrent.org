const { ObjectId } = require('mongodb');

exports.getCategories = async (req) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let data = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $lookup: {
                from: 'threads',
                let: {
                    categoryId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ['$$categoryId', '$categories']
                            }
                        }
                    }
                ],
                as: 'threads'
            }
        },
        {
            $addFields: {
                threads: { $size: "$threads" }
            }
        },
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
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

	data = data[0];

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
