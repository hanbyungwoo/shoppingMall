var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

/* 세션 기능 추가 */
// var session = require('express-session');
// var RedisStore = require('connect-redis')(session);
// var redis = require('redis').createClient();

var routes = require('./routes/index');
var users = require('./routes/users');
var mypage = require('./routes/mypage');	//마이페이지
var login = require('./routes/login');
var join = require('./routes/join');
var q_a = require('./routes/q_a');
var product = require('./routes/product');
var mypage = require('./routes/mypage');
var product_register = require('./routes/product_register');
var manager = require('./routes/manager')
var seller = require('./routes/seller')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  key: 'sid',
  secret : '@#@$MYSIGN#@$#$',
  resave : false,
  saveUninitialized : true,
  cookie: {
    maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
  }
}))
// app.use(session({
// 	resave: true,
// 	saveUninitialized: true,
// 	store: new RedisStore({
// 		host: 'localhost',
// 		port: 6379,
// 		client: redis
// 	}),
// 	secret: 'keyboard cat'
// }));

app.use('/', routes);
app.use('/users', users);
app.use('/mypage', mypage);	//마이페이지
app.use('/login', login);
app.use('/join', join);
app.use('/Q&A', q_a);
app.use('/product', product);
app.use('/product_register',product_register);
app.use('/manager', manager);
app.use('/seller', seller);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
