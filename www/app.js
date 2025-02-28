const express = require('express');
const http = require('http');
const fs = require('fs');
const useragent = require('express-useragent');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookies = require('cookie-parser');
const crypto = require('crypto');
const MongoStore = require('connect-mongo');
global.mongo = require('./modules/mongo');
require('dotenv').config();
const github = require('./modules/github');

const mainController = require('./controllers/main');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

app.use(express.static('./public'));

global.mongo.connectDatabase();

app.use(session({
	secret: process.env.SESSION_TOKEN,
	resave: false,
	saveUninitialized: true,
	store: MongoStore.create({
		client: global.mongo.getClient(),
		dbName: process.env.DB_DATABASE,
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


async function initalize(){
	global.github_commits = await github.getRecentCommits();
}

setInterval(initalize, 3600000);
initalize();

app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    res.setHeader('Content-Security-Policy', `default-src 'self' *.${process.env.DOMAIN}; style-src 'self' 'nonce-${nonce}'`);

    res.locals.nonce = nonce;
    next();
});

app.use(useragent.express());

app.get('/', mainController.getHome);
app.get('/seps/:id', mainController.getSEP);
app.get('/beps/:id', mainController.getBEP);

app.get('*', (req, res) => {
	mainController.getError(req, res, 404);
});

const server = http.createServer(app);

server.listen(80, () => {
	console.log(`${process.env.DOMAIN} started`);
});
