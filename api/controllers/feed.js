const forum = require('../modules/forum');

exports.getHome = async (req, res) => {
	forum.getHome(req).then((data) => {
        res.json({
            status: 200,
            status_message: 'Query was successful',
            data
        });

	}).catch(function(error){
		console.log(error);
	});
};

exports.getLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	forum.getLatest(req).then((data) => {
        res.json({
            status: 200,
            status_message: 'Query was successful',
            data
        });

	}).catch(function(error){
		console.log(error);
	});
};

exports.getTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	forum.getTop(req).then((data) => {
        res.json({
            status: 200,
            status_message: 'Query was successful',
            data
        });

	}).catch(function(error){
		console.log(error);
	});
};

exports.getCategory = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forum.getCategory(req, slug).then((data) => {
        res.json({
            status: 200,
            status_message: 'Query was successful',
            data
        });

	}).catch(function(error){
		console.log(error);
	});
};

exports.getCategoryLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forum.getLatest(req, slug).then((data) => {
        res.json({
            status: 200,
            status_message: 'Query was successful',
            data
        });

	}).catch(function(error){
		console.log(error);
	});
};

exports.getCategoryTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forum.getTop(req, slug).then((data) => {
        res.json({
            status: 200,
            status_message: 'Query was successful',
            data
        });

	}).catch(function(error){
		console.log(error);
	});
};

exports.getCategories = async (req, res) => {
	forum.getCategories(req).then((data) => {
        res.json({
            status: 200,
            status_message: 'Query was successful',
            data
        });

	}).catch(function(error){
		console.log(error);
	});
};
