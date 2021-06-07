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
	Anomaly = require("../management/anomaly"),
	appPackage = require("../../package.json"),
	fs = require("fs"),
	omittedFromSync = {},
	defaultClasses = [
		"player",
		"session",
		"location",
		"setting",
		"conditional"
	];
	
// 
var sortByOrdering = function(a, b) {
	if(!a.ordering && b.ordering) {
		return 1;
	} else if(a.ordering && !b.ordering) {
		return -1;
	} else if(a.ordering < b.ordering) {
		return -1;
	} else if(a.ordering > b.ordering) {
		return 1;
	} else if(a.id < b.id) {
		return -1;
	} else if(a.id > b.id) {
		return 1;
	}
	return 0;
};

// Security
omittedFromSync.session = true;
// Data APIs for data separation
// omittedFromSync.image = true;
omittedFromSync.audio = true;


class Universe extends EventEmitter {
	constructor(configuration) {
		super();
		this.id = "universe";
		/**
		 * The Class Constructor for anomalies to allow using classes to construct the
		 * object for notifications.
		 * @property Anomaly
		 * @type Constructor
		 */
		this.Anomaly = Anomaly;
		this.calculator = new DNDCalculator(this);
		this.chronicle = new Chronicle(this);
		this.omittedFromSync = omittedFromSync;
		this.configuration = configuration;
		this.specification = configuration.universe;
		this.classes = configuration.universe.classes?defaultClasses.concat(configuration.universe.classes):defaultClasses;
		this.initialized = false;
		
		/**
		 * Maps a chronicle type to the ChronicleProcessor that handles it
		 * @property chroniclers
		 * @type {Object}
		 */
		this.chroniclers = {};
		/**
		 * Maps player IDs to their connection handlers
		 * @property connection
		 * @type {Object}
		 */
		this.connection = {};
		this.connected = [];
		/**
		 * 
		 * @property manager
		 * @type {Object}
		 */
		this.manager = {};
		
		this.shutting_down = false;
		this.timeline = 0;
		this.oldest = 0;
		this.time = 0;
		
		this.on("dump-configuration", () => {
			console.log(configuration);
		});
		
		this.on("shutdown", () => {
			this.shutting_down = true;
			this.emit("send", {
				"type": "notice",
				"mid": "universe:status",
				"message": "Universe Restarting",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"timeout": 30000
			});
			
			setTimeout(() => {
				var ids = Object.keys(this.connection),
					x;
				
				for(x=0; x<ids.length; x++) {
					this.connection[ids[x]].close();
				}
			}, 1000);
		});
	}

