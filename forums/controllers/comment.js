const { v4: uuidv4 } = require('uuid');
const comment = require('../modules/comment');
const markdown = require('../modules/markdown');
const pow = require('../modules/pow');

exports.getEditComment = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	
	comment.getComment(req, id).then((data) => {
		res.render('layouts/comments/edit_comment', {
			title: 'Comment Page',
			page: 'comment',
			uniqid: uuidv4,
			styles: [
				'editor',
				'markdown'
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
