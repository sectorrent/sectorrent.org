const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
const comment = require('../modules/comment');
//const markdown = require('../modules/markdown');
const pow = require('../modules/pow');

exports.getEditComment = async (req, res) => {
	const id = (req.params.id) ? req.params.id : '';
	const categories = await forum.getCategoriesList();
	
	comment.getComment(req, id).then((data) => {
		res.render('layouts/comments/edit', {
			title: 'Comment Page',
			page: 'comment',
			uniqid: uuidv4,
			styles: [
				'editor',
				'markdown',
				'form'
			],
			id,
			categories,
			data,
			pow: pow.generateChallenge(req)
		});

	}).catch(function(error){
		console.log(error);
	});
};
