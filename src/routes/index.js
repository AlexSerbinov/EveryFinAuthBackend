require('dotenv').config();
const auth = require('./auth');
const user = require('./user');
const watchList = require('./watchList');
const privateNodeList = require('./privateNodeList');
const txNotifier = require('./txNotifier');
const comments = require('./comments');
const mailing = require('./mailing');
const express = require('express');
const captcha = require('./captcha')

module.exports = (app) => {
	// app.use('/', auth);
	app.use('/api-user/auth', auth);
	app.use('/api-user/user', user);
	app.use('/api-user/watchList', watchList);
	app.use('/api-user/txNotifier', txNotifier);
	app.use('/api-user/privateNodeList', privateNodeList);
	app.use('/api-user/comments', comments);
	app.use('/api-user/captcha', captcha)
	app.use('/mailing', mailing);
};
