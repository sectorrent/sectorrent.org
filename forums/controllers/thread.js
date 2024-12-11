const { v4: uuidv4 } = require('uuid');
const thread = require('../modules/thread');
const markdown = require('../modules/markdown');
const pow = require('../modules/pow');

exports.getNewThread = async (req, res) => {
	res.render('layouts/threads/new_thread', {
		title: 'New Thread Page',
		page: 'new-thread',
		uniqid: uuidv4,
		styles: [
			'editor',
			'markdown',
			'form'
		],
		categories: global.categories,
		pow: pow.generateChallenge(req, res)
	});
};

exports.getThread = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	
	thread.getThreadExpanded(req, id).then((data) => {
		data.content = markdown.parse(data.content);
		
		if(data.comments.total > 0){
			for(const comment of data.comments.comments){
				comment.content = markdown.parse(comment.content);
			}
		}

		res.render('layouts/threads/thread', {
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
			data,
			pow: pow.generateChallenge(req, res)
		});

	}).catch(function(error){
		console.log(error);
	});
};

exports.getEditThread = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	
	thread.getThread(req, id).then((data) => {
		res.render('layouts/threads/edit_thread', {
			title: 'Thread Page',
			page: 'thread',
			uniqid: uuidv4,
			styles: [
				'editor',
				'markdown',
				'form'
			],
			id,
			categories: global.categories,
			data,
			pow: pow.generateChallenge(req, res)
		});

	}).catch(function(error){
		console.log(error);
	});
};
