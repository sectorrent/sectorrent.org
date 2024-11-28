const { ObjectId, Long } = require('mongodb');
const TypError = require('./type_error');
const middleware = require('./middleware');
const form = require('./form');

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
                            created: 1
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
