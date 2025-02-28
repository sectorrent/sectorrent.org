const { ObjectId, Long } = require('mongodb');
const jwt = require('./jwt');
const bcrypt = require('bcryptjs');
const FieldError = require('./field_error');
//const session = require('./session');
const mailer = require('./mailer');
const middleware = require('./middleware');
const form = require('./form');
const pow = require('./pow');
const ejs = require('ejs');

exports.signIn = async (req, res) => {
    let check = [
        {
            key: 'email',
            type: 'EMAIL',
			required: true,
            min: 5,
            max: 64
        },
        {
            key: 'password',
            type: 'STRING',
			required: true,
            min: 6,
            max: 51
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

    req.body = form.checkForm(check, form.removePrototype(req.body));

	if(!pow.validateSolution(req, req.body.pow)){
		throw Error('POW was not valid');
	}

	req.body.email = req.body.email.toLowerCase().trim();

	const data = await global.mongo.getDatabase().collection('users').findOne(
		{
			email: req.body.email
		},
		{
			projection: {
				_id: true,
				username: true,
				fname: true,
				lname: true,
				password: true,
				role: true
			}
		}
	);

	if(!data){
		throw new FieldError([
			{
				type: 'email',
				message: "Email doesn't exist."
			}
		]);
	}

	if(!(await bcrypt.compare(req.body.password, data.password))){
		throw new FieldError([
			{
				type: 'password',
				message: 'Password is invalid.'
			}
		]);
	}
	
	const expires = parseInt((Date.now()/1000)+(60*60*24*30));
	const token = jwt.generate({
		alg: 'HS256',
		typ: 'jwt'
	},
	{
		id: data._id.toString(),
		usage: {
			type: 'ANY'
		},
		data: {
			email: req.body.email,
			username: data.username,
			fname: data.fname,
			lname: data.lname,
			role: (data.role) ? data.role : 0
		},
		exp: expires
	},
	process.env.SECRET_TOKEN+jwt.generateOTP(data.password, parseInt(expires/60)));

	res.cookie('token', token, {
		maxAge: expires,
		path: '/',
		domain: '.'+process.env.DOMAIN,
		httpOnly: true,
		//secure: true
	});

	req.session.signature = token.split('.')[2];
	req.session.secret = data.password;

	return {
		message: 'Signed in!',
		link: `/`
	};
};

exports.signUp = async (req, res) => {
    let check = [
        {
            key: 'email',
            type: 'EMAIL',
			required: true,
            min: 5,
            max: 64
        },
        {
            key: 'username',
            type: 'STRING',
			required: true,
			pattern: /^[a-zA-Z0-9_]+$/,
            min: 2,
            max: 64
        },
        {
            key: 'fname',
            type: 'STRING',
			required: true,
			pattern: /^[a-zA-Z0-9]+$/,
            min: 2,
            max: 51
        },
        {
            key: 'lname',
            type: 'STRING',
			required: true,
			pattern: /^[a-zA-Z0-9]+$/,
            min: 2,
            max: 51
        },
        {
            key: 'password',
            type: 'STRING',
			required: true,
            min: 6,
            max: 51
        },
        {
            key: 'rpassword',
            type: 'STRING',
			required: true,
            min: 6,
            max: 51
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

    req.body = form.checkForm(check, form.removePrototype(req.body));
	
	if(!pow.validateSolution(req, req.body.pow)){
		throw Error('POW was not valid');
	}

	if(req.body.password != req.body.rpassword){
		throw new FieldError([
			{
				type: 'password',
				message: "Passwords don't match"
			},
			{
				type: 'rpassword',
				message: "Passwords don't match"
			}
		]);
	}

	req.body.email = req.body.email.toLowerCase().trim();

	const msession = global.mongo.getClient().startSession();

	try{
        msession.startTransaction();
	
		const id = new ObjectId();
		const password = await bcrypt.hash(req.body.password, 13);
	
		if(process.env.DB_REPLICA){
			let data = await global.mongo.getDatabase().collection('users').insertOne(
				{
					_id: id,
					email: req.body.email,
					username: req.body.username,
					fname: req.body.fname,
					lname: req.body.lname,
					password: password,
					created: Long.fromNumber(Date.now())
				},
				{
					msession
				}
			);
		
			if(!data.acknowledged){
				throw new Error('Failed to create account.');
			}
	
			await msession.commitTransaction();

		}else{
			let data = await global.mongo.getDatabase().collection('users').insertOne(
				{
					_id: id,
					email: req.body.email,
					username: req.body.username,
					fname: req.body.fname,
					lname: req.body.lname,
					password: password,
					created: Long.fromNumber(Date.now())
				}
			);
		
			if(!data.acknowledged){
				throw new Error('Failed to create account.');
			}
		}
	
		const expires = parseInt((Date.now()/1000)+(60*60*24*30));
		const token = jwt.generate({
			alg: 'HS256',
			typ: 'jwt'
		},
		{
			id: id.toString(),
			usage: {
				type: 'ANY'
			},
			data: {
				email: req.body.email,
				username: req.body.username,
				fname: req.body.fname,
				lname: req.body.lname,
				role: 0
			},
			exp: expires
		},
		process.env.SECRET_TOKEN+jwt.generateOTP(password, parseInt(expires/60)));
	
		res.cookie('token', token, {
			maxAge: expires,
			path: '/',
			domain: '.'+process.env.SECRET_TOKEN,
			httpOnly: true,
			//secure: true
		});
	
		req.session.signature = token.split('.')[2];
		req.session.secret = password;
	
		return {
			message: 'Signed up!',
			link: `/u/${req.body.username}/edit`
		};

	}catch(error){
        await msession.abortTransaction();
        throw error;

	}finally{
		msession.endSession();
	}
};

exports.signOut = async (req, res) => {
	req.session.destroy((err) => {
		if(err){
			return res.status(500).json({
				status: 500,
				status_message: 'Internal Server Error'
			});
		}
		
		res.status(200).json({
			status: 403,
			status_message: 'Forbidden'
		}).cookie('token', '', { path: '/', domain: '.'+process.env.DOMAIN, maxAge: 0 })
		.cookie('profile', '', { path: '/', domain: '.'+process.env.DOMAIN, maxAge: 0 })
		.cookie('connect.sid', '', { path: '/', domain: '.'+process.env.DOMAIN, maxAge: 0 });
		
		res.end();
    });
};

exports.forgotPassword = async (req, res) => {
    let check = [
        {
            key: 'email',
            type: 'EMAIL',
			required: true,
            min: 5,
            max: 64
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

    req.body = form.checkForm(check, form.removePrototype(req.body));
	
	if(!pow.validateSolution(req, req.body.pow)){
		throw Error('POW was not valid');
	}

	const data = await global.mongo.getDatabase().collection('users').findOne(
		{
			email: req.body.email
		},
		{
			projection: {
				_id: true,
				fname: true,
				lname: true,
				password: true
			}
		}
	);

	if(!data){
		throw new FieldError([
			{
				type: 'email',
				message: "Email doesn't exist."
			}
		]);
	}

	const expires = parseInt((Date.now()/1000)/60);
	const otp = jwt.generateOTP(data.password, expires);

	ejs.renderFile('./emails/reset_password.ejs', {
		data: {
			id: data._id.toString(),
			otp: otp,
			expires: expires
		}
	}).then(async (content) => {
		mailer.mail({
			name: process.env.PROJECT_NAME,
			email: req.body.email,
			to_name: data.fname+' '+data.lname,
			subject: 'Reset Password',
			content: content
		});
	});

	return {
		message: 'Password reset email sent!',
		link: '/'
	};
};

exports.resetPassword = async (req, res, id) => {
	id = ObjectId.createFromHexString(id);

    let check = [
        {
            key: 'password',
            type: 'STRING',
			required: true,
            min: 6,
            max: 51
        },
        {
            key: 'rpassword',
            type: 'STRING',
			required: true,
            min: 6,
            max: 51
        },
		{
			key: 'code',
            type: 'STRING',
            pattern: /^[a-zA-Z0-9]+$/,
            min: 5,
            max: 7
		},
		{
			key: 'expires',
			type: 'NUMBER'
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

    req.body = form.checkForm(check, form.removePrototype(req.body));

	if(req.body.expires+15 < parseInt((Date.now()/1000)/60)){
		throw new Error('Reset link is invalid.');
	}

	if(!pow.validateSolution(req, req.body.pow)){
		throw Error('POW was not valid');
	}

	const data = await global.mongo.getDatabase().collection('users').findOne(
		{
			_id: id
		},
		{
			projection: {
				_id: true,
				email: true,
				username: true,
				fname: true,
				lname: true,
				password: true,
				role: true
			}
		}
	);

	if(!data){
		throw new Error('Reset link is invalid.');
	}

	const otp = jwt.generateOTP(data.password, req.body.expires);

	if(otp != req.body.code){
		throw new Error('Reset link is invalid.');
	}

	const password = await bcrypt.hash(req.body.password, 13);

	const update = await global.mongo.getDatabase().collection('users').updateOne(
		{
			_id: id
		},
		{
			$set: {
				password: password
			}
		}
	);

	if(update.modifiedCount != 1){
		throw new Error('Unable to save to DB');
	}
	
	const expires = parseInt((Date.now()/1000)+(60*60*24*30));
	const token = jwt.generate({
		alg: 'HS256',
		typ: 'jwt'
	},
	{
		id: id.toString(),
		usage: {
			type: 'ANY'
		},
		data: {
			email: req.body.email,
			username: data.username,
			fname: data.fname,
			lname: data.lname,
			role: (data.role) ? data.role : 0
		},
		exp: expires
	},
	process.env.SECRET_TOKEN+jwt.generateOTP(password, parseInt(expires/60)));

	res.cookie('token', token, {
		maxAge: expires,
		path: '/',
		domain: '.'+process.env.DOMAIN,
		httpOnly: true,
		//secure: true
	});

	req.session.signature = token.split('.')[2];
	req.session.secret = password;

	return {
		message: 'Changes saved.',
		link: '/'
	};
};

/*
exports.getAccount = async (req) => {
	const data = await global.mongo.getDatabase().collection('users').findOne(
		{
			_id: middleware.getUserID(req)
		},
		{
			projection: {
				_id: true,
				email: true,
				username: true,
				fname: true,
				lname: true
			}
		}
	);

	if(!data){
		throw new Error('User was not found.');
	}

	return data;
};

exports.setAccount = async (req, res) => {
	const id = middleware.getUserID(req);

	const current = await global.mongo.getDatabase().collection('users').findOne(
		{
			_id: id
		},
		{
			projection: {
				_id: true,
				email: true,
				username: true,
				fname: true,
				lname: true,
				password: true,
				role: true
			}
		}
	);

	if(!current){
		throw new Error('User was not found.');
	}

    let check = [
        {
            key: 'email',
            type: 'EMAIL',
            min: 5,
            max: 64
        },
        {
            key: 'username',
            type: 'STRING',
			required: true,
			pattern: /^[a-zA-Z0-9_]+$/,
            min: 2,
            max: 64
        },
        {
            key: 'fname',
            type: 'STRING',
			pattern: /^[a-zA-Z0-9]+$/,
            min: 2,
            max: 51
        },
        {
            key: 'lname',
            type: 'STRING',
			pattern: /^[a-zA-Z0-9]+$/,
            min: 2,
            max: 51
        }
    ];

    req.body = form.checkForm(check, form.removePrototype(req.body));

    const update = {};

    for(const c of check){
        if(!req.body[c.key]){
            continue;
        }

        switch(c.type){
            case 'EMAIL':
            case 'STRING':
                if(current[c.key] != req.body[c.key]){
                    update[c.key] = req.body[c.key];
                }
                break;
        }
    }

    if(Object.keys(update).length < 1){
        throw new Error("You haven't made any changes.");
    }

	const result = await global.mongo.getDatabase().collection('users').updateOne(
		{
			_id: id
		},
		{
			$set: update
		}
	);

	if(result.modifiedCount != 1){
		throw new Error('Unable to save to DB');
	}

	const expires = parseInt((Date.now()/1000)+(60*60*24*30));
	const token = jwt.generate({
		alg: 'HS256',
		typ: 'jwt'
	},
	{
		id: id.toString(),
		usage: {
			type: 'ANY'
		},
		data: {
			email: (update.email) ? update.email : current.email,
			username: (update.username) ? update.email : current.username,
			fname: (update.fname) ? update.fname : current.fname,
			lname: (update.lname) ? update.lname : current.lname,
			role: (current.role) ? current.role : 0
		},
		exp: expires
	},
	process.env.SECRET_TOKEN+jwt.generateOTP(current.password, parseInt(expires/60)));

	res.cookie('token', token, {
		maxAge: expires,
		path: '/',
		domain: '.'+process.env.DOMAIN,
		httpOnly: true,
		//secure: true
	});

	req.session.signature = token.split('.')[2];
	req.session.secret = current.password;

    return {
        message: 'Changes saved!'
    };
};
*/

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
                created: true,
				role: true,
				bio: true
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    data = data[0];

    return data;
};

exports.putUser = async (req, res) => {
    let check = [
        {
            key: 'email',
            type: 'EMAIL',
			required: true,
            min: 5,
            max: 64
        },
        {
            key: 'username',
            type: 'STRING',
			required: true,
			pattern: /^[a-zA-Z0-9_]+$/,
            min: 2,
            max: 64
        },
        {
            key: 'bio',
            type: 'STRING',
			required: true,
            min: 16,
            max: 2000
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

    req.body = form.checkForm(check, form.removePrototype(req.body));

	if(!pow.validateSolution(req, req.body.pow)){
		throw Error('POW was not valid');
	}

	delete req.body.pow;

	req.body.email = req.body.email.toLowerCase().trim();

	const result = await global.mongo.getDatabase().collection('users').updateOne(
		{
			_id: middleware.getUserID(req)
		},
		{
			$set: req.body
		}
	);

	if(result.modifiedCount != 1){
		throw new Error('Unable to save to DB');
	}

	const expires = parseInt((Date.now()/1000)+(60*60*24*30));
	const token = jwt.generate({
		alg: 'HS256',
		typ: 'jwt'
	},
	{
		id: middleware.getUserID(req),
		usage: {
			type: 'ANY'
		},
		data: {
			email: req.body.email,
			username: req.body.username,
			fname: middleware.getFirstName(req),
			lname: middleware.getLastName(req),
			role: middleware.getRole(req)
		},
		exp: expires
	},
	process.env.SECRET_TOKEN+jwt.generateOTP(req.session.secret, parseInt(expires/60)));

	res.cookie('token', token, {
		maxAge: expires,
		path: '/',
		domain: '.'+process.env.DOMAIN,
		httpOnly: true,
		//secure: true
	});

	req.session.signature = token.split('.')[2];

	return {
		message: 'Changes saved!'
	};
};

exports.getUserPosts = async (req, username) => {
	let data = await global.mongo.getDatabase().collection('users').aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $lookup: {
                from: 'threads',
                let: {
                    userId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$$userId', '$user']
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
            $project: {
                _id: true,
                username: true,
                email: true,
                fname: true,
                lname: true,
                avatar: true,
                created: true,
				role: true,
				threads: '$threads'
            }
        }
    ]).toArray();

	if(data.length < 1){
		throw new TypeError(204, 'DB found no enteries...');
	}

    data = data[0];

    return data;
};
