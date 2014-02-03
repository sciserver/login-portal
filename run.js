var http = require('http');
var static = require('node-static');
var Cookies = require( "cookies" );

// node-static imports
var events = require('events');
var path   = require('path');
var fs     = require('fs');

var url = require('url');

var fileServer = new static.Server('./build', {cache: false, headers: {'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0'}});

require('http').createServer(function (req, res) {

	var cookies = new Cookies( req, res);

	var token = cookies.get( "token" );

 	var url = require('url').parse(req.url, true);
	var pathfile = url.pathname;
	var query = url.query;
	var callbackUrl = query["callbackUrl"];

	if(typeof token == "undefined" || typeof callbackUrl == "undefined" || query["logout"] == 'true') {
		fileServer.serve(req, res)
		.on("error", function(error) {
			console.log(error);
		});
	} else {
		res.writeHead(302, {
		  'Location': callbackUrl+"?token="+token,
		  'Cache-Control': 'no-cache, no-store, must-revalidate',
		  'Pragma': 'no-cache',
		  'Expires': '0'
		});
		res.end();
	}

}).listen(8080);

Server.prototype.serveDir = function (pathname, req, res, finish) {
    var htmlIndex = path.join(pathname, 'index.html'),
        that = this;

    fs.stat(htmlIndex, function (e, stat) {
        if (!e) {
            var status = 200;
            var headers = {};

		    var requrl = url.parse(req.url, true);
		    var query = requrl.query;

		    if(query['logout'] == 'true') {
				headers = {'Set-Cookie': 'token=; path=/; expires=01 Jan 1970 00:00:00 GMT'};
		    }

            var originalPathname = decodeURI(url.parse(req.url).pathname);
            if (originalPathname.length && originalPathname.charAt(originalPathname.length - 1) !== '/') {
                return finish(301, { 'Location': originalPathname + '/' });
            } else {
                that.respond(null, status, headers, [htmlIndex], stat, req, res, finish);
            }
        } else {
            // Stream a directory of files as a single file.
            fs.readFile(path.join(pathname, 'index.json'), function (e, contents) {
                if (e) { return finish(404, {}) }
                var index = JSON.parse(contents);
                streamFiles(index.files);
            });
        }
    });
    function streamFiles(files) {
        util.mstat(pathname, files, function (e, stat) {
            if (e) { return finish(404, {}) }
            that.respond(pathname, 200, {}, files, stat, req, res, finish);
        });
    }
};

