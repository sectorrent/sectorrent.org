const { ObjectId, Long } = require('mongodb');
const middleware = require('./middleware');
const form = require('./form');

exports.getComment = async (req, id) => {
	id = ObjectId.createFromHexString(id);

	let data = await global.mongo.getDatabase().collection('comments').aggregate([
        {
            $match: {
                _id: id
            }
        },
        pipeUser(req),
        {
            $lookup: {
                from: 'threads',
                let: {
                    threadId: '$thread'
                },
                pipeline: [
                    {
                        $match: {
                            $and: [
                                {
                                    $expr: {
                                        $eq: ['$$threadId', '$_id']
                                    }
                                },
                                {
                                    archived: {
                                        $exists: false
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project: {
                            _id: true,
                            title: true,
                            categories: true,
                            created: true,
                            modified: true
                        }
                    }
                ],
                as: 'thread'
            }
        },
        {
            $project: {
                _id: true,
                content: true,
                created: true,
                modified: true,
                pinned: true,
                user: {
                    $first: '$user'
                },
                thread: {
                    $first: '$thread'
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
		archived: {
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
                            archived: true
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

    if(commentExists[0].thread.archived){
        throw new Error('Referenced thread is archived');
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
        throw new Error('Failed to update comment.');
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
        archived: {
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
                        avatar: true,
                        role: true
                    }
                }
            ],
            as: 'user'
        }
    };
}
