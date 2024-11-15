const express = require('express');
const http = require('http');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const cookies = require('cookie-parser');
const mongo = require('./modules/mongo');

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

app.use((req, res, next) => {
	res.locals.config = config;
	next();
});



const server = http.createServer(app);

server.listen(80, () => {
	console.log(`forums.${config.general.domain} started`);
});


app.get('/', mainController.getHome);
app.get('/latest', mainController.getLatest);
app.get('/top', mainController.getTop);
app.get('/c/:category', mainController.getCategory);
app.get('/t/:thread', mainController.getThread);

app.get('/signin', mainController.getSignIn);
app.get('/signup', mainController.getSignUp);
app.get('/forgot-password', mainController.getForgotPassword);
app.get('/reset-password', mainController.getResetPassword);
