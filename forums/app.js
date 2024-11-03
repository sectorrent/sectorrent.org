const express = require('express');
const http = require('http');
const fs = require('fs');

const mainController = require('./controllers/main');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

app.use(express.static('./public'));
/*
app.use((req, res, next) => {
	next();
});
*/
const server = http.createServer(app);

server.listen(80, () => {
	console.log(`forums.octorrent.org started`);
});


app.get('/', mainController.getHome);
app.get('/signin', mainController.getSignIn);
app.get('/signup', mainController.getSignUp);
app.get('/forgot-password', mainController.getForgotPassword);
app.get('/reset-password', mainController.getResetPassword);
