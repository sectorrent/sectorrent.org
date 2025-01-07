const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
const category = require('../modules/category');

exports.getHome = async (req, res) => {
	const categories = await forum.getCategoriesList();

	forum.getHome(req).then((data) => {
		res.render('layouts/index', {
			title: 'Home Page',
			page: 'home',
			uniqid: uuidv4,
			styles: [
				'home'
			],
			meta: {
				description: 'SecTorrent P2P Forum home page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/'
			},
			categories,
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
			meta: {
				description: 'SecTorrent P2P Forum home page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/'
			},
			categories
		});
	});
};

exports.getLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const categories = await forum.getCategoriesList();

	forum.getLatest(req).then((data) => {
		res.render('layouts/latest', {
			title: 'Latest Page',
			page: 'latest',
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			meta: {
				description: 'SecTorrent P2P Forum latest page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/latest'
			},
			categories,
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
			meta: {
				description: 'SecTorrent P2P Forum latest page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/latest'
			},
			type: 'latest',
			categories
		});
	});
};

exports.getTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const categories = await forum.getCategoriesList();

	forum.getTop(req).then((data) => {
		res.render('layouts/top', {
			title: 'Top Page',
			page: 'top',
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			meta: {
				description: 'SecTorrent P2P Forum top page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/top'
			},
			categories,
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
			meta: {
				description: 'SecTorrent P2P Forum top page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/top'
			},
			type: 'top',
			categories
		});
	});
};

exports.getCategory = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';
	const categories = await forum.getCategoriesList();

	category.getCategory(req, slug).then((data) => {
		res.render('layouts/categories/index', {
			title: 'Category Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			meta: {
				description: data.description,
				keywords: `p2p torrent secure anonymous relay ${slug}`,
				path: `/c/${slug}`
			},
			slug,
			categories,
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
			meta: {
				description: `SecTorrent P2P Forum category ${slug} page.`,
				keywords: `p2p torrent secure anonymous relay ${slug}`,
				path: `/c/${slug}`
			},
			slug,
			categories
		});
	});
};

exports.getCategoryLatest = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';
	const categories = await forum.getCategoriesList();

	category.getCategoryLatest(req, slug).then((data) => {
		res.render('layouts/categories/latest', {
			title: 'Latest Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			meta: {
				description: `Latest ${data.description}`,
				keywords: `p2p torrent secure anonymous relay ${slug}`,
				path: `/c/${slug}/latest`
			},
			slug,
			categories,
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
			meta: {
				description: `SecTorrent P2P Forum category ${slug} latest page.`,
				keywords: `p2p torrent secure anonymous relay ${slug}`,
				path: `/c/${slug}/latest`
			},
			type: 'latest',
			slug,
			categories
		});
	});
};

exports.getCategoryTop = async (req, res) => {
	//const skip = (req.query.skip) ? parseInt(req.query.skip) : -1;
	const slug = (req.params.slug) ? req.params.slug : '';
	const categories = await forum.getCategoriesList();

	category.getCategoryTop(req, slug).then((data) => {
		res.render('layouts/categories/top', {
			title: 'Top Page',
			page: `category_${slug}`,
			uniqid: uuidv4,
			styles: [
				'category',
				'table'
			],
			meta: {
				description: `Top ${data.description}`,
				keywords: `p2p torrent secure anonymous relay ${slug}`,
				path: `/c/${slug}/top`
			},
			slug,
			categories,
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
			meta: {
				description: `SecTorrent P2P Forum category ${slug} top page.`,
				keywords: `p2p torrent secure anonymous relay ${slug}`,
				path: `/c/${slug}/top`
			},
			type: 'top',
			slug,
			categories
		});
	});
};

exports.getCategories = async (req, res) => {
	const categories = await forum.getCategoriesList();

	forum.getCategories(req).then((data) => {
		res.render('layouts/categories', {
			title: 'Categories Page',
			page: 'categories',
			uniqid: uuidv4,
			styles: [
				'categories'
			],
			meta: {
				description: 'SecTorrent P2P Forum categories page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/categories'
			},
			categories,
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
			meta: {
				description: 'SecTorrent P2P Forum categories page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/categories'
			},
			type: 'categories',
			categories
		});
	});
};
