const axios = require('axios');

const graphUrl = 'https://api.github.com/graphql';
const githubUrl = 'https://api.github.com/repos/';

exports.getRecentCommits = async (config) => {
	const query = `query {
	organization(login: "octorrent") {
		repositories(first: 100) {
			nodes {
				name
				ref(qualifiedName: "main") {
					target {
						... on Commit {
							history(first: 10) {
								nodes {
									message
									committedDate
									author {
											name
											email
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}`;

	const payload = {
		query: query
	};

	let response = await axios.post(graphUrl, payload, {
		headers: {
			'Authorization': `bearer ${config.github.token}`,
			'Content-Type': 'application/json'
		}
	});

	const commits = [];

	for(const node of response.data.data.organization.repositories.nodes){
		if(!node.ref){
			continue;
		}
		
		for(const commit of node.ref.target.history.nodes){
			commits.push(commit);
		}
	}

	commits.sort((a, b) => new Date(b.committedDate) - new Date(a.committedDate));
	
	return commits.slice(0, 10);
};
