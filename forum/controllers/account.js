const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
const account = require('../modules/account');
const markdown = require('../modules/markdown');
const pow = require('../modules/pow');

exports.getSignIn = async (req, res) => {
	res.render('layouts/signin', {
		title: 'Sign-In Page',
		page: 'signin',
		uniqid: uuidv4,
		styles: [
			'sign'
		],
		meta: {
			description: 'SecTorrent P2P Forum sign in page.',
			keywords: 'p2p torrent secure anonymous relay',
			path: '/signin'
		},
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
		meta: {
			description: 'SecTorrent P2P Forum sign up page.',
			keywords: 'p2p torrent secure anonymous relay',
			path: '/signup'
		},
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
		meta: {
			description: 'SecTorrent P2P Forum forgot password page.',
			keywords: 'p2p torrent secure anonymous relay',
			path: '/forgot-password'
		},
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

exports.getUserSummary = async (req, res) => {
	const username = (req.params.username) ? req.params.username : '';
	const categories = await forum.getCategoriesList();

	account.getUserSummary(req, username).then((data) => {
		if(data.bio){
			data.bio = markdown.parse(data.bio);
		}

		res.render('layouts/user/index', {
			title: 'User Page',
			page: 'user',
			uniqid: uuidv4,
			styles: [
				'user',
				'markdown'
			],
			username,
			categories,
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getUserPosts = async (req, res) => {
	const username = (req.params.username) ? req.params.username : '';
	const categories = await forum.getCategoriesList();

	account.getUserPosts(req, username).then((data) => {
		res.render('layouts/user/posts', {
			title: 'User Page',
			page: 'user',
			uniqid: uuidv4,
			styles: [
				'user',
				'table'
			],
			username,
			categories,
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getUserEdit = async (req, res) => {
	const username = (req.params.username) ? req.params.username : '';
	const categories = await forum.getCategoriesList();

	account.getUserSummary(req, username).then((data) => {
		res.render('layouts/user/edit', {
			title: 'User Page',
			page: 'user',
			uniqid: uuidv4,
			styles: [
				'user',
				'editor',
				'markdown',
				'form'
			],
			username,
			categories,
			data,
			pow: pow.generateChallenge(req, res)
		});

	}).catch(function(error){
		console.log(error);
	});
};
