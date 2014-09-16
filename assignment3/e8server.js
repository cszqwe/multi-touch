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
function fix_position(position){
	var cx=position.x;
	var cy=position.y;
	if (cx<0) cx=0;
	if (cx>450) cx=450;
	if (cy<0) cy=0;
	if (cy>500) cy=500;
	var new_position=position;
	new_position.x=cx;
	new_position.y=cy;
	return new_position;
}
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
		if (data.type=="show_information"){
			console.log(message);
		}else if (data.type == "create_world") {
			if (!worlds.hasOwnProperty(data.name)) {
				worlds[data.name] = {
					"x1": {"x":77, "y":73, moving:false},
					"x2": {"x":127, "y":73, moving:false},
					"x3": {"x":177, "y":73, moving:false},
					"x4": {"x":237, "y":73, moving:false},
					"x5": {"x":297, "y":73, moving:false},
					"o1": {"x":77, "y":402, moving:false},
					"o2": {"x":127, "y":402, moving:false},
					"o3": {"x":177, "y":402, moving:false},
					"o4": {"x":237, "y":402, moving:false},
					"o5": {"x":297, "y":402, moving:false},
					"tttboard":{"x":100, "y":170, moving:true}
				};
				wss.broadcast(null, message);
			}
		} else if (data.type == "delete_world") {
			wss.broadcast(null, message);
			delete worlds[data.name];
		}else if (data.type=="reset_world"){
			worlds[data.world_id]={
					"x1": {"x":77, "y":73, moving:false},
					"x2": {"x":127, "y":73, moving:false},
					"x3": {"x":177, "y":73, moving:false},
					"x4": {"x":237, "y":73, moving:false},
					"x5": {"x":297, "y":73, moving:false},
					"o1": {"x":77, "y":402, moving:false},
					"o2": {"x":127, "y":402, moving:false},
					"o3": {"x":177, "y":402, moving:false},
					"o4": {"x":237, "y":402, moving:false},
					"o5": {"x":297, "y":402, moving:false},
					"tttboard":{"x":100, "y":170, moving:true}
			}
			wss.broadcast(data.world_id,JSON.stringify({
				"type": "update_positions",
				"positions": worlds[data.world_id]
			}));
		}	
		else if (data.type == "update_position") {
			wss.broadcast(data.world_id, message);
			worlds[data.world_id][data.img_id] = fix_position(data.position);
		} else if (data.type == "change_world") {
			ws.world_id = data.name;
			ws.send(JSON.stringify({
				"type": "update_positions",
				"positions": worlds[data.name]
			}))
		} else if (data.type == "lock") {
			worlds[data.world_id][data.img_id].moving = true;
			wss.broadcast(data.world_id, message);
		} else if (data.type == "unlock") {
			worlds[data.world_id][data.img_id].moving = false;
			wss.broadcast(data.world_id, message);
		}
	});
});