const github = require('../modules/github');
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
		//uniqid: uuidv4,
		styles: [
			'home'
		],
		data: {
			commits: commits
		}
	});
};
