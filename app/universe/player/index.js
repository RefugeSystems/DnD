
/**
 * 
 *
 * @class PlayerConnection
 * @constructor
 * @param {Session} session
 */
var EventEmitter = require("events").EventEmitter,
	DNDCalculator = require("../calculator/dnd"),
	ObjectHandler = require("../objects"),
	RSRandom = require("rs-random"),
	noOp = function() {};

class PlayerConnection extends EventEmitter {
	constructor(universe, player) {
		super();
		this.id = "connection:" + player.id;
		this.universe = universe;
		this.player = player;
		
		this.connection = {};
		
		this.socketIDs = [];
		
		this.session = {};
		
		this.connects = 0;
		
		this.leaves = 0;
		
		var receiveObject = (change) => {
			if(change._class) {
				var manager = universe.manager[change._class],
					send = {},
					field,
					x;
				
				if(manager) {
					for(x=0; x<manager.fields.length; x++) {
						field = manager.fields[x];
						if(change[field.id] && (!field.attrbiute || !field.attribute.master_only)) {
							send[field.id] = change[field.id];
						}
					}
					send._class = change._class;
					send.id = change.id;
					this.send("object", send);
				} else {
					this.emit("error", new universe.Anomaly("player:connection:object", "Failed to locate manager for object change class", 40, change, null, this));
				}
			} else {
				this.send("object", change);
			}
		};
		
		universe.on("object-updated", receiveObject);
		universe.on("object-created", receiveObject);
	}
	
	connect(session, socket) {
		var id = RSRandom.identifier("socket", 10, 64);
		
		console.log("Connecting " + id);
		this.connection[id] = socket;
		this.session[id] = session;
		this.socketIDs.push(id);
		this.player.addValues({
			"sessions": session.id,
			"connections": 1
		}, noOp);
		
		console.log("...continuing...");
		
		socket.onmessage = (event) => {
			var message = JSON.parse(event.data),
				now = Date.now();
				
			switch(message.event) {
				case "ping":
					socket.send(JSON.stringify({
						"type": "ping",
						"received": now,
						"sent": message.sent
					}));
					break;
				default:
					message = {
						"type": "player:" + message.event,
						"received": Date.now(),
						"player": this.player,
						"sent": message.sent,
						"message": message
					};
					
					try {
						this.universe.emit(message.type, message);
					} catch(violation) {
						this.emit("error", {
							"received": now,
							"error": violation,
							"cause": message
						});
					}
			}
			
			session.last = now;
			session.setValues({"last": now}, noOp);
		};

		socket.onclose = (event) => {
			delete(this.connection[id]);
			delete(this.session[id]);
			this.socketIDs.purge(id);
			this.player.connects--;
			this.player.leaves++;
			this.player.subValues({
				"sessions": session.id,
				"connections": 1
			});

			var event = {};
			event.message = event.message;
			event.received = Date.now();
			event.signal = "close";
			event.player = this.player;
			event.event = event;

			this.emit("disconnected", event);
		};

		socket.onerror = (error) => {
			delete(this.connection[id]);
			delete(this.session[id]);
			this.socketIDs.purge(id);
			this.player.connects--;
			this.player.leaves++;
			this.player.subValues({
				"sessions": session.id,
				"connections": 1
			});

			var event = {};
			event.message = error.message;
			event.received = Date.now();
			event.signal = "error";
			event.player = this.player;
			this.emit("error", event);
		};
		
		socket.send(JSON.stringify({"type": "connected"}));
		this.emit("connected");
		this.connects++;
		console.log("Connected");
	}
	
	/**
	 * 
	 * @method send
	 * @param {String} type [description]
	 * @param {Object} data [description]
	 * @param {String} [source] For the send if applicable.
	 */
	send(type, data, source) {
		var message = {},
			x;
			
		message.type = type;
		message.data = data;
		message.sent = Date.now();
		message.id = RSRandom.identifier("message", 10, 32);
		message.source = source;
		message = JSON.stringify(message);
		
		for(x=0; x<this.socketIDs.length; x++) {
			this.connections[this.socketIDs].send(message);
		}
	}
}

module.exports = PlayerConnection;
