const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
const marked = require('../modules/markdown');
const fs = require('fs');
const path = require('path');

exports.getRules = async (req, res) => {
    const categories = await forum.getCategoriesList();

	const p = path.resolve('./static/rules.md');

	if(fs.existsSync(p)){
		const markdown = fs.readFileSync(p, 'utf-8');

		res.render('layouts/rules', {
			title: 'Rules Page',
			page: 'rules',
			uniqid: uuidv4,
			styles: [
				'markdown'
			],
			meta: {
				description: 'SecTorrent P2P Forum rules page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/rules'
			},
			categories,
			data: marked.parse(markdown)
		});
		res.end();
		return;
	}

	//this.getError(req, res, 404);
};
