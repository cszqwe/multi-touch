
/* Run this in the current directory via 

nodejs echoServer.js

I have the websockets libraries installed in node_modules */

var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});
//keeps the world state to broadcast to new players
// var world={"x1":{"x":0.05,"y":0.05},"x2":{"x":0.1,"y":0.05},"x3":{"x":0.15,"y":0.05},
// 	"x4":{"x":0.2,"y":0.05},"x5":{"x":0.25,"y":0.05},"o1":{"x":0.3,"y":0.05},
// 	"o2":{"x":0.35,"y":0.05},"o3":{"x":0.4,"y":0.05},"o4":{"x":0.45,"y":0.05},
// 	"o5":{"x":0.5,"y":0.05},"tttboard":{"x":0.2,"y":0.2}};
var world={};
wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data);
};

wss.on('connection', function(ws) {
	//update world when new user joins
	console.log('new broadcast: %s', JSON.stringify(world));
	//var firstTime=world;
	//firstTime['operation']="firstTime";
	//wss.broadcast(JSON.stringify(firstTime));
	ws.on('message', function(message) {
		console.log('received: %s', message);
		var messageObject = JSON.parse(message);

		if(messageObject['operation']=="drag"){
			var name=messageObject['name'];
			var id=messageObject['id'];
			//update world
			world[name][id]=messageObject[id];
			wss.broadcast(JSON.stringify(messageObject));
		}
		//lock draggables
		else if(messageObject['operation']=="lock"){
			wss.broadcast(JSON.stringify(messageObject));
		}
		//unlock draggables
		else if(messageObject['operation']=="unlock"){
			wss.broadcast(JSON.stringify(messageObject));
		}
		//gets world list
		else if(messageObject['operation']=="getWorld"){
			var reply={};
			reply['operation']="getWorld";
			reply['world']=world;
			wss.broadcast(JSON.stringify(reply));
		}
		//create a new world
		else if(messageObject['operation']=="newWorld"){
			var reply={};
			reply['operation']="newWorld";
			//check if name exists
			if(!world.hasOwnProperty(messageObject['name'])){
				world[messageObject['name']]={"x1":{"x":0.05,"y":0.2},"x2":{"x":0.1,"y":0.2},
					"x3":{"x":0.15,"y":0.2},"x4":{"x":0.2,"y":0.2},"x5":{"x":0.25,"y":0.2},
					"o1":{"x":0.3,"y":0.2},"o2":{"x":0.35,"y":0.2},"o3":{"x":0.4,"y":0.2},
					"o4":{"x":0.45,"y":0.2},"o5":{"x":0.5,"y":0.2},"tttboard":{"x":0.2,"y":0.3}};
				reply['world']=world;
				reply['status']="success";
				wss.broadcast(JSON.stringify(reply));
			}
			else{
				reply['status']="failure";
				wss.broadcast(JSON.stringify(reply));
			}
		}
		//change world
		else if(messageObject['operation']=="changeWorld"){
			var changeWorld=world[messageObject['name']];
			changeWorld['operation']="changeWorld";
			changeWorld['name']=messageObject['name'];
			wss.broadcast(JSON.stringify(changeWorld));
		}

	});
});
