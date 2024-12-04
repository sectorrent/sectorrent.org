const { ObjectId, Long } = require('mongodb');
const TypError = require('./type_error');
const middleware = require('./middleware');
const form = require('./form');

exports.getCategoriesList = async () => {
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
        },
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
                locked: true,
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
                            locked: true,
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
                            locked: true,
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
                            locked: true,
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
                        $facet: {
                            total: [
                                {
                                    $count: 'total'
                                }
                            ],
                            comments: [
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
                                    $sort: {
                                        created: 1
                                    }
                                },
                                pipeUser(req),
                                {
                                    $project: {
                                        _id: true,
                                        content: true,
                                        created: true,
                                        modified: true,
                                        pinned: true,
                                        user: {
                                            $first: '$user'
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            _id: 'comments',
                            total: {
                                $first: '$total.total'
                            },
                            comments: '$comments'
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
                modified: true,
                user: {
                    $first: '$user'
                },
                comments: {
                    $first: '$comments'
                }
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    data = data[0];

    return data;
};

exports.postThread = async (req) => {
    const categories = [];
    for(const category of global.categories){
        categories.push(category._id.toString());
    }

    let check = [
        {
            key: 'title',
            type: 'STRING',
            required: true,
			pattern: /^[a-zA-Z0-9\[\]\(\) ]+$/,
            min: 6,
            max: 160
        },
        {
            key: 'content',
            type: 'STRING',
            required: true,
            min: 16,
            max: 2000
        },
        {
            key: 'categories',
            type: 'ARRAY',
            required: true,
            min: 0,
            max: 4,
            entries: {
                type: 'SWITCH',
                required: true,
                entries: categories
            }
        }
    ];

    req.body = form.removePrototype(req.body);
    let data = form.checkForm(check, req.body);

    for(const [index, category] of data.categories.entries()){
        data.categories[index] = ObjectId.createFromHexString(category);
    }

    const id = new ObjectId();
    data._id = id;
    data.user = middleware.getUserID(req);
    data.views = 0;
    data.created = Long.fromNumber(Date.now());

    const result = await global.mongo.getDatabase().collection('threads').insertOne(data);
                        
    if(!result.acknowledged){
        throw new Error('Failed to add to database.');
    }
    
    return {
		message: 'Thread created!',
		link: `/t/${id.toString()}`
	};
};

exports.putThread = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    /*
    let result = await global.mongo.getDatabase().collection('threads').updateOne({
        _id: id
    }, set);

    if(result.matchedCount != 1 && result.modifiedCount != 1){
        throw new Error('Failed to update media on database');
    }
    */
};

exports.postComment = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    let check = [
        {
            key: 'content',
            type: 'STRING',
            required: true,
            min: 16,
            max: 2000
        }
    ];

    req.body = form.removePrototype(req.body);
    let data = form.checkForm(check, req.body);

    const threadExists = await global.mongo.getDatabase().collection('threads').findOne({
        _id: id,
        locked: false
    });

    if(!threadExists){
        throw new Error('Referenced thread does not exist');
    }

    data.thread = id;
    data.user = middleware.getUserID(req);
    data.created = Long.fromNumber(Date.now());

    const result = await global.mongo.getDatabase().collection('comments').insertOne(data);
    
    if(!result.acknowledged){
        throw new Error('Failed to add to database.');
    }

    return {
		message: 'Comment posted!'
	};
};

exports.putComment = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};

exports.deleteComment = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};

exports.getComments = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};

exports.getUserSummary = async (req, username) => {
	let data = await global.mongo.getDatabase().collection('users').aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $project: {
                _id: true,
                username: true,
                email: true,
                fname: true,
                lname: true,
                avatar: true,
                created: true
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    data = data[0];

    return data;
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
