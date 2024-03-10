const Anomaly = require("../../management/anomaly");

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
	appPackage = require("../../../package.json"),
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
		
		this.ready = {};
		
		this.connects = 0;
		
		this.leaves = 0;

		// Fresh instantiation, initialize connection count
		player.setValues({
			"connections": 0
		});
		
		var receiveObject = (change) => {
			this.receiveObject(change);
		};
		
		var unloadObject = (unload) => {
			this.unloadObject(unload);
		};
		
		var forwardControlMessage = (message) => {
			message.type = "master:control";
			this.forwardMessage(message);
		};
		
		var forwardMessage = (message) => {
			this.forwardMessage(message);
		};
		
		var chronicled = (event) => {
			if(this.player.gm) {
				this.send("chronicled", event);
			}
		};
		
		var masterLogEvent = (message) => {
			if(this.player.gm) {
				message = Object.assign({}, message);
				message.type = "log";
				this.forwardMessage(message);
			}
		};
		
		var timeChanged = (event) => {
			this.send("time:changed", event);
		};
		
		universe.on("send", forwardMessage);
		universe.on("time:changed", timeChanged);
		universe.on("object-updated", receiveObject);
		universe.on("object-created", receiveObject);
		universe.on("unload", unloadObject);
		universe.on("error", masterLogEvent);
		universe.on("master:control", forwardControlMessage);

		universe.on("action:combat:round:start", forwardMessage);
		universe.on("combat:round", forwardMessage);
		universe.on("combat:turn", forwardMessage);
		
		universe.chronicle.on("adjusted", chronicled);
		universe.chronicle.on("added", chronicled);
	}

	/**
	 * 
	 * @method isConnected
	 * @returns {Boolean}
	 */
	isConnected() {
		return !!Object.keys(this.connection).length;
	}
	
	connect(session, socket) {
		var id = RSRandom.identifier("socket", 10, 64);
		
		// console.log("Connecting " + id);
		this.connection[id] = socket;
		this.session[id] = session;
		this.player.addValues({
			"connections": 1
		}, noOp);
		
		// console.log("...continuing...");
		
		socket.onmessage = (event) => {
			var message = JSON.parse(event.data),
				now = Date.now();
			// console.log("Received: ", message);
				
			switch(message.type) {
				case "ping":
					socket.send(JSON.stringify({
						"type": "ping",
						"pong": now,
						"version": appPackage.version,
						"sent": message.sent,
						"socket": id
					}));
					break;
				case "sync":
					// console.log("Received Sync: ", message);
					var sync = message.data.sync;
					message = this.universe.requestState(this.player, sync);
					message = {
						"id": RSRandom.identifier("message", 10, 32),
						"type": "sync",
						"sync": sync,
						"players": this.universe.getPlayerState(),
						"data": message,
						"version": appPackage.version,
						"sent": Date.now(),
						"socket": id
					};
					socket.send(JSON.stringify(message));
					break;
				case "universe:script":
					this.universe.processScript({
						"player": this.player,
						"code": message.data && message.data.code?message.data.code:null,
						"version": appPackage.version,
						"received": Date.now(),
						"socket": id
					});
					break;
				default:
					message = {
						"type": "player:" + message.type,
						"received": Date.now(),
						"player": this.player,
						"sent": message.sent,
						"message": message,
						"socket": id
					};
					
					try {
						this.universe.emit(message.type, message);
					} catch(violation) {
						// Essentially never happens due to asynchronous implementation but kept for stability
						this.emit("error", {
							"received": now,
							"error": violation,
							"cause": message,
							"socket": id
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
				"connections": 1
			});

			var event = {};
			event.message = event.message;
			event.received = Date.now();
			event.signal = "close";
			event.event = event;
			console.log("Player socket closed: ", event);
			event.player = this.player;

			this.emit("disconnected", event);
			if(this.socketIDs.length === 0) {
				this.universe.emit("send", {
					"type": "player-disconnected",
					"player": this.player.id,
					"username": this.player.username,
					"socket": id
				});
			}
		};

		socket.onerror = (error) => {
			delete(this.connection[id]);
			delete(this.session[id]);
			this.socketIDs.purge(id);
			this.player.connects--;
			this.player.leaves++;
			this.player.subValues({
				"sessions": session.id,
				"connections": 1,
				"socket": id
			});

			var event = {};
			event.message = error.message;
			event.received = Date.now();
			event.signal = "error";
			event.player = this.player;
			this.emit("error", event);
		};
		
		this.emit("connected");
		this.connects++;
		this.last = Date.now();
		this.socketIDs.push(id);
		// console.log("Connected");
		socket.send(JSON.stringify({
			"type": "connected",
			"sent": Date.now()
		}));
		if(this.socketIDs.length === 1) {
			this.universe.emit("send", {
				"type": "player-connected",
				"player": this.player.id,
				"username": this.player.username
			});
		}
	}
	
	/**
	 * 
	 * @method send
	 * @param {String} type [description]
	 * @param {Object} data [description]
	 * @param {String} [source] For the send if applicable.
	 * @param {String} [socket] ID for direct send
	 */
	send(type, data, source, socket) {
		var message = {},
			clean = [],
			anomaly,
			x;
			
		message.type = type;
		message.data = data;
		message.sent = Date.now();
		message.id = RSRandom.identifier("message", 10, 32);
		message.source = source;
		message = JSON.stringify(message);
		
		if(socket && this.connection[socket]) {
			this.connection[socket].send(message);
		} else {
			for(x=0; x<this.socketIDs.length; x++) {
				try {
					this.connection[this.socketIDs[x]].send(message);
				} catch(e) {
					anomaly = new Anomaly("player:connection:send", "Failed to send message to " + this.id + " on Socket " + this.socketIDs[x], 40, null, e, this);
					this.universe.emit("warning", anomaly);
					console.log(anomaly);
					clean.unshift(x);
				}
			}
		}
		/* Skipping clean as this seems to be causing issues, likely with a dual drop
		while(clean.length) {
			this.socketIDs.splice(clean.shift(), 1);
		}
		*/
	}
	
	/**
	 * 
	 * @method receiveObject
	 * @param {Object} change [description]
	 */
	receiveObject(change) {
		if(change._class && !this.universe.omittedFromSync[change._class]) {
			var manager = this.universe.manager[change._class],
				send = {},
				field,
				x;
			if(this.player.gm || !change.unsyncable) {
				if(manager) {
					if(change._computed) {
						
					}
					
					send._calculated = Object.assign({}, change._calculated);
					send._formula = change._formula;
					send._class = change._class;
					if(change._search) {
						send._search = change._search;
					}
					if(change._involved) {
						send._involved = change._involved;
					}
					if(change._data && this.player.gm) {
						send._data = change._data;
					}

					for(x=0; x<manager.fields.length; x++) {
						field = manager.fields[x];
						if(change[field.id] !== undefined && (!field.attribute.master_only || this.player.gm) && (!field.attribute.owner_only || !change.owned || this.player.gm || change.owned[this.player.id]) && !field.attribute.server_only) {
							send[field.id] = change[field.id];
						} else {
							if(send._calculated) {
								delete(send._calculated[field.id]);
							}
							if(send._data) {
								delete(send._data[field.id]);
							}
						}
					}

					send.id = change.id;
					send.updated = change.updated;
					if(this.player.gm) {
						send._search += ":::" + send.id;
					}
					this.send("object", send);
				} else {
					this.universe.emit("error", new this.universe.Anomaly("player:connection:object", "Failed to locate manager for object change class", 40, change, null, this));
				}
			}
		} else {
			// Non-object event sending is handled by other processors
			// this.send("object", change);
		}
	}
	
	/**
	 * 
	 * @method unloadObject
	 * @param {String} id 
	 */
	unloadObject(id) {
		var send = {},
			field,
			x;
		
		send._class = this.universe.getClassFromID(id);
		send.id = id;
		this.send("unload", send);
	}
	
	forwardMessage(message) {
		// TODO: Implement better/additional recipient restrictions
		if((!message.recipient && !message.recipients) || (message.recipient && message.recipient === this.player.id) || (message.recipients && message.recipients[this.player.id])) {
			// TODO: Implement additional general filtering
			this.send(message.type, message, null, message.socket);
		}
	}
	
	close() {
		for(var x=0; x<this.socketIDs.length; x++) {
			if(this.connection[this.socketIDs[x]]) {
				this.connection[this.socketIDs[x]].close();
			}
		}
	}
}

module.exports = PlayerConnection;
