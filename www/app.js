const express = require('express');
const http = require('http');
const fs = require('fs');
const useragent = require('express-useragent');
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



app.use(useragent.express());

app.get('/', mainController.getHome);
app.get('/beps/:id', mainController.getBEP);
app.get('/oeps/:id', mainController.getOEP);

app.get('*', (req, res) => {
	mainController.getError(req, res, 404)
});




const server = http.createServer(app);

server.listen(80, () => {
	console.log(`octorrent.org started`);
});
