const { v4: uuidv4 } = require('uuid');
const account = require('../modules/account');
const pow = require('../modules/pow');

exports.getSignIn = async (req, res) => {
	res.render('layouts/signin', {
		title: 'Sign-In Page',
		page: 'signin',
		uniqid: uuidv4,
		styles: [
			'sign'
		],
		pow: pow.generateChallenge(req, res)
	});
};

exports.getSignUp = async (req, res) => {
	res.render('layouts/signup', {
		title: 'Sign-Up Page',
		page: 'signup',
		uniqid: uuidv4,
		styles: [
			'sign'
		],
		pow: pow.generateChallenge(req, res)
	});
};

exports.getForgotPassword = async (req, res) => {
	res.render('layouts/forgot_password', {
		title: 'Forgot Password Page',
		page: 'forgot-password',
		uniqid: uuidv4,
		styles: [
			'sign'
		],
		pow: pow.generateChallenge(req, res)
	});
};

exports.getResetPassword = async (req, res) => {
	res.render('layouts/reset_password', {
		title: 'Reset Password Page',
		page: 'reset-password',
		uniqid: uuidv4,
		styles: [
			'sign'
		],
		pow: pow.generateChallenge(req, res)
	});
};

exports.getUser = async (req, res) => {
	const username = (req.params.username) ? req.params.username : '';

	account.getUserSummary(req, username).then((data) => {
		res.render('layouts/user/index', {
			title: 'User Page',
			page: 'user',
			uniqid: uuidv4,
			styles: [
				'user'
			],
			username,
			categories: global.categories,
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};
