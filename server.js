/**
 * Created by davidraviv on 17/6/14.
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var cache = {};

var server = http.createServer(function (request, response) {
	var filePath = false;
	// Create HTTP server, using anonymous function to define per-request behavior
	if (request.url == '/') {
		// Determine HTML file to be served by default
		filePath = 'public/index.html';
	} else {
		// Translate URL path to relative file path
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	// Serve static file
	serveStatic(response, cache, absPath);
});


server.listen(3000, function () {
	console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);


function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	// Check if file is cached in memory
	if (cache[absPath]) {
		// Serve file from memory Check if file exists
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function (exists) {
			if (exists) {
				// Read file from disk
				fs.readFile(absPath, function (err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						// Serve file read from disk
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}