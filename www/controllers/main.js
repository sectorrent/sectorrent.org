exports.getHome = async (req, res) => {
	res.render('layouts/home', {
		title: 'Home Page',
		page: 'home',
		//uniqid: uuidv4,
		styles: [
			'home'
		]
	});
};
