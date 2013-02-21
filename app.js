
/**
 * Module dependencies.
 */

 var express = require('express')
 , engine = require('ejs-locals')
 , routes = require('./routes')
 , http = require('http')
 , https = require('https')
 , path = require('path')
 , fs = require('fs')
 , routeDir = 'routes'
 , files = fs.readdirSync(routeDir);

var httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

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

 files.forEach(function(file) {
	var filePath = path.resolve('./', routeDir, file),
	route = require(filePath);

	route.init(app);
 });

 app.use(function(req, res) {
 	res.render('error', { error: 'Page not found'});
 });

//RESTful routes
//app.get('/api/about', routes.about);
/*
app.get('/', function(req, res, next) {
  res.render('index', { page: 'home.ejs'});
});

app.get('/:page', routes.page);
*/

https.createServer(httpsOptions, app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
