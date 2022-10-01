/**
 *
 *
 * @class Universe
 * @extends EventEmitter
 * @constructor
 * @type {[type]}
 */

const RSObject = require("../storage/rsobject");

var appPackage = require("../../package.json"),
	EventEmitter = require("events").EventEmitter,
	Random = require("rs-random"),
	fs = require("fs"),

	UniverseUtility = require("./utility.js"),
	Chronicle = require("../storage/chronicle"),
	Anomaly = require("../management/anomaly"),
	
	DNDCalculator = require("./calculator/dnd"),
	PlayerConnection = require("./player"),
	ObjectHandler = require("./objects"),
	
	NOOP = function() {},
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
	if(a.ordering === null || a.ordering === undefined) {
		a.ordering = 0;
	}
	if(b.ordering === null || b.ordering === undefined) {
		b.ordering = 0;
	}
	if(a.ordering < b.ordering) {
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
// Data APIs for data separation | Replaced by data field being flagged with new "Server Only" field
// omittedFromSync.image = true;
// omittedFromSync.audio = true;


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

		this.chronicle.on("error", function(error) {
			this.handleError("chronicle:general", error);
		});
		
		/**
		 * Maps a chronicle type to the ChronicleProcessor that handles it
		 * @property chronicler
		 * @type Chronicle
		 */
		this.chronicler = {};
		/**
		 * Maps player IDs to their connection handlers
		 * @property connection
		 * @type Object
		 */
		this.connection = {};
		this.connected = [];
		/**
		 * Maps a class ID to the manager that organizes the data
		 * @property manager
		 * @type Object | ClassManager
		 */
		this.manager = {};
		
		this.shutting_down = false;
		/**
		 * Used to essentially track the number of times the universe has rewound.
		 * @property timeline
		 * @type Integer
		 */
		this.timeline = 0;
		/**
		 * When true, time is going backwards. This is used to reduce the timeline
		 * increments to only increment on the initial reverse
		 * @property reversing
		 * @type Boolean
		 */
		this.reversing = false;
		/**
		 * The oldest the universe has ever been. Used to track multiple timelines.
		 * @property oldest
		 * @type Integer
		 */
		this.oldest = 0;
		/**
		 * The current "time" of the universe which is treated as an offset from
		 * the start of the game.
		 * @property time
		 * @type Integer
		 */
		this.time = 0;


		this.utility = new UniverseUtility(this);
		
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
				var start = Date.now(),
					mark,
					x;
				
				console.log("Linking Objects...");
				for(x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].updateFieldValues();
					}
				}
				console.log(" + Initialize: " + (Date.now() - start) + "ms");
				mark = Date.now();
				// for(x=0; x<loading.length; x++) {
				// 	if(loading[x]) {
				// 		loading[x].calculateFieldValues();
				// 	}
				// }
				// console.log(" + Calculated: " + (Date.now() - mark) + "ms");
				// mark = Date.now();
				// for(x=0; x<loading.length; x++) {
				// 	if(loading[x]) {
				// 		loading[x].updateFieldValues();
				// 	}
				// }
				// console.log(" + Re-Updated: " + (Date.now() - mark) + "ms");
				// console.log("...Total Time: " + (Date.now() - start) + "ms [Traces Still Running]");
				
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
				loading.push(new Promise((done, fail) => {
					if(!this.manager.setting.object["setting:meeting"]) {
						this.manager.setting.create(this, {
							"id": "setting:meeting",
							"description": "The current meeting of the game",
							"value": ""
						}, (err, object) => {
							if(err) {
								this.emit("error", new this.Anomaly("universe:settings:time", "Failed to load game time from universe settings", 40, {}, err, this));
								fail(err);
							} else {
								done();
							}
						});
					} else {
						done();
					}
				}));
				return Promise.all(loading);
			}).then(() => {
				return new Promise((done, fail) => {
					var clean = new RegExp("^/?app/universe/discovery", "i"),
						start = Date.now(),
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
								console.log(" [Disc]> Path[" + path + " -> " + cleaned + "]: " + paths[x]);
								stat = fs.lstatSync(path + "/" + paths[x]);
								if(paths[x][0] !== "_" && paths[x].endsWith(".js") && stat.isFile()) {
									loading = require("./discovery" + cleaned + "/" + paths[x]);
									if(typeof(loading.initialize) === "function" && loading.type) {
										this.chronicler[loading.type] = loading;
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
									.then(function() {
										console.log("[Disc] Initialization Complete in " + (Date.now() - start) + "ms");
									})
									.then(done)
									.catch(fail);
								}
							}
						});
					};
					
					loadDirectory("app/universe/discovery");
				});
			}).then(() => {
				return new Promise((done, fail) => {
					var clean = new RegExp("^/?app/universe/events", "i"),
						start = Date.now(),
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
									.then(function() {
										console.log("[Events] Initialization Complete in " + (Date.now() - start) + "ms");
									})
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
						start = Date.now(),
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
										this.chronicler[loading.type] = loading;
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
									.then(function() {
										console.log("[Sim] Initialization Complete in " + (Date.now() - start) + "ms");
									})
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
				this.emit("initialized", this);
				this.utility.info("Test");
				done();
			})
			.catch(fail);
		});
	}

	/**
	 * 
	 * @param {Object} attributes 
	 * @return {Object} 
	 * @throws universe:class:missing
	 */
	setClassAttribute(classification, attributes) {
		if(this.manager[classification]) {
			this.manager[classification].setAttributes(attributes, (error) => {
				if(error) {
					this.generalError("Failed to update " + classification + " class attributes: " + error.message, error);
				} else {
					this.emit("send", {
						"type": "class",
						"id": classification,
						"update": {
							"attribute": this.manager[classification].attribute
						}
					});
				}
			});
		} else {
			throw new Error("No such class: " + classification);
		}
	}

	/**
	 * 
	 * @method generalError
	 * @param {String} message 
	 * @param {Error} error 
	 */
	generalError(message, error) {
		this.emit("send", {
			"type": "notice",
			"mid": "universe:error:general",
			"message": message,
			"icon": "fas fa-exclamation-triangle rs-lightred",
			"error": error,
			"anchored": true
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
			// console.log("Shutting Down");
			socket.send({"type": "close", "code": "5", "sent": Date.now()});
			socket.close();
		} else if(player) {
			connection = this.connection[player.id];
			if(!connection) {
				// console.log("Make Connection");
				connection = this.connection[player.id] = new PlayerConnection(this, player);
				this.connected.push(player.id);
			}
			// console.log("Connect");
			// connection.on("connected", () => {
				
			// });
			
			connection.connect(session, socket);
		} else {
			// console.log("No Player");
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
	 * @method getTime
	 * @returns {Integer} Current time stamp for the universe
	 */
	getTime() {
		return this.time;
	}

	/**
	 * 
	 * @method getCurrentMeeting
	 * @returns {String} Meeting ID for the current meeting.
	 */
	getCurrentMeeting() {
		return this.manager.setting.object["setting:meeting"].value;
	}

	/**
	 * A non-callback object retrieval by ID.
	 * @method get
	 * @param {String} id 
	 * @param {String} [classification] Optional class name to save processing if known,
	 * 		otherwise it is pulled from the ID.
	 * @returns {RSObject}
	 */
	get(id, classification) {
		if(!classification) {
			classification = this.getClassFromID(id);
		}
		if(this.manager[classification]) {
			return this.manager[classification].object[id];
		}
		this.emit("error", new Anomaly("universe:object:request", "Unable to find object class", 50, {"id": id, "classification": classification}, null, this));
		return null;
	}

	/**
	 * Get the definition for a field in the system.
	 * @method field
	 * @param {String} id 
	 * @returns {RSField}
	 */
	field(id) {
		return this.objectHandler.getField(id) || null;
	}

	/**
	 * 
	 * @method list
	 * @param {String} classificaiton Name
	 * @returns {Array} of Object IDs for that class
	 */
	list(classification) {
		if(this.manager[classification]) {
			return this.manager[classification].objectIDs;
		}
		this.emit("error", new Anomaly("universe:object:request", "Unable to find class", 50, {classification}, null, this));
		return null;
	}

	/**
	 * 
	 * @method copy
	 * @param {String | RSObject} source
	 * @param {Object} [mask]
	 * @param {Function} callback 
	 */
	copy(source, mask, callback) {
		var details = {},
			id;
		
		if(typeof(source) === "string") {
			id = source;
			source = this.get(source);
		} else {
			id = source.id || source;
		}
		
		if(typeof(mask) === "function" && !callback) {
			callback = mask;
			mask = {};
		}

		if(source) {
			if(source.is_singular) {
				callback(null, source);
			} else {
				if(source.is_template) {
					Object.assign(details, mask);
					if(source.template_process) {
						// TODO: Handle Template Processing
					}
				} else {
					// Add check for hard-copy?
					// Object.assign(details, source._data, mask);
					Object.assign(details, mask);
				}
				details.id = Random.identifier(source._class, 10, 32).toLowerCase();
				details.acquired_in = this.manager.setting.object["setting:meeting"].value;
				details.acquired = this.time;
				details.is_template = false;
				details.selectable = false;
				details.playable = false;
				details.is_copy = true;
				details.parent = id;
				if(source.hp) {
					details.hp = source.hp;
				}
				if(source.mp) {
					details.mp = source.mp;
				}
				if(source.spell_slots) {
					details.spell_slots = JSON.parse(JSON.stringify(source.spell_slots));
				}
				this.createObject(details, callback);
			}
		} else {
			callback(new Anomaly("universe:object:copy", "Unable to find source object", 50, {id}, null, this));
		}
	}

	/**
	 * 
	 * @method copyPromise
	 * @param {String | RSObject} source
	 * @param {Object} [mask]
	 * @return {Promise}
	 */
	copyPromise(source, mask) {
		return new Promise((done, fail) => {
			this.copy(source, mask, function(err, object) {
				if(err) {
					fail(err);
				} else {
					done(object);
				}
			});
		});
	}

	/**
	 * 
	 * @method copyArray
	 * @param {Array | String | RSObject} sources
	 * @param {Object} [mask]
	 * @return {Promise}
	 */
	copyArrayID(sources, mask) {
		return new Promise((done, fail) => {
			var promises = [],
				i;

			for(i=0; i<sources.length; i++) {
				promises.push(this.copyPromise(sources[i], mask));
			}

			Promise.all(promises)
			.then((copies) => {
				for(i=0; i<copies.length; i++) {
					copies[i] = copies[i].id;
				}
				done(copies);
			})
			.catch(fail);
		});
	}

	/**
	 * 
	 * @method trackExpiration
	 * @param {RSObject} expiring 
	 * @param {String} target RSObject ID. Mostly for effects as items will simply be updated in place
	 * 		and target will essentially be irrelevent.
	 * @param {String} field Where the object exists
	 */
	trackExpiration(expiring, target, field) {
		if(expiring.expiration) {
			// TODO: Setting an expiration in the far future then rewinding time invalidates the previous expirations as they
			//		are on the abandoned timeline. May need a fallback check on "time_end" field instead of relying on the
			//		chronicle. Or rescan all items and effects for future endings on a resumed forward.
			this.chronicle.addOccurrence("object:expiration", {
				"target": target,
				"id": expiring.id,
				"field": field
			}, expiring.expiration);
		}
	}
	
	/**
	 * 
	 * @method getObject
	 * @throws {Anomaly} universe:object:request
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
	 * @method modifyObject
	 * @param  {[type]}   details  [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	modifyObject(details, callback) {
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
						this.emit("object-created", created);
						callback(null, created);
					})
					.catch(callback);
				}
			});
		}
	}
	
	/**
	 * 
	 * @method createObject
	 * @param  {[type]}   details  [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	createObject(details, callback = NOOP) {
		if(details) {
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
							// this.emit("object-created", created);
							callback(null, created);
						})
						.catch(callback);
					}
				});
			}
		} else {
			callback(new Error("Attempted to create null object?"));
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
			owner_fields,
			manager,
			sync,
			f,
			m,
			x;
		
		state.classes = [];
		state.fields = [];
		state._timeline = this.timeline;
		state._time = this.time;
		
		for(m=0; m<managers.length; m++) {
			manager = this.manager[managers[m]];
			master_fields = [];
			owner_fields = [];
			if(!omittedFromSync[managers[m]] && (!managers[m].attribute || !managers[m].attribute.server_only)) {
				state.classes.push(manager.toJSON());
				state[manager.id] = [];
				if(!player.gm) {
					master_fields = [];
					owner_fields = [];
					for(f=0; f<manager.fields.length; f++) {
						if(manager.fields[f].attribute.master_only) {
							master_fields.push(manager.fields[f].id);
						} else if(manager.fields[f].attribute.owner_only) {
							owner_fields.push(manager.fields[f].id);
						}
					}
				}
				for(x=0; x<manager.objectIDs.length; x++) {
					sync = manager.object[manager.objectIDs[x]];
					if(sync && (player.gm || !sync.unsyncable)) { // Skip unloaded data && Sync-Blocked objects
						sync = sync.toJSON(); // Convert to sync format and separate object
						if((!time || time <= sync.updated) && (!sync.attribute.master_only || player.gm) && !sync.attribute.no_sync) {
							if(!player.gm) {
								delete(sync._data);
								for(f=0; f<master_fields.length; f++) {
									if(sync[master_fields[f]] !== undefined) {
										sync[master_fields[f]] = undefined;
										delete(sync[master_fields[f]]);
									}
								}
								if(owner_fields.length && sync.owned && !sync.owned[player.id]) {
									for(f=0; f<owner_fields.length; f++) {
										if(sync[owner_fields[f]] !== undefined) {
											sync[owner_fields[f]] = undefined;
											delete(sync[owner_fields[f]]);
										}
									}
								}
							} else {
								sync._search += ":::" + sync.id;
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
	 * @method getMasters
	 * @return {Object} Mapping player IDs to true/false. Typically where
	 * 		the only IDs are game masters mapped to true, but caching
	 * 		may cause this to later map to the player's master state
	 * 		that after an update maybe false and still appear here.
	 */
	getMasters() {
		var masters = {},
			player,
			i;

		for(i=0; i<this.manager.player.objectIDs.length; i++) {
			player = this.manager.player.object[this.manager.player.objectIDs[i]];
			if(player.gm || player.master || player.game_master) {
				masters[player.id] = true;
			}
		}

		return masters;
	}

	/**
	 * 
	 * @method getConnectedPlayers
	 * @returns {Array}
	 */
	getConnectedPlayers() {
		var players = Object.keys(this.connection),
			connected = [],
			connection,
			i;
		
		for(i=0; i<players.length; i++) {
			connection = this.connection[players[i]];
			if(connection.isConnected()) {
				connected.push(players[i]);
			}
		}

		return connected;
	}

	/**
	 * 
	 * @method getConnectedRecipients
	 * @return {Object}
	 */
	getConnectedRecipients() {
		var players = Object.keys(this.connection),
			connected = {},
			connection,
			i;
		
		for(i=0; i<players.length; i++) {
			connection = this.connection[players[i]];
			if(connection.isConnected()) {
				connected[players[i]] = true;
			}
		}

		return connected;
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
	 * @method forwardTime
	 * @param {Integer} increment [description]
	 * @param {Boolean} lock The Timeline. Pass as true to jump times without processing or timeline jumping.
	 */
	forwardTime(increment, lock) {
		this.toTime((this.time || 0) + increment, lock);
	}

	/**
	 * 
	 * @method setTime
	 * @param {Integer} end [description]
	 * @param {Boolean} lock The Timeline. Pass as true to jump times without processing or timeline jumping.
	 */
	setTime(end, lock) {
		this.toTime(end, lock);
	}
	
	/**
	 * 
	 * @method toTime
	 * @param {Integer} end [description]
	 * @param {Boolean} lock The Timeline. Pass as true to jump times without processing or timeline jumping.
	 */
	toTime(end, lock, timeline) {
		var reverse = end < this.time;

		if(!lock) {
			this.chronicle.getOccurrences(this.time, end, null, (err, occurrences) => {
				if(err) {
					this.emit("error", new Anomaly("universe:time:changing", "Failed to retrieve occurances within time period for universe", 50, {"start": this.time, "end": end}, err, this));
				} else {
					// console.log("Time[" + this.time + " -> " + end + " @ " + occurrences.length + "]: ", {
					// 	"timeline": this.timeline,
					// 	"time": this.time
					// });

					if(occurrences && occurrences.length) {
						var processing = occurrences.length,
							chronicler,
							occurrence,
							process;
						
						process = () => {
							occurrence = occurrences.shift();
							if(occurrence) {
								chronicler = this.chronicler[occurrence.type];
								occurrence.reverse = reverse;
								if(chronicler) {
									chronicler.process(this, occurrence, process);
								} else if(occurrence.emit) {
									this.emit(occurrence.emit, occurrence);
								}
							}
							if(occurrences.length) {
								setTimeout(process, 0);
							} else {
								// console.log("Time[" + this.time + " -> " + end + " @ " + processing + "]: ", {
								// 	"timeline": this.timeline,
								// 	"time": this.time
								// });
								this.emit("time:changed", {
									"timeline": this.timeline,
									"time": this.time
								});
							}
						};
						
						process();
					} else {
						// console.log("Time[" + this.time + " -> " + end + "]: ", {
						// 	"timeline": this.timeline,
						// 	"time": this.time
						// });
						this.emit("time:changed", {
							"timeline": this.timeline,
							"time": this.time
						});
					}
				}
			});

			if(timeline === undefined) {
				if(reverse && !this.reversing) {
					this.reversing = true;
					this.timeline++;
					this.manager.setting.object["setting:timeline"].setValues({
						"value": this.timeline
					});
				} else if(!reverse && this.reversing) {
					this.reversing = false;
				}
			}
		}

		this.time = end;
		this.manager.setting.object["setting:time"].setValues({
			"value": this.time
		});
		if(timeline && this.timeline !== timeline) {
			this.timeline = timeline;
			this.manager.setting.object["setting:timeline"].setValues({
				"value": this.timeline
			});
		}

		if(lock) {
			this.emit("time:changed", {
				"timeline": this.timeline,
				"time": this.time
			});
		}
	}

	/**
	 * Deletes all contained objects in the specified array fields. Similar to full delete but the passed
	 * object is left.
	 * @method stripObject
	 * @param {String | RSObject} object 
	 * @param {Array | String} fields 
	 * @returns {Promise} Nothing on success, an array of errors on failure.
	 */
	stripObject(object, fields) {
		console.log("Strip Object: " + object.name + "[" + object.id + "]");
		return new Promise((done, fail) => {
			var errors = [],
				update = {},
				count = 0,
				total = 0,
				finish,
				buffer,
				field,
				f,
				i;

			if(typeof(object) === "string") {
				object = this.get(object);
			}

			finish = () => {
				if(count + errors.length === total) {
					if(errors.length) {
						fail(errors);
					} else {
						console.log("Stripped: " + object.name + "[" + object.id + "]");
						object.setValues(update, done);
					}
				}
			};

			if(object) {
				if(fields) {
					for(f=0; f<fields.length; f++) {
						field = fields[f];
						if(object[field]) {
							update[field] = [];
							for(i=0; i<object[field].length; i++) {
								buffer = this.manager.feat.object[object[field][i]];
								// if(typeof(buffer) === "object" && buffer !== null && ((buffer.is_copy && buffer.parent) || (!buffer.is_unique && !buffer.is_singular && !buffer.is_template))) {
								if(typeof(buffer) === "object" && buffer !== null && buffer.is_copy && buffer.parent) {
									console.log("...Deleting: " + buffer.name + "[" + buffer.id + "]");
									this.deleteObject(buffer, function(err) {
										if(err) {
											console.log("Failed to delete an object");
											errors.push(err);
										} else {
											count++;
										}
										finish();
									});
									total++;
								}
							}
						}
					}
				}
			}
			finish();
		});
	}

	/**
	 * 
	 * @method deleteFullObject
	 * @param {String | RSObject} object 
	 * @param {Array | String} fields 
	 * @returns {Promise} Nothing on success, an array of errors on failure.
	 */
	deleteFullObject(object, fields) {
		console.log("Deleting Object: " + object.name + "[" + object.id + "]");
		return new Promise((done, fail) => {
			var errors = [],
				count = 0,
				total = 0,
				finish,
				buffer,
				field,
				f,
				i;

			if(typeof(object) === "string") {
				object = this.get(object);
			}

			finish = () => {
				if(count + errors.length === total) {
					if(errors.length) {
						fail(errors);
					} else {
						console.log("Deleted: " + object.name + "[" + object.id + "]");
						this.deleteObject(object, function(error) {
							if(error) {
								fail([error]);
							} else {
								done();
							}
						});
					}
				}
			};

			if(object) {
				if(fields) {
					for(f=0; f<fields.length; f++) {
						field = fields[f];
						if(object[field]) {
							for(i=0; i<object[field].length; i++) {
								buffer = this.manager.feat.object[object[field][i]];
								// if(typeof(buffer) === "object" && buffer !== null && ((buffer.is_copy && buffer.parent) || (!buffer.is_unique && !buffer.is_singular && !buffer.is_template))) {
								if(typeof(buffer) === "object" && buffer !== null && buffer.is_copy && buffer.parent) {
									console.log("...Deleting: " + buffer.name + "[" + buffer.id + "]");
									this.deleteObject(buffer, function(err) {
										if(err) {
											console.log("Failed to delete an object");
											errors.push(err);
										} else {
											count++;
										}
										finish();
									});
									total++;
								}
							}
						}
					}
				}
			}
			finish();
		});
	}

	/**
	 * 
	 * @method hasAccess
	 * @param {RSplayer} player 
	 * @param {Object} object 
	 * @return {Boolean}
	 */
	hasAccess(player, object) {
		return player && (player.gm || (object.owned && object.owned[player.id]));
	}

	/**
	 * Checks if an object is valid for use or consumption. Essentially exists, not a `Preview` and not disabled
	 * with future proofing.
	 * @method isValid
	 * @param {RSObject} object 
	 * @returns {Boolean}
	 */
	isValid(object) {
		return object && !object.disabled && !object.is_disabled && !object.preview && !object.is_preview;
	}

	/**
	 * 
	 * Fires the event handlers for the object off asynchronously.
	 * 
	 * This is typically meant for events that do not need to be tracked and may or may not modify
	 * the underlying event data.
	 * @method processEvent
	 * @param {RSObject} source 
	 * @param {String} name 
	 * @param {Object} event 
	 * @param {RSHandler} handler 
	 */
	processEvent(source, name, event, handler) {
		setTimeout(() => {
			this.processEventInline(source, name, event, handler);
		}, 0);
	}

	/**
	 * 
	 * Fires the event handlers for the object off synchronously.
	 * 
	 * This is typically meant for events that need to be tracked or modify the underlying
	 * event data.
	 * @method processEventInline
	 * @param {RSObject} source 
	 * @param {String} name 
	 * @param {Object} event 
	 * @param {RSHandler} handler 
	 */
	processEventInline(source, name, event, handler) {
		event.name = name;
		try {
			handler.processor(source, event, this, this.utility);
			console.log("Handler[" + handler.id + "]: Completed Successfully for " + source.id);
			// TODO: Consider a result process
		} catch(exception) {
			// TODO: Expand logging
			console.error(" ! Exception processing event " + name + " for object " + source.id + " with handler " + handler.id + ":\n", exception);
		}
	}


	getActiveMeeting() {
		if(this.manager.setting.object["setting:meeting"]) {
			return this.manager.meeting.object[this.manager.setting.object["setting:meeting"].value] || null;
		}
		return null;
	}


	getActiveSkirmish() {
		var meeting = this.getActiveMeeting(),
			skirmish,
			i;
		if(meeting) {
			if(meeting.skirmishes) {
				for(i=0; i<meeting.skirmishes.length; i++) {
					skirmish = this.manager.skirmish.object[meeting.skirmishes[i]];
					if(!skirmish.is_preview && (skirmish.active || skirmish.is_active)) {
						return skirmish;
					}
				}
			}
		} else {
			for(i=0; i<this.manager.skirmish.objectIDs.length; i++) {
				skirmish = this.manager.skirmish.object[this.manager.skirmish.objectIDs[i]];
				if(!skirmish.is_preview && (skirmish.active || skirmish.is_active)) {
					return skirmish;
				}
			}
		}
		return null;
	}

	getActiveCombat() {
		return this.getActiveSkirmish();
	}

	/**
	 * 
	 * @method processScript
	 * @param {Object} event 
	 */
	processScript(event) {
		var universe = this;
		setTimeout(function() {
			var result = {},
				returned,
				finish,
				method;
			
			finish = function() {
				result.duration = Date.now() - result.start;
				universe.emit("send", result);
				console.log("Execution Result: ", result);
			};

			result.start = Date.now();
			result.recipients = {};
			result.recipients[event.player.id] = true;
			result.type = "universe:script:result";
			result.socket = event.socket;
			try {
				if(event && event.code) {
					result.code = event.code;
					if(event.player && event.player.gm && typeof(event.code) === "string") {
						method = new Function("player", "universe", "utility", "Random", "console", "module", "require", "global", "window", "document", "location", "process", "performance", "URL", "fetch", "exports", "Response", "Request", "EventTarget", "__filename", "__dirname", event.code);
						try {
							returned = method(event.player, universe, universe.utility, Random) || null;
							if(returned instanceof Promise) {
								returned
								.then(function(resultant) {
									result.returned = resultant;
									result.message = "Promised: Execution complete";
									result.status = 0;
									finish();
								})
								.catch(function(error) {
									result.returned = null;
									result.error = error;
									result.message = "Promised: Execution failed";
									result.status = 0;
									finish();
								});
							} else {
								result.returned = returned;
								result.message = "Execution complete";
								result.status = 0;
								finish();
							}
						} catch(exception) {
							result.returned = null;
							result.error = exception;
							result.message = "Execution failed: " + exception.message;
							result.status = 0;
							finish();
						}
					} else {
						result.message = "Access denied";
						result.status = 4;
						finish();
					}
				} else {
					result.message = "No code specified";
					result.status = 3;
					finish();
				}
			} catch(exception) {
				result.message = "Error processing script: " + exception.message;
				result.stack = exception.stack;
				result.error = exception;
				result.status = 5;
				finish();
			}
		}, 0);
	}

	/**
	 * Replace String references in an array with the identified object if they are "valid".
	 * @method transcribeArray
	 * @param {Array | String} array 
	 */
	transcribeArray(array) {
		var buffer,
			i;

		for(i=0; i<array.length; i++) {
			buffer = array[i];
			if(typeof(buffer) === "string") {
				buffer = this.get(buffer);
				if(this.isValid(buffer)) {
					array[i] = buffer;
				}
			}
		}
	}

	/**
	 * Emitted after a `toTime` invocation has finished procsessing all occurrences that
	 * should have been processed in the time transition.
	 * @event time:change
	 * @param {Integer} time 
	 */

	/**
	 * A temporary handler to let functionality be built with decent error reporting. Reporting
	 * using this function should later be revised and if this method is deemed appropriate, the
	 * `handleError` method should be used instead as this method is meant to double as a `TODO`
	 * flag for the code block.
	 * @method generalError
	 * @param {String} code 
	 * @param {Error} error 
	 * @param {String} [message] 
	 * @param {Object} [details] 
	 */
	generalError(code, error, message, details) {
		console.trace(" [!] Universe General Error Handling: " + (error?error.message:"No Error"));
		var anomaly = new Anomaly(code, message, 50, details, error);
		this.emit("error", anomaly);
	}

	/**
	 * 
	 * @method handleError
	 * @param {String} code 
	 * @param {Error} error 
	 * @param {String} [message]
	 * @param {Object} [details]
	 */
	handleError(code, error, message, details) {
		var anomaly = new Anomaly(code, message, 50, details, error);
		this.emit("error", anomaly);
	}

	/**
	 * 
	 * @method messagePlayer
	 * @param {String | RSObject} player ID
	 * @param {String} message Text
	 */
	messagePlayer(player, message) {
		this.emit("send", {
			"type": "notice",
			"recipient": player.id || player,
			"message": message,
			"anchored": true
		});
	}

	/**
	 * 
	 * @method messagePlayers
	 * @param {Object} players IDs
	 * @param {String} message Text
	 * @param {String} icon Text
	 * @param {Object} emission Event for UI
	 * @param {Number} timeout
	 */
	messagePlayers(players, message, icon, emission, timeout) {
		this.emit("send", {
			"type": "notice",
			"recipients": players,
			"message": message,
			"icon": icon,
			"anchored": true,
			"emission": emission,
			"timeout": timeout
		});
	}

	/**
	 * 
	 * @method notifyMasters
	 * @param {String} message 
	 * @param {Object} [data] 
	 */
	notifyMasters(message, data) {
		this.emit("send", {
			"type": "notice",
			"recipients": this.getMasters(),
			"message": message,
			"data": data,
			"timeout": 8000
		});
	}

	/**
	 * 
	 * @method warnMasters
	 * @param {String} message 
	 * @param {Object} [data] 
	 */
	warnMasters(message, data, timeout) {
		this.emit("send", {
			"type": "notice",
			"icon": "fas fa-exclamation-triangle rs-lightred",
			"recipients": this.getMasters(),
			"message": message,
			"data": data,
			"anchored": true,
			"timeout": timeout
		});
	}

	/**
	 * 
	 * @method objectHasKey
	 * @param {Object} object 
	 * @return {Boolean} True if the object exists and has at least one key
	 */
	objectHasKey(object) {
		if(typeof(object) === "object") {
			for(var test in object) {
				return true;
			}
		}
		return false;
	}
}

/**
 * 
 * @event send
 * @param {Object} message
 * @param {String} message.type For client processing
 */

module.exports = Universe;
