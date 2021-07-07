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

	Chronicle = require("../storage/chronicle"),
	Anomaly = require("../management/anomaly"),
	
	DNDCalculator = require("./calculator/dnd"),
	PlayerConnection = require("./player"),
	ObjectHandler = require("./objects"),
	
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
			connection.on("connected", () => {
				
			});
			
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
	 * @param {String} id 
	 * @param {Object} [mask]
	 * @param {Function} callback 
	 */
	copy(id, mask, callback) {
		var source = this.get(id),
			details = {};
		
		if(typeof(mask) === "function" && !callback) {
			callback = mask;
			mask = {};
		}

		if(source) {
			mask.is_template = false;
			mask.is_copy = true;
			if(source.is_template) {
				Object.assign(details, mask);
				if(source.template_process) {
					// TODO: Handle Template Processing
				}
			} else {
				Object.assign(details, source._data, mask);
			}
			details.id = Random.identifier(source._class, 10, 32).toLowerCase();
			details.parent = id;
			this.createObject(details, callback);
		} else {
			callback(new Anomaly("universe:object:copy", "Unable to find source object", 50, {id}, null, this));
		}
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
	 * @method createObject
	 * @param  {[type]}   details  [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	createObject(details, callback) {
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
							this.emit("object-created", created.toJSON());
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
			manager,
			sync,
			f,
			m,
			x;
		
		// TODO: Investigate time commitment here, may need broken up to prevent bad lockups
		state.classes = [];
		state.fields = [];
		state._timeline = this.timeline;
		state._time = this.time;
		
		for(m=0; m<managers.length; m++) {
			manager = this.manager[managers[m]];
			if(!omittedFromSync[managers[m]] && (!managers[m].attribute || !managers[m].attribute.server_only)) {
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
						if((!time || time <= sync.updated) && (!sync.attribute.master_only || player.gm) && !sync.attribute.no_sync) {
							if(!player.gm && master_fields.length) {
								delete(sync._data);
								for(f=0; f<master_fields.length; f++) {
									if(sync[master_fields[f]] !== undefined) {
										delete(sync[master_fields[f]]);
									}
								}
							}
							if(player.gm) {
								sync._search += " ::: " + sync.id;
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
	 * @method toTime
	 * @param {Integer} end [description]
	 * @param {Boolean} lock The Timeline. Pass as true to jump times without processing or timeline jumping.
	 */
	 toTime(end, lock) {
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

		this.time = end;
		this.manager.setting.object["setting:time"].setValues({
			"value": this.time
		});
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
		console.trace(" [!] Universe General Error Handling: " + error.message);
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
	 * @method notifyMasters
	 * @param {String} message 
	 * @param {Object} [data] 
	 */
	warnMasters(message, data) {
		this.emit("send", {
			"type": "notice",
			"icon": "fas fa-exclamation-triangle rs-lightred",
			"recipients": this.getMasters(),
			"message": message,
			"data": data,
			"anchored": true
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
