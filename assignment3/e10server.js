// Remember to require config.js for the port number
var config = require('./config_node.js');

var WebSocketServer = require('ws').Server, wss = new WebSocketServer({port: config.port});

var worlds = {};

wss.on('close', function() {
    console.log('disconnected');
});

//declar broadcast function for wss
wss.broadcast = function(world, data) {
	if (world == null)
	    for (var i in this.clients)
	        this.clients[i].send(data);
	else
		for (var i in this.clients)
			if (this.clients[i].world_id == world)
				this.clients[i].send(data);
};

wss.on('connection', function(ws) {
	var world_list = new Array();
	for (world in worlds)
		world_list.push(world);
	ws.send(JSON.stringify({
		"type": "create_worlds",
		"names": world_list
	}))

	ws.on('message',function(message) {
		console.log(message);
		var data = JSON.parse(message);
		if (data.type == "create_world") {
			if (!worlds.hasOwnProperty(data.name)) {
				worlds[data.name] = {
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
				wss.broadcast(null, message);
			}
		} else if (data.type == "delete_world") {
			wss.broadcast(null, message);
			delete worlds[data.name];
		} else if (data.type == "update_position") {
			wss.broadcast(data.world_id, message);
			worlds[data.world_id][data.img_id] = data.position;
		} else if (data.type == "change_world") {
			ws.world_id = data.name;
			ws.send(JSON.stringify({
				"type": "update_positions",
				"positions": worlds[data.name]
			}))
		} else if ((data.type == "lock") || (data.type == "unlock")) {
			wss.broadcast(data.world_id, message);
		}
	});
});