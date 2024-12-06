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
			key: 'trap',
			type: 'BOOLEAN',
			required: true,
			match: false
		},
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
					key: 'nonce',
					type: 'NUMBER',
					required: true,
					min: 0
				},
				{
					key: 'hash',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 60,
					max: 94
				}
			]
		}
    ];

    req.body = form.checkForm(check, form.removePrototype(req.body));

	if(!pow.validateSolution(req, res.locals.config, req.body.pow)){
		throw Error('POW was not valid');
	}

/*
	if(typeof req.cookies.captcha == 'undefined' || !req.cookies.captcha){
		throw new Error('No captcha found.');
	}

	if(crypto.createHmac('sha256', res.locals.config.token.captcha).update(req.body.captcha.toLowerCase()).digest('hex') != req.cookies.captcha){
		throw new Error('Captcha is invalid.');
	}
*/
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
	res.locals.config.token.secret+jwt.generateOTP(data.password, parseInt(expires/60)));

	res.cookie('token', token, {
		maxAge: expires,
		path: '/',
		domain: '.'+res.locals.config.general.domain,
		httpOnly: true,
		//secure: true
	});

	req.session.signature = token.split('.')[2];
	req.session.secret = data.password;

	/*
	const ip = session.getUserIP(req);

	session.getLocation(req, ip).then(async (location) => {
		const device = session.getSystemInfo(req);

		global.mongo.getDatabase().collection('sessions').insertOne(
			{
				user: data._id,
				ip: ip,
				code: location.code,
				country: location.country,
				os: device.os,
				browser: device.browser,
				created: Long.fromNumber(Date.now())
			}
		);

		ejs.renderFile('./emails/new_signin.ejs', {
			config: res.locals.config,
			data: {
				ip: ip,
				code: location.code,
				country: location.country,
				os: device.os,
				browser: device.browser
			}
		}).then((content) => {
			mailer.mail(res.locals.config.mailer, {
				name: res.locals.config.general.project_name,
				email: req.body.email,
				to_name: data.fname+' '+data.lname,
				subject: 'New Sign-in',
				content: content
			});
		});
	});
	*/

	return {
		message: 'Signed in!',
		link: '/profile'
	};
};

exports.signUp = async (req, res) => {
    let check = [
		{
			key: 'trap',
			type: 'BOOLEAN',
			required: true,
			match: false
		},
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
					key: 'nonce',
					type: 'NUMBER',
					required: true,
					min: 0
				},
				{
					key: 'hash',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 60,
					max: 94
				}
			]
		}/*,
		{
            key: 'captcha',
            type: 'STRING',
			required: true,
			pattern: /^[a-zA-Z0-9]+$/,
            min: 2,
            max: 10
		}*/
    ];

    req.body = form.checkForm(check, form.removePrototype(req.body));
	
	if(!pow.validateSolution(req, res.locals.config, req.body.pow)){
		throw Error('POW was not valid');
	}
/*
	if(typeof req.cookies.captcha == 'undefined' || !req.cookies.captcha){
		throw new Error('No captcha found.');
	}

	if(crypto.createHmac('sha256', res.locals.config.token.captcha).update(req.body.captcha.toLowerCase()).digest('hex') != req.cookies.captcha){
		throw new Error('Captcha is invalid.');
	}
*/
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
	
		if(res.locals.config.database.replica_set){
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
		res.locals.config.token.secret+jwt.generateOTP(password, parseInt(expires/60)));
	
		res.cookie('token', token, {
			maxAge: expires,
			path: '/',
			domain: '.'+res.locals.config.general.domain,
			httpOnly: true,
			//secure: true
		});
	
		req.session.signature = token.split('.')[2];
		req.session.secret = password;
	
		/*
		const ip = session.getUserIP(req);
	
		session.getLocation(req, ip).then(async (location) => {
			const device = session.getSystemInfo(req);
	
			global.mongo.getDatabase().collection('sessions').insertOne(
				{
					user: id,
					ip: ip,
					code: location.code,
					country: location.country,
					os: device.os,
					browser: device.browser,
					created: Long.fromNumber(Date.now())
				}
			);
	
			ejs.renderFile('./emails/signup.ejs', {
				config: res.locals.config
			}).then((content) => {
				mailer.mail(res.locals.config.mailer, {
					name: res.locals.config.general.project_name,
					email: req.body.email,
					to_name: data.fname+' '+data.lname,
					subject: 'Sign-up',
					content: content
				});
			});
		});
		*/
	
		return {
			message: 'Signed up!',
			link: '/'
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
		}).cookie('token', '', { path: '/', domain: '.'+res.locals.config.general.domain, maxAge: 0 })
		.cookie('profile', '', { path: '/', domain: '.'+res.locals.config.general.domain, maxAge: 0 })
		.cookie('connect.sid', '', { path: '/', domain: '.'+res.locals.config.general.domain, maxAge: 0 });
		
		res.end();
    });
};

