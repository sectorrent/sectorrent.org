const { ObjectId } = require('mongodb');
const TypError = require('./type_error');

exports.getHome = async (req) => {
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
                            threads: {
                                $size: '$threads'
                            }
                        }
                    }
                ]
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

	if(data.length < 1 || latest.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}
    
    data = data[0];
    data.latest = latest;

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

//SORT BY SLUG
exports.getLatest = async (req) => {
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

	let threads = await global.mongo.getDatabase().collection('threads').aggregate([
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

	if(threads.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return {
        categories,
        threads
    };
};

//SORT BY SLUG
exports.getTop = async (req) => {
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

    //MAKE THIS SORT BY MOST RECENT COMMENT...
	let threads = await global.mongo.getDatabase().collection('threads').aggregate([
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

	if(threads.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return {
        categories,
        threads
    };
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
