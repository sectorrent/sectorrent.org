const { v4: uuidv4 } = require('uuid');

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