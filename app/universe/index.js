/**
 *
 *
 * @class Universe
 * @extends EventEmitter
 * @constructor
 * @type {[type]}
 */

var EventEmitter = require("events").EventEmitter,
	Chronicle = require("../storage/chronicle"),
	DNDCalculator = require("./calculator/dnd"),
	PlayerConnection = require("./player"),
	ObjectHandler = require("./objects"),
	omittedFromSync = {};

omittedFromSync.session = true;

var classes = [
	"session", // HTTP or WebSocket Session
	"player",
	
	"setting", // Universe Settings and Values
	"incident",
	"meeting", // Game Session
	
	"dataset",
	"image",
	"playlist",
	"streamurl",
	"profile",
	"widget",
	"conditional",
	
	"entity",
	"ability",
	"skill",
	"archetype",
	"action", // Triggered by some game event to start user input like items that have an on long rest reset
	"effect",
	"race",
	"type",
	"journal",
	"item",
	"knowledge",
	"quest",
	"location"];

class Universe extends EventEmitter {
	constructor(configuration) {
		super();
		this.id = "universe";
		/**
		 * The Class Constructor for anomalies to allow using classes to construct the
		 * object for notifications.
		 * @property Anomaly
		 * @type Class
		 */
		this.Anomaly = require("../management/anomaly");
		this.calculator = new DNDCalculator(this);
		this.chronicle = new Chronicle(this);
		this.omittedFromSync = omittedFromSync;
		this.configuration = configuration;
		this.classes = classes;
		this.manager = {};
		this.connection = {};
		this.connected = [];
		this.initialized = false;
		this.time = 0;
		
		this.on("dump-configuration", () => {
			console.log(configuration);
		});
	}

	/**
	 *
	 * @method initialize
	 * @param {Object} startup
	 * @return {Promise}
	 */
	initialize(startup) {
		return new Promise((done, fail) => {
			startup.universe = this;
			// Initialize Database
			
			this.objectHandler = new ObjectHandler(this);
			this.objectHandler.initialize(startup)
			.then((manager) => {
				// Receive the managers
				var types = Object.keys(manager),
					loading = [],
					ids,
					i,
					x;
				
				// TODO: Loading Progress Bar?
				
				
				for(x=0; x<types.length; x++) {
					if(manager[types[x]]) {
						this.manager[types[x]] = manager[types[x]];	
						ids = Object.keys(manager[types[x]].object);
						for(i=0; i<ids.length; i++) {
							loading.push(manager[types[x]].object[ids[i]].linkFieldValues(true));
						}
					}
				}
				
				return Promise.all(loading);
			})
			.then((loading) => {
				// Calculate Loaded Objects
				for(var x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].calculateFieldValues();
					}
				}
				
				return loading;
			})
			.then((loading) => {
				// Update Loaded Objects
				var x;
				
				for(x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].updateFieldValues();
					}
				}
				for(x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].calculateFieldValues();
					}
				}
				for(x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].updateFieldValues();
					}
				}
				
				return this.chronicle.initialize(this.objectHandler);
			})
			.then(() => {
				if(this.manager.setting.object["setting:time"]) {
					this.time = parseInt(this.manager.setting.object["setting:time"].value) || 0;
				} else {
					this.time = 0;
					this.manager.setting.create(this, {
						"id": "setting:time",
						"description": "The current time in the game",
						"value": 0
					}, (err, object) => {
						if(err) {
							this.emit("error", new Anomaly("universe:settings:time", "Failed to load game time from universe settings", 40, {}, err, this));
						}
					});
				}
			})
			.then(() => {
				this.initialized = true;
				done();
			})
			.catch(fail);
		});
	}
	
	/**
	 * 
	 * @method getUserInformation
	 * @param {String} id [description]
	 * @return {Promise | RSObject | Anomaly} Promise that on success passes the identified
	 * 		player information or null. Fails with an Anomaly.
	 */
	getUserInformation(id) {
		return new Promise((done, fail) => {
			this.manager.player.load(id)
			.then(done)
			.catch((err) => {
				var details = {},
					anomaly;
				
				anomaly = new Anomaly("user:info", "Failed to get user information", 40, details, err, this);
				this.emit("error", err);
			});
		});
	}

	/**
	 *
	 * @method connectPlayer
	 * @param {Session} session
	 * @param {WebSocket} socket
	 */
	connectPlayer(session, socket) {
		console.log("Connect Player: ", session.toJSON());
		var player = this.manager.player.object[session.player],
			connection;
		
		if(player) {
			connection = this.connection[player.id];
			if(!connection) {
				console.log("Make Connection");
				connection = this.connection[player.id] = new PlayerConnection(this, player);
				this.connected.push(player.id);
			}
			console.log("Connect");
			connection.on("connected", () => {
				
			});
			
			connection.connect(session, socket);
		} else {
			console.log("No Player");
			socket.send({"type": "close", "code": "4", "sent": Date.now()});
			socket.close();
		}
	}
	
	/**
	 * 
	 * @method getPlayerState
	 * @return {Object}
	 */
	getPlayerState() {
		var players = {},
			x;
		
		for(x=0; x<this.connected.length; x++) {
			players[this.connected[x]] = {};
			players[this.connected[x]].username = this.connection[this.connected[x]].player.username;
			players[this.connected[x]].connects = this.connection[this.connected[x]].connects;
			players[this.connected[x]].leaves = this.connection[this.connected[x]].leaves;
			players[this.connected[x]].sockets = this.connection[this.connected[x]].socketIDs.length;
			players[this.connected[x]].last = this.connection[this.connected[x]].last;
		}
		
		return players;
	}
	
	/**
	 * 
	 * @method requestObject
	 * @param  {[type]}   id       [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	requestObject(id, callback) {
		
	}
	
	/**
	 * 
	 * @method requestState
	 * @param {RSObject} [player] To restrict the state to.
	 * @param {Integer} [time] The time mark from which to grab the state. This is real-time from which to grab
	 * 		updated objects to send.
	 * @return {Object} 
	 */
	requestState(player, time) {
		var managers = Object.keys(this.manager),
			state = {},
			master_fields,
			manager,
			sync,
			f,
			m,
			x;
		
		// TODO: Investigate time commitment here, may need broken up to prevent bad lockups
		for(m=0; m<managers.length; m++) {
			manager = this.manager[managers[m]];
			if(!omittedFromSync[managers[m]]) {
				state[manager.id] = [];
				if(!player.gm) {
					master_fields = [];
					for(f=0; f<manager.fields.length; f++) {
						if(manager.fields[f].attribute.master_only) {
							master_fields.push(manager.fields[f].id);
						}
					}
				}
				for(x=0; x<manager.objectIDs.length; x++) {
					sync = manager.object[manager.objectIDs[x]];
					if(sync) { // Skip unloaded data
						sync = sync.toJSON(); // Convert to sync format and separate object
						if((!time || time < sync.update) && (!sync.attribute.master_only || player.gm)) {
							if(!player.gm && master_fields.length) {
								for(f=0; f<master_fields.length; f++) {
									if(sync[master_fields[f]] !== undefined) {
										delete(sync[master_fields[f]]);
									}
								}
							}
							state[manager.id].push(sync);
						}
					}
				}
			}
		}
		
		return state;
	}
	
	/**
	 * 
	 * @method getClassFromID
	 * @param {String} id
	 * @return {String} Class ID
	 */
	getClassFromID(id) {
		if(typeof(id) === "string") {
			var index = id.indexOf(":");
			if(index === -1) {
				return null;
			}
			return id.substring(0, index);
		} else {
			return null;
		}
	}
}

module.exports = Universe;
