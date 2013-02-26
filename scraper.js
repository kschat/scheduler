var util = require('util')
  , url = require('url')
  , httpAgent = require('http-agent')
  , jsdom = require('jsdom').jsdom;
 
var agent = httpAgent.create('www.pct.edu', ['sis']);

agent.addListener('next', function(e, agent) {
	jsdom.env({
		html: 'body'
	}, function(err, window) {
		var $ = require('jquery');
		console.log($('#nav'));
	});
});

agent.addListener('stop', function(e, agent) {
	util.puts('done');
});

agent.start();