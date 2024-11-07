const github = require('../modules/github');
const { v4: uuidv4 } = require('uuid');
const marked = require('marked');
const fs = require('fs');
const path = require('path');

//const commits = github.getRecentCommits();
const commits = [
	{
	  message: 'Create README.md',
	  committedDate: '2024-10-29T04:36:22Z',
	  author: { name: 'Brad', email: 'brad@bradeagle.com' }
	},
	{
	  message: 'first commit',
	  committedDate: '2024-10-29T04:35:11Z',
	  author: { name: 'DrBrad', email: 'brad@bradeagle.com' }
	},
	{
	  message: 'Compose',
	  committedDate: '2024-11-04T00:01:10Z',
	  author: { name: 'DrBrad', email: 'brad@bradeagle.com' }
	},
	{
	  message: 'first commit',
	  committedDate: '2024-11-03T23:45:37Z',
	  author: { name: 'DrBrad', email: 'brad@bradeagle.com' }
	}
];

exports.getHome = async (req, res) => {
	res.render('layouts/home', {
		title: 'Home Page',
		page: 'home',
		uniqid: uuidv4,
		styles: [
			'home'
		],
		data: {
			commits: commits
		}
	});
};

exports.getOEP = async (req, res) => {
    const id = req.params.id;
	const p = path.resolve('./eps/octorrent/oep_'+id+'.md');

	if(fs.existsSync(p)){
		const markdown = fs.readFileSync(p, 'utf-8');

		res.render('layouts/eps', {
			title: 'OEP Page',
			page: 'oeps',
			uniqid: uuidv4,
			styles: [
				'eps'
			],
			data: marked.parse(markdown)
		});
	}

	res.status(404);
};

exports.getBEP = async (req, res) => {
    const id = req.params.id;
	const p = path.resolve('./eps/bittorrent/bep_'+id+'.md');

	if(fs.existsSync(p)){
		const markdown = fs.readFileSync(p, 'utf-8');

		res.render('layouts/eps', {
			title: 'BEP Page',
			page: 'beps',
			uniqid: uuidv4,
			styles: [
				'eps'
			],
			data: marked.parse(markdown)
		});
	}

	res.status(404);
};
