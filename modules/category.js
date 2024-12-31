const { ObjectId, Long } = require('mongodb');
const form = require('./form');

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

exports.postCategory = async (req) => {
    let check = [
        {
            key: 'title',
            type: 'STRING',
            required: true,
			pattern: /^[a-zA-Z0-9\[\]\(\) ]+$/,
            min: 2,
            max: 160
        },
        {
            key: 'description',
            type: 'STRING',
            required: true,
            min: 16,
            max: 2000
        },
        {
            key: 'admin_only',
            type: 'BOOLEAN',
            required: true
        },
        {
            key: 'color',
            type: 'COLOR',
            required: true
        }
    ];

    req.body = form.removePrototype(req.body);
    let data = form.checkForm(check, req.body);

    data.slug = data.title.toLowerCase().replace(/[\s\t]+/g, '-').replace(/[^a-z0-9\-]+/g, '');

    const result = await global.mongo.getDatabase().collection('categories').insertOne(data);
                        
    if(!result.acknowledged){
        throw new Error('Failed to add to database.');
    }

    return {
        message: 'Category created!',
        link: `/c/${data.slug}/edit`
    };
};

exports.putCategory = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};

exports.deleteCategory = async (req, id) => {
	id = ObjectId.createFromHexString(id);
};
