const { v4: uuidv4 } = require('uuid');
//const pow = require('../modules/pow');

exports.getEditCategories = async (req, res) => {
	res.render('layouts/edit_categories', {
		title: 'Categories Page',
		page: 'categories',
		uniqid: uuidv4,
		styles: [
		]
	});
};
