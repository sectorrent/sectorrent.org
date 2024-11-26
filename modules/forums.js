const { ObjectId } = require('mongodb');
const TypError = require('./type_error');

exports.getCategories = async () => {
	global.categories = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $project: {
                _id: true,
                title: true,
                slug: true,
                color: true
            }
        }
    ]).toArray();

    return categories;
};

exports.getHome = async (req) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let categories = await global.mongo.getDatabase().collection('categories').aggregate([
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
                threads: {
                    $size: '$threads'
                }
            }
        }
    ]).toArray();


	let latest = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $sort: {
                created: -1
            }
        },
        {
            $skip: 0
        },
        {
            $limit: 20
        }
    ]).toArray();

	if(categories.length < 1 || latest.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return {
        categories,
        latest
    };
};

exports.getCategory = async (req, slug) => {
	let data = await global.mongo.getDatabase().collection('categories').aggregate([
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
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

//SORT BY SLUG
exports.getLatest = async (req) => {
	let data = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $sort: {
                created: -1
            }
        },
        {
            $skip: 0
        },
        {
            $limit: 20
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

//SORT BY SLUG
exports.getTop = async (req) => {
    //MAKE THIS SORT BY MOST RECENT COMMENT...
	let data = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $sort: {
                created: -1
            }
        },
        {
            $skip: 0
        },
        {
            $limit: 20
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

exports.getThread = async (req, id) => {
	id = ObjectId.createFromHexString(id);

	let data = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $match: {
                _id: id
            }
        },
        pipeUser(req),
        {
            $lookup: {
                from: 'comments',
                let: {
                    threadId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$threadId', '$thread']
                            }
                        }
                    },
                    {
                        $sort: {
                            created: -1
                        }
                    },
                    {
                        $skip: 0
                    },
                    {
                        $limit: 20
                    },
                    pipeUser(req),
                    {
                        $project: {
                            _id: true,
                            content: true,
                            created: true,
                            pinned: true,
                            user: {
                                $first: '$user'
                            },
                        }
                    }
                ],
                as: 'comments'
            }
        },
        {
            $project: {
                _id: true,
                title: true,
                content: true,
                pinned: true,
                locked: true,
                views: true,
                categories: true,
                created: true,
                user: {
                    $first: '$user'
                },
                comments: true
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    data = data[0];

    return data;
};

exports.postThread = async (req, res) => {

};

exports.putThread = async (req, res, id) => {
	id = ObjectId.createFromHexString(id);

};

exports.postComment = async (req, res) => {
};

exports.putComment = async (req, res, id) => {
	id = ObjectId.createFromHexString(id);
};

exports.deleteComment = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};

exports.getComments = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};

function pipeUser(req, v = '$user'){
    return {
        $lookup: {
            from: 'users',
            let: {
                userId: v
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ['$$userId', '$_id']
                        }
                    }
                },
                {
                    $project: {
                        _id: true,
                        username: true,
                        avatar: true
                    }
                }
            ],
            as: 'user'
        }
    };
}
