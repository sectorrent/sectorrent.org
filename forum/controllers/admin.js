const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
//const pow = require('../modules/pow');

exports.getEditCategories = async (req, res) => {
	forum.getEditCategories(req).then((data) => {
		res.render('layouts/admin/categories', {
			title: 'Categories Page',
			page: 'edit-categories',
			uniqid: uuidv4,
			styles: [
				'categories_edit'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
		/*
		res.render('layouts/error/empty_home', {
			title: 'Home Page',
			page: `home`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			type: 'categories',
			categories: global.categories
		});
		*/
	});
};
