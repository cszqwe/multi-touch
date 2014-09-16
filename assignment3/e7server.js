/* Run this in the current directory via 

nodejs echoServer.js

I have the websockets libraries installed in node_modules */

var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
var world={};
	world={
					"x1": {"top":0, "left":0},
					"x2": {"top":0, "left":0},
					"x3": {"top":0, "left":0},
					"x4": {"top":0, "left":0},
					"x5": {"top":0, "left":0},
					"o1": {"top":0, "left":0},
					"o2": {"top":0, "left":0},
					"o3": {"top":0, "left":0},
					"o4": {"top":0, "left":0},
					"o5": {"top":0, "left":0}
				};
wss.on('close', function() {
   console.log('disconnected');
});

wss.broadcast = function(data) {
	    for (var i in this.clients)
	        this.clients[i].send(data);
};

wss.on('connection', function(ws) {
	
	for (key in world)
		wss.broadcast(JSON.stringify({"img_id":key,"position":world[key]}));

	ws.on('message', function(message) {
		console.log('received: %s', message);
		var data = JSON.parse(message);
		wss.broadcast(message);
		world[data.img_id] = data.position;
	});
});