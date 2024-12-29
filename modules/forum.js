//const { ObjectId, Long } = require('mongodb');

exports.getCategoriesList = async () => {
	const data = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $project: {
                _id: true,
                title: true,
                slug: true,
                color: true,
                is_admin: true
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
                            modified: true,
                            user: true,
                            comments: {
                                $ifNull: [
                                    { $first: '$comments.total' },
                                    0
                                ]
                            }
                        }
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

exports.getLatest = async (req, slug) => {
    let match = {};

    if(slug){
        match.slug = slug;
    }

	let data = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $match: match
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
                            modified: true,
                            user: true,
                            comments: {
                                $ifNull: [
                                    { $first: '$comments.total' },
                                    0
                                ]
                            }
                        }
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
        },
        {
            $sort: {
                created: -1
            }
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

exports.getTop = async (req, slug) => {
    let match = {};

    if(slug){
        match.slug = slug;
    }

	let data = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $match: match
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
                            modified: true,
                            user: true,
                            comments: {
                                $ifNull: [
                                    { $first: '$comments.total' },
                                    0
                                ]
                            }
                        }
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
        },
        {
            $sort: {
                views: -1
            }
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

exports.getEditCategory = async (req, slug) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let data = await global.mongo.getDatabase().collection('categories').findOne({
        slug
    });

	if(!data){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

exports.getEditCategories = async (req) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let data = await global.mongo.getDatabase().collection('categories').find().toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};
