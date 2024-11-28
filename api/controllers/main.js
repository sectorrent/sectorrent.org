const forums = require('../modules/forums');

exports.postThread = async (req, res) => {
    forums.postThread(req).then((data) => {
        console.log(data);
		res.json({
			status: 200,
			status_message: 'Insert was successful',
			data: data
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
