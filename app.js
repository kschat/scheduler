
/**
 * Module dependencies.
 */

var express = require('express')
  , engine = require('ejs-locals')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var app = express();

app.engine('ejs', engine);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//RESTful routes
//app.get('/api/about', routes.about);

app.get('/', function(req, res, next) {
  res.render('index', { page: 'home.ejs'});
});

app.get('/bootstrap.css', function(req,res,next){
  res.sendfile('public/css/bootstrap.css');
});

app.get('/bootstrap-responsive.css', function(req,res,next){
  res.sendfile('public/css/bootstrap-responsive.css');
});

app.get('/mainStyle.css', function(req,res,next){
  res.sendfile('public/css/mainStyle.css');
});

app.get('/bootstrap-collapse.js', function(req,res,next){
  res.sendfile('public/js/bootstrap-collapse.js');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
