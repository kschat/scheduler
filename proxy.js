var http = require('http'),
	httpProxy = require('http-proxy'),
	fs = require('fs'),
	proxyServer = httpProxy.createServer (3000, 'localhost', {
	    hostnameOnly: true,
	    router: {
	        'https://174.60.221.21': 'https://127.0.0.1:3000',
	        'https://127.0.0.1': 'https://127.0.0.1:3000',
	        'https://scheduler.local': 'https://127.0.0.1:3000'
	    },
	    https: {
	    	key: fs.readFileSync('key.pem'),
			cert: fs.readFileSync('cert.pem')
	    },
	    target: {
	    	https: true
	    }
	});


proxyServer.listen(443);