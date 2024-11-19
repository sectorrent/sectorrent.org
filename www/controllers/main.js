const { v4: uuidv4 } = require('uuid');
const marked = require('../modules/markdown');
//const marked = require('marked');
//const markedHighlight = require('marked-highlight');
//const hljs = require('highlight.js');
const fs = require('fs');
const path = require('path');

/*
marked.use(markedHighlight.markedHighlight({
	emptyLangClass: 'hljs',
	langPrefix: 'hljs language-',
    highlight(code, lang) {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		return hljs.highlight(code, { language }).value;
    }
}));

/*
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
*/
exports.getHome = async (req, res) => {
	res.render('layouts/'+((req.useragent.isMobile) ? 'mobile' : 'desktop')+'/home', {
		title: 'Home Page',
		page: 'home',
		uniqid: uuidv4,
		styles: [
			'home'
		],
		data: {
			commits: res.locals.config.github_commits
		}
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
