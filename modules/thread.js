const { ObjectId, Long } = require('mongodb');
const middleware = require('./middleware');
const form = require('./form');
const TypError = require('./type_error');

exports.getEditThread = async (req, id) => {
	id = ObjectId.createFromHexString(id);

	let data = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $match: {
                _id: id,
                archived: {
                    $exists: false
                }
            }
        },
        pipeUser(req),
        {
            $project: {
                _id: true,
                title: true,
                content: true,
                pinned: true,
                views: true,
                categories: true,
                created: true,
                modified: true,
                user: {
                    $first: '$user'
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
                archived: true,
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

    const update = await global.mongo.getDatabase().collection('threads').updateOne(
        {
            _id: id,
            user: middleware.getUserID(req),
            archived: {
                $exists: false
            }
        },
        {
            $set: data
        }
    );

    if(update.modifiedCount != 1){
        throw new Error('Failed to update thread.');
    }

    return {
        message: 'Thread updated!',
        link: `/t/${id.toString()}`
    };
};

exports.deleteThread = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    const match = {
        _id: id,
        archived: {
			$exists: false
		}
    };

    if(middleware.getRole(req) < 2){
        match.user = middleware.getUserID(req);
    }

    const threadExists = await global.mongo.getDatabase().collection('threads').deleteOne(match);

    if(threadExists.deletedCount != 1){
        throw new Error('Failed to delete thread');
    }

    await global.mongo.getDatabase().collection('comments').deleteMany({
        thread: id
    });

    return {
		message: 'Thread deleted!'
    };
};

exports.postThreadPin = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    await update(req, id, {
            $set: {
                pinned: true
            }
        });

    return {
        message: 'Thread pinned!',
        link: `/t/${id.toString()}`
    };
};

exports.postThreadArchive = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    await update(req, id, {
            $set: {
                archived: true
            }
        });

    return {
        message: 'Thread archived!',
        link: `/t/${id.toString()}`
    };
};

exports.deleteThreadPin = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    await update(req, id, {
            $unset: {
                pinned: true
            }
        });

    return {
        message: 'Thread unpinned!',
        link: `/t/${id.toString()}`
    };
};

exports.deleteThreadArchive = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    await update(req, id, {
            $unset: {
                archived: true
            }
        });

    return {
        message: 'Thread unarchived!',
        link: `/t/${id.toString()}`
    };
};

async function update(req, id, data){
    const match = {
        _id: id,
        archived: {
			$exists: false
		}
    };

    if(middleware.getRole(req) < 2){
        match.user = middleware.getUserID(req);
    }

    const update = await global.mongo.getDatabase().collection('threads').updateOne(match, data);

    if(update.modifiedCount != 1){
        throw new Error('Failed to update thread.');
    }
}

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
