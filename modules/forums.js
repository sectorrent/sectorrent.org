const { ObjectId } = require('mongodb');
const TypError = require('./type_error');

exports.getCategories = async (req) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let data = await global.mongo.getDatabase().collection('categories').aggregate([
		{
			$facet: {
                categories: [
                    {
                        $project: {
                            _id: true,
                            title: true,
                            slug: true,
                            color: true
                        }
                    }
                ],
                threads: [
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
                    }
                ]
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}
    
    data = data[0];

    return data;
};

exports.getCategory = async (req, slug) => {
	let data = await global.mongo.getDatabase().collection('categories').aggregate([
		{
			$facet: {
                categories: [
                    {
                        $project: {
                            _id: true,
                            title: true,
                            slug: true,
                            color: true
                        }
                    }
                ],
                threads: [
                    {
                        $match: {
                            slug: slug
                        }
                    },
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
                                },
                                {
                                    $skip: 0
                                },
                                {
                                    $limit: 20
                                }
                            ],
                            as: 'threads'
                        }
                    },
                    {
                        $unwind: '$threads'
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$threads'
                        }
                    }
                ]
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}
    
    data = data[0];

    return data;
};

exports.getLatest = async (req) => {
};

exports.getTop = async (req) => {

};

exports.getThread = async (req, id) => {
	id = ObjectId.createFromHexString(id);

	let categories = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $project: {
                _id: true,
                title: true,
                slug: true,
                color: true
            }
        }
    ]).toArray();

	let thread = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $match: {
                _id: id
            }
        }
    ]).toArray();

	if(thread.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return {
        categories,
        thread: thread[0]
    };
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
