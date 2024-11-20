const express = require('express');
const http = require('http');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookies = require('cookie-parser');
const mongo = require('./modules/mongo');

const mainController = require('./controllers/main');

const app = express();

const crypto = require('crypto');
const generateStrongSecret = (length = 32) => {
	return crypto.randomBytes(length).toString('hex');
};

const config = require('./config.json');

app.use(session({
	secret: generateStrongSecret(),
	resave: false,
	cookie: {
		domain: '.'+config.general.domain
	},
	saveUninitialized: true
}));

app.use(cookies());


mongo.connectDatabase(config.database);
global.mongo = mongo;

app.use((req, res, next) => {
	res.locals.config = config;
	next();
});


const server = http.createServer(app);

server.listen(80, () => {
	console.log(`api.${config.general.domain} started`);
});



app.use((req, res, next) => {
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	console.log('ORIGIN');

	const origin = req.headers.origin;
	if(origin){
		res.setHeader('Access-Control-Allow-Origin', origin);
	}else{
		res.setHeader('Access-Control-Allow-Origin', 'https://'+res.locals.config.general.domain);
	}

	//res.setHeader('Access-Control-Allow-Origin', [  ]);
	res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Credentials', true);

	if(req.method === 'OPTIONS'){
		res.sendStatus(200);
		return;
	}

	next();
});

app.use([
	'/signin',
	'/signup',
	'/forgot-password',
	'/reset-password'
], rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // Max requests per window
	keyGenerator: function(req /*, res*/){
		return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	},
	handler: function(req, res){
		res.json({
			status: 429,
			status_message: 'Too many login attempts. Please try again later.'
		});
	}
}));

app.post('/signin', express.json(), mainController.postSignIn);
app.post('/signup', express.json(), mainController.postSignUp);
app.get('/signout', mainController.getSignOut);

app.post('/forgot-password', express.json(), mainController.postForgotPassword);
app.put('/reset-password', express.json(), mainController.putResetPassword);

app.get('*', (req, res) => {
	res.json({
		status: 404,
		status_message: 'Endpoint not found!'
	});
});