exports.forgotPassword = async (req, res) => {
    let check = [
		{
			key: 'trap',
			type: 'BOOLEAN',
			required: true,
			match: false
		},
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
					key: 'nonce',
					type: 'NUMBER',
					required: true,
					min: 0
				},
				{
					key: 'hash',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 60,
					max: 94
				}
			]
		}
    ];

    req.body = form.checkForm(check, form.removePrototype(req.body));
	
	if(!pow.validateSolution(req, res.locals.config, req.body.pow)){
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
		config: res.locals.config,
		data: {
			id: data._id.toString(),
			otp: otp,
			expires: expires
		}
	}).then(async (content) => {
		mailer.mail(res.locals.config.mailer, {
			name: res.locals.config.general.project_name,
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
			key: 'trap',
			type: 'BOOLEAN',
			required: true,
			match: false
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
					key: 'nonce',
					type: 'NUMBER',
					required: true,
					min: 0
				},
				{
					key: 'hash',
					type: 'STRING',
					required: true,
					pattern: /^[a-zA-Z0-9]+$/,
					min: 60,
					max: 94
				}
			]
		}
    ];

    req.body = form.checkForm(check, form.removePrototype(req.body));

	if(req.body.expires+15 < parseInt((Date.now()/1000)/60)){
		throw new Error('Reset link is invalid.');
	}

	if(!pow.validateSolution(req, res.locals.config, req.body.pow)){
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
	res.locals.config.token.secret+jwt.generateOTP(password, parseInt(expires/60)));

	res.cookie('token', token, {
		maxAge: expires,
		path: '/',
		domain: '.'+res.locals.config.general.domain,
		httpOnly: true,
		//secure: true
	});

	req.session.signature = token.split('.')[2];
	req.session.secret = password;

	/*
	const ip = session.getUserIP(req);

	session.getLocation(req, ip).then(async (location) => {
		const device = session.getSystemInfo(req);

		global.mongo.getDatabase().collection('sessions').insertOne(
			{
				user: data._id,
				ip: ip,
				code: location.code,
				country: location.country,
				os: device.os,
				browser: device.browser,
				created: Long.fromNumber(Date.now())
			}
		);

		ejs.renderFile('./emails/password_changed.ejs', {
			config: res.locals.config,
			data: {
				ip: ip,
				code: location.code,
				country: location.country,
				os: device.os,
				browser: device.browser
			}
		}).then((content) => {
			mailer.mail(res.locals.config.mailer, {
				name: res.locals.config.general.project_name,
				email: data.email,
				to_name: data.fname+' '+data.lname,
				subject: 'Password Changed',
				content: content
			});
		});
	});
	*/

	return {
		message: 'Changes saved.',
		link: '/'
	};
};

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
	res.locals.config.token.secret+jwt.generateOTP(current.password, parseInt(expires/60)));

	res.cookie('token', token, {
		maxAge: expires,
		path: '/',
		domain: '.'+res.locals.config.general.domain,
		httpOnly: true,
		//secure: true
	});

	req.session.signature = token.split('.')[2];
	req.session.secret = current.password;

    return {
        message: 'Changes saved!'
    };
};
