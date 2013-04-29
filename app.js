
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

//Reads the key and certificate for HTTPS
var httpsOptions = { 
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};

//Bootstraps express
 var app = express();

//Basic configuration necessary for the web app
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('meow'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	app.disable('x-powered-by');
 });

//Puts web app in development mode, showing all errors on web page
app.configure('development', function(){
	app.use(express.errorHandler());
});

//Gets the path for each file in the routes directory and initiates them
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
		loggedIn: false,
		links: {
			styles: [
				'/css/bootstrap.css',
				'/css/bootstrap-responsive.css',
				'/css/mainStyle.css',
				'/css/font-awesome.min.css',
			],
		},
	});
 });

//Starts the HTTPS server listening on port 3000
https.createServer(httpsOptions, app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
