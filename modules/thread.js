const { ObjectId, Long } = require('mongodb');
const middleware = require('./middleware');
const form = require('./form');

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

    global.mongo.getDatabase().collection('threads').updateOne(
        {
            _id: id
        },
        {
            $inc: {
                views: 1
            }
        }
    );

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
    data.modified = data.created;

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

    data.modified = Long.fromNumber(Date.now());

    const update = await global.mongo.getDatabase().collection('thread').updateOne(
        {
            _id: id,
            user: middleware.getUserID(req),
            locked: {
                $exists: false
            }
        },
        {
            $set: data
        }
    );

    if(update.modifiedCount != 1){
        throw new Error('Failed to add to update thread.');
    }

    return {
        message: 'Thread updated!'
    };
};

exports.deleteThread = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    const threadExists = await global.mongo.getDatabase().collection('threads').deleteOne({
        _id: id,
        user: middleware.getUserID(req),
        locked: {
			$exists: false
		}
    });

    if(threadExists.deletedCount != 1){
        throw new Error('Failed to delete thread');
    }

    return {
		message: 'Thread deleted!'
    };
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
		locked: {
			$exists: false
		}
    });

    if(!threadExists){
        throw new Error('Referenced thread does not exist');
    }

    data.thread = id;
    data.user = middleware.getUserID(req);
    data.created = Long.fromNumber(Date.now());
    data.modified = data.created;

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

    data.modified = Long.fromNumber(Date.now());

	let commentExists = await global.mongo.getDatabase().collection('comments').aggregate([
        {
            $match: {
                _id: id,
                user: middleware.getUserID(req)
            }
        },
        {
            $lookup: {
                from: 'threads',
                let: {
                    id: '$thread'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$id', '$_id']
                            }
                        }
                    },
                    {
                        $project: {
                            locked: true
                        }
                    }
                ],
                as: 'threads'
            }
        },
        {
            $project: {
                _id: true,
                content: true,
                created: true,
                modified: true,
                pinned: true,
                thread: {
                    $first: '$threads'
                }
            }
        }
    ]).toArray();

	if(commentExists.length < 1){
        throw new Error('Referenced comment or thread does not exist');
	}

    if(commentExists[0].thread.locked){
        throw new Error('Referenced thread is locked');
    }

    const update = await global.mongo.getDatabase().collection('comments').updateOne(
        {
            _id: id,
            user: middleware.getUserID(req)
        },
        {
            $set: data
        }
    );

    if(update.modifiedCount != 1){
        throw new Error('Failed to add to update comment.');
    }

    return {
        message: 'Comment updated!'
    };
};

exports.deleteComment = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    const commentExists = await global.mongo.getDatabase().collection('comments').deleteOne({
        _id: id,
		user: middleware.getUserID(req),
        locked: {
			$exists: false
		}
    });

    if(commentExists.deletedCount != 1){
        throw new Error('Failed to delete comment');
    }

    return {
		message: 'Comment deleted!'
    };
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
