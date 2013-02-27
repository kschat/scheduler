
/**
 * Module dependencies.
 */

 var express = require('express')
 , routes = require('./routes')
 , http = require('http')
 , https = require('https')
 , path = require('path')
 , fs = require('fs')
 , routeDir = 'routes'
 , files = fs.readdirSync(routeDir)
 , config = require('./config').config;

var httpsOptions = { 
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};

 var app = express();

 app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	app.disable('x-powered-by');
 });

 app.configure('development', function(){
	app.use(express.errorHandler());
 });

 files.forEach(function(file) {
	var filePath = path.resolve('./', routeDir, file),
	route = require(filePath);

	route.init(app);
 });

/*
* If no other routes match load a page not found
* error page
*/
app.use(function(req, res) {
 	res.render('error', {
 		title: 'Scheduler',
 		error: 'Page not found',
		links: {
			styles: [
				'/css/bootstrap.css',
				'/css/bootstrap-responsive.css',
				'/css/mainStyle.css',
			],
			scripts: [
				'/js/jquery-1.9.1.min.js',
				'/js/bootstrap-transition.js',
				'/js/bootstrap-collapse.js',
				'/js/bootstrap-modal.js',
			]
		},
 	});
 });

https.createServer(httpsOptions, app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
