// Remember to require config.js for the port number
var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});

var receivedmessage = {};

wss.on('close', function() {
    console.log('disconnected');
});

wss.on('connection', function(ws) {
	ws.on('message',function(message) {
		console.log('received: %s', message);
		receivedmessage = JSON.parse(message);
	});
});
