const account = require('../modules/account');

exports.postSignIn = async (req, res) => {
	account.signIn(req, res).then((data) => {
		res.json({
			status: 200,
			status_message: 'Query was successful',
			data
		});

	}).catch(function(error){
		switch(error.name){
			case 'FieldError':
				res.json({
					status: 417,
					status_message: error.message,
					data: {
						fields: error.fields
					}
				});
				break;

			default:
				res.json({
					status: 400,
					status_message: error.message
				});
				break;
		}
		res.end();
	});
};

exports.postSignUp = async (req, res) => {
	account.signUp(req, res).then((data) => {
		res.json({
			status: 200,
			status_message: 'Insert was successful',
			data
		});

	}).catch(function(error){
		switch(error.name){
			case 'FieldError':
				res.json({
					status: 417,
					status_message: error.message,
					data: {
						fields: error.fields
					}
				});
				break;

			default:
				res.json({
					status: 400,
					status_message: error.message
				});
				break;
		}
		res.end();
	});
};

exports.getSignOut = async (req, res) => {
	await account.signOut(req, res);
};

exports.postForgotPassword = (req, res) => {
	account.forgotPassword(req, res).then((data) => {
		res.json({
			status: 200,
			status_message: 'Query was successful',
			data
		});

	}).catch(function(error){
		switch(error.name){
			case 'FieldError':
				res.json({
					status: 417,
					status_message: error.message,
					data: {
						fields: error.fields
					}
				});
				break;

			default:
				res.json({
					status: 400,
					status_message: error.message
				});
				break;
		}
		res.end();
	});
};

exports.putResetPassword = (req, res) => {
	const id = (req.query.id) ? req.query.id : '';
	
	account.resetPassword(req, res, id).then((data) => {
		res.json({
			status: 200,
			status_message: 'Update was successful',
			data
		});

	}).catch(function(error){
		switch(error.name){
			case 'FieldError':
				res.json({
					status: 417,
					status_message: error.message,
					data: {
						fields: error.fields
					}
				});
				break;

			default:
				res.json({
					status: 400,
					status_message: error.message
				});
				break;
		}
		res.end();
	});
};
