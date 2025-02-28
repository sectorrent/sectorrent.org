const express = require('express');
const http = require('http');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookies = require('cookie-parser');
const MongoStore = require('connect-mongo');
global.mongo = require('./modules/mongo');
require('dotenv').config();
const middleware = require('./modules/middleware');

const feedController = require('./controllers/feed');
const threadController = require('./controllers/thread');
const commentController = require('./controllers/comment');
const accountController = require('./controllers/account');
const adminController = require('./controllers/admin');

const app = express();

mongo.connectDatabase();

app.use(session({
	secret: process.env.SESSION_TOKEN,
	resave: false,
	saveUninitialized: true,
	store: MongoStore.create({
		client: global.mongo.getClient(),
		dbName: process.env.DB_NAME,
		collectionName: 'sessions',
		ttl: 14*24*60*60*1000
	}),
	cookie: {
		domain: '.'+process.env.DOMAIN,
		secure: false,
		maxAge: 24*60*60*1000
	}
}));

app.use(cookies());


app.use((req, res, next) => {
	res.setHeader('Content-Type', 'application/json; charset=utf-8');

	const origin = req.headers.origin;
	if(origin){
		res.setHeader('Access-Control-Allow-Origin', origin);
	}else{
		res.setHeader('Access-Control-Allow-Origin', 'https://'+process.env.DOMAIN);
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

app.post('/signin', express.json(), accountController.postSignIn);
app.post('/signup', express.json(), accountController.postSignUp);
app.get('/signout', accountController.getSignOut);

app.post('/forgot-password', express.json(), accountController.postForgotPassword);
app.put('/reset-password', express.json(), accountController.putResetPassword);

app.get('/', feedController.getHome);
app.get('/home', feedController.getHome);
app.get('/categories', feedController.getCategories);
app.get('/latest', feedController.getLatest);
app.get('/top', feedController.getTop);

app.get('/c/:slug', feedController.getCategory);
app.get('/c/:slug/latest', feedController.getCategoryLatest);
app.get('/c/:slug/top', feedController.getCategoryTop);

app.use([
	'/thread',
	'/thread/archive',
	'/thread/pin',
	'/comment',
	'/user',
	
	'/thread/pin',
	'/categories',
	'/category'
], async (req, res, next) => {
	if(await middleware.isSignedIn(req, process.env.SECRET_TOKEN)){
		next();
		return;
	}

	res.json({
		status: 403,
		status_message: 'Forbidden'
	});
	res.end();
});

app.post('/thread', express.json(), threadController.postThread);
app.put('/thread', express.json(), threadController.putThread);
app.delete('/thread', express.json(), threadController.deleteThread);
app.put('/thread/archive', express.json(), threadController.putThreadArchive);
app.delete('/thread/archive', express.json(), threadController.deleteThreadArchive);
//app.post('/thread/report', express.json(), threadController.postThreadReport);

app.post('/comment', express.json(), commentController.postComment);
app.put('/comment', express.json(), commentController.putComment);
app.delete('/comment', express.json(), commentController.deleteComment);
//app.post('/comment/report', express.json(), commentController.postCommentReport);

app.delete('/comment', express.json(), commentController.deleteComment);

app.put('/user', express.json(), accountController.putUser);


app.use([
	'/thread/pin',
	'/categories',
	'/category'
], async (req, res, next) => {
	if(await middleware.getRole(req) > 1){
		next();
		return;
	}

	res.json({
		status: 403,
		status_message: 'Forbidden'
	});
	res.end();
});

app.put('/thread/pin', express.json(), adminController.putThreadPin);
app.delete('/thread/pin', express.json(), adminController.deleteThreadPin);

app.put('/categories', express.json(), adminController.putCategories);

app.post('/category', express.json(), adminController.postCategory);
app.put('/category', express.json(), adminController.putCategory);
app.delete('/category', express.json(), adminController.deleteCategory);

app.get('*', (req, res) => {
	res.json({
		status: 404,
		status_message: 'Endpoint not found!'
	});
});

const server = http.createServer(app);

server.listen(80, () => {
	console.log(`api.${process.env.DOMAIN} started`);
});
