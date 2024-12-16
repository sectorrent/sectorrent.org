const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');

exports.getHome = async (req, res) => {
	forum.getHome(req).then((data) => {
		res.render('layouts/index', {
			title: 'Home Page',
			page: 'home',
			uniqid: uuidv4,
			styles: [
				'home'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_home', {
			title: 'Home Page',
			page: `home`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			categories: global.categories
		});
	});
};

exports.getLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	forum.getLatest(req).then((data) => {
		res.render('layouts/latest', {
			title: 'Latest Page',
			page: 'latest',
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_category', {
			title: 'Latest Page',
			page: 'latest',
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			type: 'latest',
			categories: global.categories
		});
	});
};

exports.getTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	forum.getTop(req).then((data) => {
		res.render('layouts/top', {
			title: 'Top Page',
			page: 'top',
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_category', {
			title: 'Top Page',
			page: 'top',
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			type: 'top',
			categories: global.categories
		});
	});
};

exports.getCategory = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forum.getCategory(req, slug).then((data) => {
		res.render('layouts/categories/index', {
			title: 'Category Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			slug,
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_category', {
			title: 'Category Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			categories: global.categories
		});
	});
};

exports.getCategoryLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forum.getLatest(req, slug).then((data) => {
		res.render('layouts/categories/latest', {
			title: 'Latest Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			slug,
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_category', {
			title: 'Latest Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			type: 'latest',
			categories: global.categories
		});
	});
};

exports.getCategoryTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forum.getTop(req, slug).then((data) => {
		res.render('layouts/categories/top', {
			title: 'Top Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_category', {
			title: 'Top Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			type: 'latest',
			categories: global.categories
		});
	});
};

exports.getCategories = async (req, res) => {
	forum.getCategories(req).then((data) => {
		res.render('layouts/categories', {
			title: 'Categories Page',
			page: 'categories',
			uniqid: uuidv4,
			styles: [
				'categories'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
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
	});
};
