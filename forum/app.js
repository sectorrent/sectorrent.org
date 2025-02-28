const express = require('express');
const http = require('http');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookies = require('cookie-parser');
const MongoStore = require('connect-mongo');
const crypto = require('crypto');
global.mongo = require('./modules/mongo');
require('dotenv').config();
const middleware = require('./modules/middleware');

const feedController = require('./controllers/feed');
const threadController = require('./controllers/thread');
const commentController = require('./controllers/comment');
const accountController = require('./controllers/account');
const staticController = require('./controllers/static');
const adminController = require('./controllers/admin');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

app.use(express.static('./public'));

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

app.use(async (req, res, next) => {
	res.locals.isSignedIn = await middleware.isSignedIn(req);
	
	if(res.locals.isSignedIn){
		res.locals.user = {
			id: req.token.payload.id,
			...req.token.payload.data
		};
	}

	next();
});


app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    res.setHeader('Content-Security-Policy', `default-src 'self' *.${process.env.DOMAIN}; style-src 'self' 'nonce-${nonce}'; script-src 'self' 'nonce-${nonce}'`);

    res.locals.nonce = nonce;

	next();
});

app.get('/signin', accountController.getSignIn);
app.get('/signup', accountController.getSignUp);
app.get('/forgot-password', accountController.getForgotPassword);
app.get('/reset-password', accountController.getResetPassword);

app.get('/rules', staticController.getRules);

app.get('/u/:username', accountController.getUserSummary);
app.get('/u/:username/posts', accountController.getUserPosts);
app.get('/u/:username/edit', accountController.getUserEdit);

app.get('/', feedController.getHome);
app.get('/categories', feedController.getCategories);
app.get('/latest', feedController.getLatest);
app.get('/top', feedController.getTop);

app.get('/c/:slug', feedController.getCategory);
app.get('/c/:slug/latest', feedController.getCategoryLatest);
app.get('/c/:slug/top', feedController.getCategoryTop);

app.get('/thread', threadController.getNewThread);
app.get('/t/:id', threadController.getThread);
app.get('/t/:id/edit', threadController.getEditThread);

app.get('/r/:id/edit', commentController.getEditComment);

app.use([
	'/categories/edit'
], (req, res, next) => {
	if(res.locals.isSignedIn && res.locals.user.role > 1){
		next();
		return;
	}

	res.json({
		status: 403,
		status_message: 'Endpoint not restricted'
	});
	res.end();
});

app.get('/categories/edit', adminController.getEditCategories);
app.get('/categories/new', adminController.getNewCategory);
app.get('/c/:slug/edit', adminController.getEditCategory);

app.get('*', (req, res) => {
	res.json({
		status: 404,
		status_message: 'Endpoint not found!'
	});
});

const server = http.createServer(app);

server.listen(80, () => {
	console.log(`forum.${process.env.DOMAIN} started`);
});
