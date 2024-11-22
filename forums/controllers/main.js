const { v4: uuidv4 } = require('uuid');
const forums = require('../modules/forums');
const markdown = require('../modules/markdown');

exports.getHome = async (req, res) => {
	forums.getHome(req).then((data) => {
		res.render('layouts/home', {
			title: 'Home Page',
			page: 'home',
			uniqid: uuidv4,
			styles: [
				'home'
			],
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getLatest = async (req, res) => {
	forums.getLatest(req).then((data) => {
		res.render('layouts/latest', {
			title: 'Latest Page',
			page: 'latest',
			uniqid: uuidv4,
			styles: [
				'categories'
			],
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getTop = async (req, res) => {
	forums.getTop(req).then((data) => {
		res.render('layouts/top', {
			title: 'Top Page',
			page: 'top',
			uniqid: uuidv4,
			styles: [
				'categories'
			],
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getCategory = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forums.getCategory(req, slug).then((data) => {
		res.render('layouts/category', {
			title: 'Category Page',
			page: 'category',
			uniqid: uuidv4,
			styles: [
				'categories'
			],
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getNewThread = async (req, res) => {
	res.render('layouts/new_thread', {
		title: 'New Thread Page',
		page: 'new-thread',
		uniqid: uuidv4,
		styles: [
			'editor',
			'new-thread'
		]
	});
};

exports.getThread = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	
	forums.getThread(req, id).then((data) => {
		data.thread.content = markdown.parse(data.thread.content);
		
		for(const comment of data.thread.comments){
			comment.content = markdown.parse(comment.content);
		}

		res.render('layouts/thread', {
			title: 'Thread Page',
			page: 'thread',
			uniqid: uuidv4,
			styles: [
				'editor',
				'thread'
			],
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getSignIn = async (req, res) => {
	res.render('layouts/signin', {
		title: 'Sign-In Page',
		page: 'signin',
		uniqid: uuidv4,
		styles: [
			'sign'
		]
	});
};

exports.getSignUp = async (req, res) => {
	res.render('layouts/signup', {
		title: 'Sign-Up Page',
		page: 'signup',
		uniqid: uuidv4,
		styles: [
			'sign'
		]
	});
};

exports.getForgotPassword = async (req, res) => {
	res.render('layouts/forgot_password', {
		title: 'Forgot Password Page',
		page: 'forgot-password',
		uniqid: uuidv4,
		styles: [
			'sign'
		]
	});
};

exports.getResetPassword = async (req, res) => {
	res.render('layouts/reset_password', {
		title: 'Reset Password Page',
		page: 'reset-password',
		uniqid: uuidv4,
		styles: [
			'sign'
		]
	});
};

function generateCSP(){


/*
app.use((req, res, next) => {
    //const nonce = crypto.randomBytes(16).toString('base64');
	const nonce = '123123';

    res.setHeader('Content-Security-Policy', `default-src 'self' *.${config.general.domain}; style-src 'self' 'nonce-${nonce}'`);

    res.locals.nonce = nonce;
    next();
});
*/
}
