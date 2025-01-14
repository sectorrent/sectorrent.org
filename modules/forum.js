//const { ObjectId, Long } = require('mongodb');

exports.getCategoriesList = async () => {
	const data = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $sort: {
                index: 1
            }
        },
        {
            $project: {
                _id: true,
                title: true,
                slug: true,
                color: true,
                admin_only: true
            }
        }
    ]).toArray();

    const indexes = [];
    for(const category of data){
        indexes.push(category._id.toString());
    }

    return {
        indexes,
        data
    };
};

exports.getHome = async (req) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let categories = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $sort: {
                index: 1
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
        },
        {
            $lookup: {
                from: 'comments',
                let: {
                    id: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$id', '$thread']
                            }
                        }
                    },
                    {
                        $count: 'total'
                    },
                    {
                        $project: {
                            total: true
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
                archived: true,
                views: true,
                categories: true,
                created: true,
                user: true,
                comments: {
                    $ifNull: [
                        { $first: '$comments.total' },
                        0
                    ]
                }
            }
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
        },
        {
            $lookup: {
                from: 'comments',
                let: {
                    id: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$id', '$thread']
                            }
                        }
                    },
                    {
                        $count: 'total'
                    },
                    {
                        $project: {
                            total: true
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
                archived: true,
                views: true,
                categories: true,
                created: true,
                user: true,
                comments: {
                    $ifNull: [
                        { $first: '$comments.total' },
                        0
                    ]
                }
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

exports.getTop = async (req) => {
    let data = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $sort: {
                views: -1
            }
        },
        {
            $skip: 0
        },
        {
            $limit: 20
        },
        {
            $lookup: {
                from: 'comments',
                let: {
                    id: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$id', '$thread']
                            }
                        }
                    },
                    {
                        $count: 'total'
                    },
                    {
                        $project: {
                            total: true
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
                archived: true,
                views: true,
                categories: true,
                created: true,
                user: true,
                comments: {
                    $ifNull: [
                        { $first: '$comments.total' },
                        0
                    ]
                }
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

exports.getCategories = async (req) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let data = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $sort: {
                index: 1
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

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};
