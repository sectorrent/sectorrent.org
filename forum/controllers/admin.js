const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
const category = require('../modules/category');
const pow = require('../modules/pow');

exports.getEditCategories = async (req, res) => {
	const categories = await forum.getCategoriesList();

	category.getEditCategories(req).then((data) => {
		res.render('layouts/admin/categories', {
			title: 'Categories Page',
			page: 'edit-categories',
			uniqid: uuidv4,
			styles: [
				'categories',
				'categories-edit',
				'form'
			],
			categories,
			pow: pow.generateChallenge(req),
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
	const categories = await forum.getCategoriesList();

	res.render('layouts/admin/categories/new', {
		title: 'Category Page',
		page: 'edit-categories',
		uniqid: uuidv4,
		styles: [
			'form'
		],
		categories,
		pow: pow.generateChallenge(req)
	});
};

exports.getEditCategory = async (req, res) => {
	const slug = (req.params.slug) ? req.params.slug : '';
	const categories = await forum.getCategoriesList();

	category.getEditCategory(req, slug).then((data) => {
		res.render('layouts/admin/categories/edit', {
			title: 'Category Page',
			page: 'edit-categories',
			uniqid: uuidv4,
			styles: [
				'category-edit',
				'form'
			],
			slug,
			categories,
			data,
			pow: pow.generateChallenge(req)
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
