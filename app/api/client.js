/**
 * 
 * @class Client
 * @constructor
 * @param {Socket} connection
 * @param {Universe} universe
 * @param {RSObject} player
 */

var EventEmitter = require("events").EventEmitter,
	Anomaly = require("../management/anomaly"),
	validTypeValue = new RegExp("^[a-z]+$"),
	valid = new RegExp("^[a-z][a-z_]+$");

class Client extends EventEmitter {	
	constructor(connection, universe, player) {
		/**
		 * 
		 * @property connection
		 * @type Socket
		 */
		this.connection = connection;
		/**
		 * 
		 * @property universe
		 * @type Universe
		 */
		this.universe = universe;
		/**
		 * 
		 * @property player
		 * @type RSObject
		 */
		this.player = player;
		/**
		 * 
		 * @property connections
		 * @type Array
		 */
		this.connections = [];
		/**
		 * 
		 * @property synced
		 * @type Object
		 */
		this.synced = {};
		/**
		 * 
		 * @property active
		 * @type Object
		 */
		this.active = {};
		/**
		 * Maps events to functions that manage them.
		 * @property process
		 * @type Object
		 */
		this.process = {};
		
		/**
		 * 
		 * @event player:complete
		 * @param {Object} message
		 */
		this.process["player:complete"] = (message) => {
			this.active[message.socket.rsid] = Date.now();
			console.log("Socket[" + message.socket.rsid + "] now active: " + (this.active[message.socket.rsid] - this.synced[message.socket.rsid]) + "ms");
		};
	}
	
	/**
	 * 
	 * @method connect
	 * @param {Socket} socket 
	 * @return {String} Socket ID
	 */
	connect(socket) {
		socket.rsid = Random.identifier("socket", 12);
		this.connections.push(socket);
		this.player.connections++;
		
		socket.onmessage = function(event) {
			var message = JSON.parse(event.data);
			message = {
				"type": "player",
				"event": "player:" + message.event,
				"player": this.player,
				"data": message.data,
				"message": message,
				"received": Date.now()
			};

			if(message.event !== "ping" && this.universe.specification.debug) {
				console.log("Player Message [" + (message.received - message.sent) + "ms]: " + this.player.username + "\n", message);
			}

			setTimeout(function() {
				this.player.last = message.received;
				this.player.recv++;
				try {
					if(this.process[message.event]) {
						message.socket = socket;
						this.process[message.event](message);
					} else {
						this.universe.emit(message.event, message);
					}
					// console.log("Player Message Emitted");
				} catch(violation) {
					var event = {
						"received": Date.now(),
						"error": violation,
						"cause": message
					};
					this.emit("error", event);
				}
			});
		};
		
		/**
		 * 
		 * @event disconnected
		 * @param {Object} details
		 * @param {String} details.message
		 * @param {Number} details.time Timestamp
		 * @param {String} details.player ID
		 * @param {Object} details.event Throw by the socket
		 */
		socket.onclose = function(event) {
			this.connections.purge(socket);
			this.player.connections--;
			this.player.leaves++;

			var details = {};
			details.message = event.message || "Connection Closed";
			details.time = Date.now();
			details.player = this.player.id;
			details.event = event;

			setTimeout(() => {
				this.universe.emit("disconnected", details);
			});
		};
		
		/**
		 * 
		 * @event error
		 * @param {Object} details
		 * @param {String} details.message
		 * @param {Number} details.time Timestamp
		 * @param {String} details.player ID
		 * @param {Socket} details.socket Errored socket
		 */
		socket.onerror = function(error) {
			this.connections.purge(socket);
			this.player.connections--;
			this.player.errors++;

			var details = {};
			details.message = error.message || "Connection Error";
			details.time = Date.now();
			details.player = this.player.id;
			details.socket = socket;
			details.error = error;
			setTimeout(() => {
				this.emit("error", details);
			});
		};
		
		// TODO: Get Universe State to Send
		/*
		var state = universe.getState(this.player);
		this.synced[socket.rsid] = state.time;
		socket.send(state);
		 */
		
		return socket.rsid;
	}
	
	/**
	 * 
	 * @method send
	 * @param {Object} message 
	 */
	send(message) {
		var sending = JSON.stringify({
			"sent": Date.now(),
			"message": message
		});
		for(var x=0; x<this.connections.length; x++) {
			this.connections[x].send(sending);
		}
	}
}