	/**
	 *
	 * @method initialize
	 * @param {Object} startup
	 * @return {Promise}
	 */
	initialize(startup) {
		this.objectHandler = new ObjectHandler(this);
		
		if(this.specification.recovery_mode) {
			return this.objectHandler.initialize(startup);
		}
		
		console.log("Starting Load");
		return new Promise((done, fail) => {
			startup.universe = this;
			// Initialize Database
			
			this.objectHandler.initialize(startup)
			.then((manager) => {
				// Receive the managers
				var types = Object.keys(manager),
					loading = [],
					ids,
					i,
					x;

				console.log("Loading Managers");
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
				console.log("Managers Loaded");
				var anomaly = new Anomaly("universe:initialization", "Managers Loaded", 30, Object.keys(this.manager), null, this);
				this.emit("error", anomaly);
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
				
				console.log("Linking Objects");
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
				// Load Time Settings
				var loading = [];
				loading.push(new Promise((done, fail) => {
					if(this.manager.setting.object["setting:time"]) {
						this.time = parseInt(this.manager.setting.object["setting:time"].value) || 0;
						done();
					} else {
						this.time = 0;
						this.manager.setting.create(this, {
							"id": "setting:time",
							"description": "The current time in the game",
							"value": 0
						}, (err, object) => {
							if(err) {
								this.emit("error", new this.Anomaly("universe:settings:time", "Failed to load game time from universe settings", 40, {}, err, this));
								fail(err);
							} else {
								done();
							}
						});
					}
				}));
				loading.push(new Promise((done, fail) => {
					if(this.manager.setting.object["setting:timeline"]) {
						this.timeline = parseInt(this.manager.setting.object["setting:timeline"].value) || 0;
						done();
					} else {
						this.timeline = 0;
						this.manager.setting.create(this, {
							"id": "setting:timeline",
							"description": "The number of times the universe has passed through this current time period.",
							"value": 0
						}, (err, object) => {
							if(err) {
								this.emit("error", new this.Anomaly("universe:settings:timeline", "Failed to load game time from universe settings", 40, {}, err, this));
								fail(err);
							} else {
								done();
							}
						});
					}
				}));
				loading.push(new Promise((done, fail) => {
					if(this.manager.setting.object["setting:oldest"]) {
						this.oldest = parseInt(this.manager.setting.object["setting:oldest"].value) || 0;
						done();
					} else {
						this.oldest = 0;
						this.manager.setting.create(this, {
							"id": "setting:oldest",
							"description": "The oldest the universe has ever been. Used for tracking temporality.",
							"value": 0
						}, (err, object) => {
							if(err) {
								this.emit("error", new Anomaly("universe:settings:oldest", "Failed to load game time from universe settings", 40, {}, err, this));
								fail(err);
							} else {
								done();
							}
						});
					}
				}));
				return Promise.all(loading);
			}).then(() => {
				return new Promise((done, fail) => {
					var clean = new RegExp("^/?app/universe/events", "i"),
						initializing = [],
						errors = [],
						queue = [],
						loadDirectory,
						cleaned,
						loading,
						stat,
						x,
						y;
						
					loadDirectory = (path) => {
						fs.readdir(path, (err, paths) => {
							for(x=0; x<paths.length; x++) {
								cleaned = path.replace(clean, "");
								console.log(" [Events]> Path[" + path + " -> " + cleaned + "]: " + paths[x]);
								stat = fs.lstatSync(path + "/" + paths[x]);
								if(paths[x][0] !== "_" && paths[x].endsWith(".js") && stat.isFile()) {
									loading = require("./events" + cleaned + "/" + paths[x]);
									if(typeof(loading.initialize) === "function") {
										loading = loading.initialize(this);
										if(loading instanceof Promise) {
											initializing.push(loading);
										}
									}
								} else if(stat.isDirectory()){
									queue.push(path + "/" + paths[x]);
								}
							}
							
							if(queue.length) {
								loadDirectory(queue.shift());
							} else {
								if(errors.length) {
									console.log("Event Directory Loading Errors: ", errors);
									fail(errors);
								} else {
									Promise.all(initializing)
									.then(done)
									.catch(fail);
								}
							}
						});
					};
					
					loadDirectory("app/universe/events");
				});
			}).then(() => {
				return new Promise((done, fail) => {
					var clean = new RegExp("^/?app/universe/simulation", "i"),
						initializing = [],
						errors = [],
						queue = [],
						loadDirectory,
						cleaned,
						loading,
						stat,
						x,
						y;
						
					loadDirectory = (path) => {
						fs.readdir(path, (err, paths) => {
							for(x=0; x<paths.length; x++) {
								cleaned = path.replace(clean, "");
								console.log(" [Sim]> Path[" + path + " -> " + cleaned + "]: " + paths[x]);
								stat = fs.lstatSync(path + "/" + paths[x]);
								if(paths[x][0] !== "_" && paths[x].endsWith(".js") && stat.isFile()) {
									loading = require("./simulation" + cleaned + "/" + paths[x]);
									if(typeof(loading.initialize) === "function" && loading.type) {
										this.chroniclers[loading.type] = loading;
										loading = loading.initialize(this);
										if(loading instanceof Promise) {
											initializing.push(loading);
										}
									}
								} else if(stat.isDirectory()) {
									queue.push(path + "/" + paths[x]);
								}
							}
							
							if(queue.length) {
								loadDirectory(queue.shift());
							} else {
								if(errors.length) {
									console.log("Event Directory Loading Errors: ", errors);
									fail(errors);
								} else {
									Promise.all(initializing)
									.then(done)
									.catch(fail);
								}
							}
						});
					};
					
					loadDirectory("app/universe/simulation");
				});
			}).then(() => {
				this.initialized = true;
				console.log("Universe Loaded: ", Object.keys(this.manager));
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
				this.emit("error", anomaly);
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
		// console.log("Connect Player: ", session.toJSON());
		var player = this.manager.player.object[session.player],
			connection;
		
		if(this.shutting_down) {
			console.log("Shutting Down");
			socket.send({"type": "close", "code": "5", "sent": Date.now()});
			socket.close();
		} else if(player) {
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
	 * @method getObject
	 * @param {String} id 
	 * @param {Function} callback
	 */
	getObject(id, callback) {
		var classification = this.getClassFromID(id);
		if(!this.manager[classification]) {
			callback(new Anomaly("universe:object:request", "Unable to find object", 50, {id, classification}, null, this));
		} else {
			// TODO: Consider loading an object if requested while not loaded
			callback(null, this.manager[classification].object[id]);
		}
	}
	
	/**
	 * 
	 * @method requestObject
	 * @param {String} id 
	 * @param {Function} callback
	 */
	requestObject(id, callback) {
		var classification = this.getClassFromID(id);
		if(!this.manager[classification]) {
			callback(new Anomaly("universe:object:request", "Unable to find object", 50, {id, classification}, null, this));
		} else {
			// TODO: Consider loading an object if requested while not loaded
			callback(null, this.manager[classification].object[id]);
		}
	}
	
	/**
	 * 
	 * @method createObject
	 * @param  {[type]}   details  [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	createObject(details, callback) {
		var classification = this.getClassFromID(details.id);
		if(!this.manager[classification]) {
			callback(new Anomaly("universe:object:create", "Unable to identify classification for new object", 50, {details, classification}, null, this));
		} else {
			this.manager[classification].create(this, details, (err, created) => {
				if(err) {
					console.log("Error: ", err);
					callback(err);
				} else {
					created.linkFieldValues()
					.then(() => {
						created.calculateFieldValues();
						created.updateFieldValues();
						this.emit("object-created", created.toJSON());
						callback(null, created);
					})
					.catch(callback);
				}
			});
		}
	}

	/**
	 * 
	 * @method deleteObject
	 * @param {String} id 
	 * @param {Function} callback 
	 */
	deleteObject(object, callback) {
		if(!object) {
			callback(new Anomaly("universe:object:delete", "Unable to identify classification for new object", 50, {"id": object.id, "classification": object._class}, null, this));
		} else {
			this.manager[object._class].delete(object, (err) => {
				if(err) {
					console.log("Error: ", err);
					callback(err);
				} else {
					callback();
				}
			});
		}
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
			fields = {},
			state = {},
			master_fields,
			manager,
			sync,
			f,
			m,
			x;
		
		// TODO: Investigate time commitment here, may need broken up to prevent bad lockups
		state.classes = [];
		state.fields = [];
		
		for(m=0; m<managers.length; m++) {
			manager = this.manager[managers[m]];
			if(!omittedFromSync[managers[m]]) {
				state.classes.push(manager.toJSON());
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
						if((!time || time <= sync.updated) && (!sync.attribute.master_only || player.gm)) {
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
			} else {
				state.classes.push(manager.toJSON());
			}
		}
		
		fields = Object.keys(this.manager[managers[0]].database.field);
		for(f=0; f<fields.length; f++) {
			state.fields.push(this.manager[managers[0]].database.field[fields[f]]);
		}
		fields.sort(sortByOrdering);
		
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
	
	/**
	 * 
	 * @method toTime
	 * @param {Integer} end [description]
	 */
	timeTo(end) {
		var reverse = end < this.time;
		this.chronicle.getOccurrences(this.time, end, (err, occurrences) => {
			if(err) {
				this.emit("error", new Anomaly("universe:time:changing", "Failed to change time for universe", 50, {"time": this.time, end}, err, this));
			} else {
				if(occurrences && occurrences.length) {
					var chronicler,
						occurrence,
						process;
					
					process = function() {
						occurrence = occurrences.shift();
						chronicler = this.chronicler[occurrence.type];
						occurrence.reverse = reverse;
						if(chronicler) {
							chronicler.process(this, occurrence, process);
						} else {
							setTimeout(process, 0);
						}
						if(occurrence.emit) {
							this.emit(occurrence.emit, occurrence);
						}
					};
					
					process();
				}
			}
		});
	}
}

/**
 * 
 * @event send
 * @param {Object} message
 * @param {String} message.type For client processing
 */

module.exports = Universe;
