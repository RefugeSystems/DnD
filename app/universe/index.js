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
	ObjectHandler = require("./objects");

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
					this.manager[types[x]] = manager[types[x]];	
					if(manager[types[x]]) {
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
			connection.connect(session, socket);
		} else {
			console.log("No Player");
			socket.send({"type": "close", "code": "4", "sent": Date.now()});
			socket.close();
		}
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
	 * @return {Array | Object} 
	 */
	requestState(player, time) {
		
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
