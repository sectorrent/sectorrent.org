const { v4: uuidv4 } = require('uuid');
const forum = require('../modules/forum');
const marked = require('../modules/markdown');
const fs = require('fs');
const path = require('path');

exports.getHome = async (req, res) => {
	forum.getLatest(req, 'news').then((data) => {
		res.render('layouts/'+((req.useragent.isMobile) ? 'mobile' : 'desktop')+'/home', {
			title: 'Home Page',
			page: 'home',
			uniqid: uuidv4,
			styles: [
				'home'
			],
			meta: {
				description: 'SecTorrent P2P home page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/'
			},
			data: {
				news: data,
				commits: global.github_commits
			}
		});

	}).catch(function(error){
		res.render('layouts/'+((req.useragent.isMobile) ? 'mobile' : 'desktop')+'/home', {
			title: 'Home Page',
			page: 'home',
			uniqid: uuidv4,
			styles: [
				'home'
			],
			meta: {
				description: 'SecTorrent P2P home page.',
				keywords: 'p2p torrent secure anonymous relay',
				path: '/'
			},
			data: {
				commits: global.github_commits
			}
		});
	});
};

exports.getSEP = async (req, res) => {
    const id = req.params.id;
	const p = path.resolve('./eps/sectorrent/sep_'+id+'.md');

	if(fs.existsSync(p)){
		const markdown = fs.readFileSync(p, 'utf-8');

		res.render('layouts/'+((req.useragent.isMobile) ? 'mobile' : 'desktop')+'/eps', {
			title: 'SEP Page',
			page: 'seps',
			uniqid: uuidv4,
			styles: [
				'eps'
			],
			meta: {
				description: `SecTorrent P2P SEP_${id} page.`,
				keywords: 'p2p torrent secure anonymous relay',
				path: `/seps/${id}`
			},
			data: marked.parse(markdown)
		});
		res.end();
		return;
	}

	this.getError(req, res, 404);
};

exports.getBEP = async (req, res) => {
    const id = req.params.id;
	const p = path.resolve('./eps/bittorrent/bep_'+id+'.md');

	if(fs.existsSync(p)){
		const markdown = fs.readFileSync(p, 'utf-8');

		res.render('layouts/'+((req.useragent.isMobile) ? 'mobile' : 'desktop')+'/eps', {
			title: 'BEP Page',
			page: 'beps',
			uniqid: uuidv4,
			styles: [
				'eps'
			],
			meta: {
				description: `SecTorrent P2P BEP_${id} page.`,
				keywords: 'p2p torrent secure anonymous relay',
				path: `/beps/${id}`
			},
			data: marked.parse(markdown)
		});
		res.end();
		return;
	}

	this.getError(req, res, 404);
};

exports.getError = async (req, res, error) => {
	res.render('layouts/errors/'+error, {
		title: error+' Page',
		page: 'error',
		uniqid: uuidv4
	});
};
