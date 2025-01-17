const { ObjectId, Long } = require('mongodb');
const form = require('./form');

exports.getEditCategories = async (req) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	let data = await global.mongo.getDatabase().collection('categories').find().sort({ index: 1 }).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

exports.putCategories = async (req) => {
    let check = [
        {
            key: 'categories',
            type: 'ARRAY',
            required: true,
            min: 0,
            entries: {
                type: 'STRING',
                required: true,
                min: 2,
                max: 160,
                pattern: /^[a-zA-Z0-9]+$/
            }
        },
        {
            key: 'pow',
            type: 'OBJECT',
            required: true,
            entries: [
				{
					key: 'challenge',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 31,
					max: 64
				},
				{
					key: 'difficulty',
					type: 'NUMBER',
					required: true,
					min: 1
				},
				{
					key: 'nonce',
					type: 'NUMBER',
					required: true,
					min: 0
				},
				{
					key: 'hmac',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 63,
					max: 128
				}
			]
		}
    ];

    req.body = form.removePrototype(req.body);
    let data = form.checkForm(check, req.body);
    
    if(!pow.validateSolution(req, res, data)){
        throw Error('POW was not valid');
    }

    const updates = data.categories.map((id, index) => {
        return {
            updateOne: {
                filter: {
                    _id: ObjectId.createFromHexString(id)
                },
                update: {
                    $set: {
                        index
                    }
                }
            }
        };
    });

    const update = await global.mongo.getDatabase().collection('categories').bulkWrite(updates);

    if(update.modifiedCount < 1){
        throw new Error('Failed to update categories.');
    }

    return {
        message: 'Category order changed!'
    };
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

exports.getCategory = async (req, slug) => {
	let data = await global.mongo.getDatabase().collection('categories').aggregate([
        {
            $match: {
                slug
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
        /*
        {
            $unwind: '$threads'
        },
        {
            $replaceRoot: {
                newRoot: '$threads'
            }
        }
        */
        {
            $project: {
                _id: true,
                title: true,
                slug: true,
                description: true,
                threads: '$threads'
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(404, "Category doesn't exist.");
	}

    data = data[0];

	if(data.threads.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return data;
};

exports.getCategoryLatest = async (req, slug) => {
    let category = await global.mongo.getDatabase().collection('categories').findOne({
        slug
    });

    if(!category){
		throw new TypeError(404, "Category doesn't exist.");
    }

    let threads = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $match: {
                categories: category._id
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

	if(threads.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return {
        _id: category._id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        threads
    };
};

exports.getCategoryTop = async (req, slug) => {
	let category = await global.mongo.getDatabase().collection('categories').findOne({
        slug
    });

    if(!category){
		throw new TypeError(404, "Category doesn't exist.");
    }

    let threads = await global.mongo.getDatabase().collection('threads').aggregate([
        {
            $match: {
                categories: category._id
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

	if(threads.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    return {
        _id: category._id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        threads
    };
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
        },
        {
            key: 'pow',
            type: 'OBJECT',
            required: true,
            entries: [
				{
					key: 'challenge',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 31,
					max: 64
				},
				{
					key: 'difficulty',
					type: 'NUMBER',
					required: true,
					min: 1
				},
				{
					key: 'nonce',
					type: 'NUMBER',
					required: true,
					min: 0
				},
				{
					key: 'hmac',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 63,
					max: 128
				}
			]
		}
    ];

    req.body = form.removePrototype(req.body);
    let data = form.checkForm(check, req.body);
    
    if(!pow.validateSolution(req, res, data)){
        throw Error('POW was not valid');
    }

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

    let check = [
        {
            key: 'title',
            type: 'STRING',
			pattern: /^[a-zA-Z0-9\[\]\(\) ]+$/,
            min: 2,
            max: 160
        },
        {
            key: 'description',
            type: 'STRING',
            min: 16,
            max: 2000
        },
        {
            key: 'admin_only',
            type: 'BOOLEAN'
        },
        {
            key: 'color',
            type: 'COLOR'
        },
        {
            key: 'pow',
            type: 'OBJECT',
            required: true,
            entries: [
				{
					key: 'challenge',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 31,
					max: 64
				},
				{
					key: 'difficulty',
					type: 'NUMBER',
					required: true,
					min: 1
				},
				{
					key: 'nonce',
					type: 'NUMBER',
					required: true,
					min: 0
				},
				{
					key: 'hmac',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 63,
					max: 128
				}
			]
		}
    ];

    req.body = form.removePrototype(req.body);
    let data = form.checkForm(check, req.body);
    
    if(!pow.validateSolution(req, res, data)){
        throw Error('POW was not valid');
    }

    data.slug = data.title.toLowerCase().replace(/[\s\t]+/g, '-').replace(/[^a-z0-9\-]+/g, '');
    
    const update = await global.mongo.getDatabase().collection('categories').updateOne(
        {
            _id: id
        },
        {
            $set: data
        }
    );

    if(update.modifiedCount != 1){
        throw new Error('Failed to update category.');
    }

    return {
        message: 'Category updated!'
    };
};

exports.deleteCategory = async (req, id) => {
	id = ObjectId.createFromHexString(id);

    const categoryExists = await global.mongo.getDatabase().collection('categories').deleteOne({
        _id: id
    });

    if(categoryExists.deletedCount != 1){
        throw new Error('Failed to delete category');
    }

    return {
        message: 'Category deleted!',
        link: '/categories/edit'
    };
};
