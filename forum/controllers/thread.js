const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
const thread = require('../modules/thread');
const markdown = require('../modules/markdown');
const pow = require('../modules/pow');

exports.getNewThread = async (req, res) => {
	const categories = await forum.getCategoriesList();

	res.render('layouts/threads/new', {
		title: 'New Thread Page',
		page: 'new-thread',
		uniqid: uuidv4,
		styles: [
			'editor',
			'markdown',
			'form'
		],
		categories,
		pow: pow.generateChallenge(req, res)
	});
};

exports.getThread = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	const categories = await forum.getCategoriesList();
	
	thread.getThread(req, id).then((data) => {
		data.content = markdown.parse(data.content);
		
		if(data.comments.total > 0){
			for(const comment of data.comments.comments){
				comment.content = markdown.parse(comment.content);
			}
		}

		res.render('layouts/threads/index', {
			title: 'Thread Page',
			page: 'thread',
			uniqid: uuidv4,
			styles: [
				'editor',
				'markdown',
				'thread'
			],
			id,
			categories,
			data,
			pow: pow.generateChallenge(req, res)
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getEditThread = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	const categories = await forum.getCategoriesList();
	
	thread.getEditThread(req, id).then((data) => {
		res.render('layouts/threads/edit', {
			title: 'Thread Page',
			page: 'thread',
			uniqid: uuidv4,
			styles: [
				'editor',
				'markdown',
				'form'
			],
			id,
			categories,
			data,
			pow: pow.generateChallenge(req, res)
		});

	}).catch(function(error){
		console.log(error);
	});
};
