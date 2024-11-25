const express = require('express');
const http = require('http');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookies = require('cookie-parser');
const mongo = require('./modules/mongo');
const forums = require('./modules/forums');
const middleware = require('./modules/middleware');

const mainController = require('./controllers/main');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

app.use(express.static('./public'));


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

app.use(async (req, res, next) => {
	res.locals.config = config;
	res.locals.isSignedIn = await middleware.isSignedIn(req, config.token.secret);
	next();
});

(async function initalize(){
	global.categories = await forums.getCategories();
})();

const server = http.createServer(app);

server.listen(80, () => {
	console.log(`forums.${config.general.domain} started`);
});


app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    res.setHeader('Content-Security-Policy', `default-src 'self' *.${config.general.domain}; style-src 'self' 'nonce-${nonce}'; script-src 'self' 'nonce-${nonce}'`);

    res.locals.nonce = nonce;
    next();
});


app.get('/', mainController.getHome);
app.get('/latest', mainController.getLatest);
app.get('/top', mainController.getTop);
//app.get('/:slug/latest', mainController.getLatest);
//app.get('/:slug/top', mainController.getTop);
app.get('/c/:slug', mainController.getCategory);
app.get('/thread', mainController.getNewThread);
app.get('/t/:id', mainController.getThread);

app.get('/signin', mainController.getSignIn);
app.get('/signup', mainController.getSignUp);
app.get('/forgot-password', mainController.getForgotPassword);
app.get('/reset-password', mainController.getResetPassword);
