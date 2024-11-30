const { v4: uuidv4 } = require('uuid');
const forums = require('../modules/forums');
const markdown = require('../modules/markdown');

exports.getHome = async (req, res) => {
	forums.getHome(req).then((data) => {
		res.render('layouts/home', {
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
		console.log(error);
	});
};

exports.getLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	forums.getLatest(req).then((data) => {
		res.render('layouts/latest', {
			title: 'Latest Page',
			page: 'latest',
			uniqid: uuidv4,
			styles: [
				'category'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_category', {
			title: 'Category Page',
			page: 'category',
			uniqid: uuidv4,
			styles: [
				'category'
			],
			categories: global.categories
		});
	});
};

exports.getTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;

	forums.getTop(req).then((data) => {
		res.render('layouts/top', {
			title: 'Top Page',
			page: 'top',
			uniqid: uuidv4,
			styles: [
				'category'
			],
			categories: global.categories,
			data
		});

	}).catch(function(error){
		res.render('layouts/error/empty_category', {
			title: 'Category Page',
			page: 'category',
			uniqid: uuidv4,
			styles: [
				'category'
			],
			categories: global.categories
		});
	});
};

exports.getCategory = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forums.getCategory(req, slug).then((data) => {
		res.render('layouts/categories/category', {
			title: 'Category Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category'
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
				'category'
			],
			slug,
			categories: global.categories
		});
	});
};

exports.getCategoryLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forums.getLatest(req, slug).then((data) => {
		res.render('layouts/categories/latest', {
			title: 'Latest Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category'
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
				'category'
			],
			slug,
			categories: global.categories
		});
	});
};

exports.getCategoryTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';

	forums.getTop(req, slug).then((data) => {
		res.render('layouts/categories/top', {
			title: 'Top Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category'
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
				'category'
			],
			slug,
			categories: global.categories
		});
	});
};

exports.getNewThread = async (req, res) => {
	res.render('layouts/new_thread', {
		title: 'New Thread Page',
		page: 'new-thread',
		uniqid: uuidv4,
		styles: [
			'editor',
			'markdown',
			'new-thread'
		],
		categories: global.categories
	});
};

exports.getThread = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	
	forums.getThread(req, id).then((data) => {
		data.content = markdown.parse(data.content);
		
		if(data.comments.total > 0){
			for(const comment of data.comments.comments){
				comment.content = markdown.parse(comment.content);
			}
		}

		res.render('layouts/thread', {
			title: 'Thread Page',
			page: 'thread',
			uniqid: uuidv4,
			styles: [
				'editor',
				'markdown',
				'thread'
			],
			id,
			categories: global.categories,
			data
		});

	}).catch(function(error){
		console.log(error);
	});
};

