/* Run this in the current directory via 

nodejs echoServer.js

I have the websockets libraries installed in node_modules */

var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
var world={};

wss.on('close', function() {
   console.log('disconnected');
});

wss.broadcast = function(data) {
   for(var i in this.clients)
       this.clients[i].send(data);
};

wss.on('connection', function(ws) {
wss.broadcast(JSON.stringify(world));
ws.on('message', function(message) {
console.log('received: %s', message);
var messageObject = JSON.parse(message);
world=messageObject;
wss.broadcast(JSON.stringify(world));
});
});