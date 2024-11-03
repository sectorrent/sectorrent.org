const { v4: uuidv4 } = require('uuid');

exports.getHome = async (req, res) => {
	res.render('layouts/home', {
		title: 'Home Page',
		page: 'home',
		uniqid: uuidv4,
		styles: [
			'main'
		]
	});
};

exports.getSignIn = async (req, res) => {
	res.render('layouts/signin', {
		title: 'Sign-In Page',
		page: 'signin',
		uniqid: uuidv4,
		styles: [
			'main'
		]
	});
};

exports.getSignUp = async (req, res) => {
	res.render('layouts/signup', {
		title: 'Sign-Up Page',
		page: 'signup',
		uniqid: uuidv4,
		styles: [
			'main'
		]
	});
};

exports.getForgotPassword = async (req, res) => {
	res.render('layouts/forgot_password', {
		title: 'Forgot Password Page',
		page: 'forgot-password',
		uniqid: uuidv4,
		styles: [
			'main'
		]
	});
};

exports.getResetPassword = async (req, res) => {
	res.render('layouts/reset_password', {
		title: 'Reset Password Page',
		page: 'reset-password',
		uniqid: uuidv4,
		styles: [
			'main'
		]
	});
};
