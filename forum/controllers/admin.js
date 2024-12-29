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
				'categories'
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

exports.getNewCategory = async (req, res) => {
	res.render('layouts/admin/categories/new', {
		title: 'Category Page',
		page: 'edit-categories',
		uniqid: uuidv4,
		styles: [
		],
		categories: global.categories
	});
};

exports.getEditCategory = async (req, res) => {
	const slug = (req.params.slug) ? req.params.slug : '';

	forum.getEditCategory(req, slug).then((data) => {
		res.render('layouts/admin/categories/edit', {
			title: 'Category Page',
			page: 'edit-categories',
			uniqid: uuidv4,
			styles: [
				'form'
			],
			slug,
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
