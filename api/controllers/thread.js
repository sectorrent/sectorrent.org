const thread = require('../modules/thread');

exports.postThread = async (req, res) => {
    thread.postThread(req).then((data) => {
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

exports.putThread = async (req, res) => {
	const id = (req.query.id) ? req.query.id : '';
	
    thread.putThread(req, id).then((data) => {
		res.json({
			status: 200,
			status_message: 'Update was successful',
			data
		});

	}).catch(function(error){
		res.json({
			status: 400,
			status_message: error.message
		});
		res.end();
	});
};

exports.postComment = async (req, res) => {
	const id = (req.query.id) ? req.query.id : '';

    thread.postComment(req, id).then((data) => {
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

exports.putComment = async (req, res) => {
	const id = (req.query.id) ? req.query.id : '';

    thread.putComment(req, id, id).then((data) => {
		res.json({
			status: 200,
			status_message: 'Update was successful',
			data
		});

	}).catch(function(error){
		res.json({
			status: 400,
			status_message: error.message
		});
		res.end();
	});
};
