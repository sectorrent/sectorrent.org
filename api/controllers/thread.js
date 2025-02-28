const thread = require('../modules/thread');
const pow = require('../modules/pow');

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
						fields: error.fields,
						pow: pow.generateChallenge(req)
					}
				});
				break;

			default:
				res.json({
					status: 400,
					status_message: error.message,
					data: {
						pow: pow.generateChallenge(req)
					}
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

exports.deleteThread = async (req, res) => {
	const id = (req.query.id) ? req.query.id : '';
	
    thread.deleteThread(req, id).then((data) => {
		res.json({
			status: 200,
			status_message: 'Delete was successful',
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

exports.putThreadArchive = async (req, res) => {
	const id = (req.query.id) ? req.query.id : '';
	
    thread.putThreadArchive(req, id).then((data) => {
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

exports.deleteThreadArchive = async (req, res) => {
	const id = (req.query.id) ? req.query.id : '';
	
    thread.deleteThreadArchive(req, id).then((data) => {
		res.json({
			status: 200,
			status_message: 'Delete was successful',
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
