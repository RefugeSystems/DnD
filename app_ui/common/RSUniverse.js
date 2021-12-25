/**
 *
 * @class RSUniverse
 * @extends EventEmitter
 * @constructor
 * @module Common
 * @param {Object} details Source information to initialize the object
 * 		received from the Universe.
 */

/**
 * Connecting to the server
 * @event connecting
 */
/**
 * Connected to the server
 * @event connected
 */
/**
 * Getting objects from server
 * @event loading
 */
/**
 * Initial server sync complete
 * @event loaded
 */
class RSUniverse extends EventEmitter {
	constructor(details) {
		super();
		
		// TODO: Refactor to be cleaner
		rsSystem.universe = this;

		this.MAX_HISTORY_LENGTH = 400;
		this.MOVING_AVERAGE = 50;
		this.KEY = {};
		this.KEY.CLASSPREFIX = "_universe:" + (rsSystem.configuration.name || rsSystem.configuration.title || "name") + ":datacache:objects";
		this.KEY.DETAILS = "_universe:" + (rsSystem.configuration.name || rsSystem.configuration.title || "name") + ":datacache:details";
		this.KEY.METRICS = "_universe:" + (rsSystem.configuration.name || rsSystem.configuration.title || "name") + ":datacache:metrics";
		
		this.history = [];
		
		this.buffer = [];
		this.buffer_delta = [];
		
		this.connection = {};
		
		this.metrics = {};
		this.metrics.dialation = 0;
		this.metrics.latency = 0;
		this.metrics.sync = 0;
		this.metrics.last = 0;
		this.metrics.delta_average = 0;
		this.metrics.deltas = 0;
		this.metrics.dps = 0;
		this.metrics.dps_count = 0;
		this.metrics.dps_last = 0;
		this.metrics.dps_cap = 0;
		this.state = {};
		this.state.loaded = false;
		this.state.initialized = false;
		this.state.synchronizing = false;
		this.state.initializing = true;
		this.state.version_warning = false;
		
		this.version = "Unknown";
		
		try {
			// Shared Workers aren't fully supported yet, especially on Mobile browsers
			this.worker = new SharedWorker("shared.js");
			this.worker.port.onmessage = function(event) {
			    // console.log("Sync: ", event.data);
			};
			
			this.worker.onerror = function(e) {
			    console.error(e);
			};
			
			addEventListener("beforeunload", () => {
				this.worker.port.postMessage({
					"command":"closing"
				});
			});
		} catch(exception) {
			this.worker = null;
		}
		
		this.backlog = [];
		this.log = {};
		this.log.info = (msg, data) => {
			reportLog(msg, 30, data);
		};
		this.log.warn = this.log.warning = (msg, data) => {
			reportLog(msg, 40, data);
		};
		this.log.error = (msg, data) => {
			reportLog(msg, 50, data);
		};
		var reportLog = (msg, level, data) => {
			if(this.connection.socket) {
				this.send("event:log", {
					"message": msg,
					"details": data,
					"level": level
				});
			} else if(this.backlog.length < 20) {
				this.backlog.push({
					"message": msg,
					"details": data,
					"level": level
				});
			}
		};
		
		this._noBuffer = {};
		this._noBuffer.ping = true;
		
		/**
		 * 
		 * @property calendar
		 * @type rsSystem.Calendar
		 */
		this.calendar = new rsSystem.Calendar(this);
		// TODO: Abstract calendar
		this.calendar.nameMonths([
			"Alucevum",
			"Vaknaevum",
			"Borgevum",
			"Skaparvum",
			"Umqavum",
			"Comiaevum",
			"Unkulevum",
			"Dormevum"
		]);
		this.calendar.nameDays([
			"Horallum",
			"Horaneskja",
			"Horantono",
			"Horavis",
			"Horanquil",
			"Horakkir"
		]);
		this.calendar.setDays([25]);
		/**
		 * Maps class IDs to another object which maps object IDs
		 * to their corresponding object.
		 * @property index
		 * @type Object
		 */
		this.index = {};
		/**
		 * Maps class IDs to another object which maps object Names
		 * to their corresponding object. This is primarily for
		 * loose searches, such as the Showdown renderer, to allow
		 * data to specify an object inexactly.
		 * @property named
		 * @type Object
		 */
		this.named = {};
		/**
		 * Maps class IDs to a list of all objects of that class.
		 * Primarily for loop usage across a class.
		 * @property listing
		 * @type Object
		 */
		this.listing = {};
		/**
		 * The UI profile in use. This reference point for the profile
		 * should only be used by the universe or explicitly called out
		 * in Pivotal for tracking as this is slated for removal/cleaning
		 * to remove the dependency.
		 * @property profile
		 * @type Object
		 */
		this.profile = {};
		
		/**
		 * 
		 * @event universe-reconnect
		 */
		rsSystem.EventBus.$on("universe-reconnect", () => {
			if(!this.connection.socket) {
				this.state.reconnectAttempts = 0;
				rsSystem.EventBus.$emit("dialog-dismiss");
				this.reconnect();
			}
		});
		/**
		 * Maps event types that are handled internally to the
		 * methods that process them.
		 * 
		 * Should be considered private for dependency purposes.
		 * @property processEvent
		 * @type Object
		 * @private
		 */
		this.processEvent = {};
		
		this.processEvent["time:changed"] = (event) => {
			Vue.set(this, "timeline", event.data.timeline);
			Vue.set(this, "time", event.data.time);
			this.$emit("time:changed", event.data);
		};
		this.processEvent["unload"] = (event) => {
			console.warn("Unload Data: ", event);
			var classification = event.data.classification,
				id = event.data.id,
				i;

			if(this.index[classification] && this.index[classification][id]) {
				delete(this.index[classification][id]);
				for(i=0; i<this.listing[classification].length; i++) {
					if(this.listing[classification][i].id === id) {
						this.listing[classification].splice(i, 1);
						this.cacheData();
						return null;
					}
				}
			}
		};
		this.processEvent["notice"] = (event) => {
			this.$emit("notification", {
				"id": event.data.mid || event.data.id,
				"message": event.data.message,
				"icon": event.data.icon || "fas fa-exclamation-triangle rs-lightgreen",
				"event": event,
				"timeout": event.data.timeout,
				"anchored": event.data.anchored,
				"emission": event.data.emission
			});
		};
		this.processEvent["dismiss-message"] = (event) => {
			// console.log("Dismiss: ", event.data);
			this.$emit("dismiss-message", {
				"id": event.data.mid || event.data.id
			});
		};
		this.processEvent["log"] = (event) => {
			var notice = {
				"message": event.data.message || event.data.msg,
				"icon": event.data.level >= 50?"fas fa-exclamation-triangle rs-lightred":(event.data.level >= 40?"fas fa-exclamation-triangle rs-lightyellow":"fas fa-exclamation-triangle rs-lightgreen"),
				"event": event,
				"timeout": event.data.level < 40?10000:null,
				"anchored": event.data.level >= 40
			};

			if(this.profile && this.profile.collapse_system_alerts) {
				notice.id = "universe:log";
			}
			if(!this.profile || !this.profile.suppress_system_alerts) {
				this.$emit("notification", notice);
			} else {
				if(event.data.level <40) {
					console.log(notice);
				} else if(event.data.level <50) {
					console.warn(notice);
				} else {
					console.error(notice);
				}
			}
		};
		this.processEvent["system-warning"] = (event) => {
			this.$emit("notification", {
				"id": event.data.mid,
				"message": event.data.message,
				"icon": event.data.icon || "fas fa-exclamation-triangle rs-yellow",
				"event": event,
				"timeout": event.data.timeout,
				"anchored": event.data.anchored,
				"emission": event.data.emission
			});
		};
		this.processEvent["system-exception"] = (event) => {
			this.$emit("notification", {
				"id": event.data.mid,
				"message": event.data.message,
				"icon": event.data.icon || "fas fa-exclamation-triangle rs-lightred",
				"event": event,
				"timeout": event.data.timeout,
				"anchored": event.data.anchored,
				"emission": event.data.emission
			});
		};
		this.processEvent["account:updated"] = (event) => {
			this.$emit("notification", {
				"id": "account:modification",
				"message": "Account Updated",
				"icon": "fas fa-exclamation-triangle rs-lightgreen",
				"event": event,
				"timeout": 10000,
				"emission": event.data.emission
			});
		};
		this.processEvent["account:update:errors"] = (event) => {
			console.log("Failure: ", event);
			this.$emit("notification", {
				"id": "account:modification",
				"message": "Account Update Failed",
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"event": event,
				"timeout": 10000,
				"emission": event.data.emission
			});
		};
		
		this.processEvent["class"] = (event) => {
			if(event.data.update.attribute) {
				if(!this.index.classes[event.data.id].attribute) {
					this.index.classes[event.data.id].attribute = event.data.update.attribute;
				} else {
					Object.assign(this.index.classes[event.data.id].attribute, event.data.update.attribute);
				}
			}
		};
		this.processEvent.ping = (event) => {
			var latency = Date.now() - event.sent;
			if(this.metrics.latency) {
				this.metrics.latency = (this.metrics.latency + (latency/2))/2;
			} else {
				this.metrics.latency = latency/2;
			}
			this.metrics.latency = Math.floor(this.metrics.latency);
			this.metrics.dialation = event.pong - (event.sent + this.metrics.latency);
			Vue.set(this, "version", event.version);
			this.checkVersion();
		};
		this.processEvent.connected = (event) => {
			this.metrics.connected = Date.now();
			this.metrics.connected_server = event.sent;
			this.$emit("connected", this);
			this.sync();
		};
		this.processEvent.close = (event) => {
			this.metrics.closed = event.sent;
			this.$emit("closed");
		};
		this.processEvent.object = (event) => {
			this.receiveDelta(event.sent, event.data._class, event.data.id, event.data);
		};
		this.processEvent.sync = (event) => {
			this.$emit("loading", this);
			console.log("Syncing: " + (Date.now() - rsSystem.diagnostics.at.connect) + "ms");
			rsSystem.diagnostics.at.sync = Date.now();
			setTimeout(() => {
				// Let the display update then load the data
				var classes = Object.keys(event.data),
					objects,
					i,
					j;
					
				// console.log("Sync: ", event);
				this.state.loaded = true; // Set early to not delay receiveDelta
				for(i=0; i<classes.length; i++) {
					if(classes[i][0] !== "_") {
						if(!this.index[classes[i]]) {
							Vue.set(this.listing, classes[i], []); // event.data[classes[i]]);
							Vue.set(this.index, classes[i], {});
						}
						for(j=0; j<event.data[classes[i]].length; j++) {
							this.receiveDelta(event.sent, classes[i], event.data[classes[i]][j].id, event.data[classes[i]][j]);
						}
					}
				}
				
				Vue.set(this.metrics, "sync", event.sent);
				Vue.set(this, "timeline", event.data._timeline);
				Vue.set(this, "time", event.data._time);
				Vue.set(this, "players", event.players);
				this.$emit("time:changed", {
					"timeline": event.data._timeline,
					"time": event.data._time
				});
				console.log("Caching: " + (Date.now() - rsSystem.diagnostics.at.connect) + "ms");
				rsSystem.diagnostics.at.cache = Date.now();
				this.cacheData();
				// localStorage.setItem(this.KEY.METRICS, JSON.stringify(this.metrics));
				// localStorage.setItem(this.KEY.CLASSPREFIX, LZString.compressToUTF16(JSON.stringify(this.listing)));
				
				Vue.set(this, "version", event.version);
				this.checkVersion();
				
				console.log("Unbuffering: " + (Date.now() - rsSystem.diagnostics.at.connect) + "ms");
				rsSystem.diagnostics.at.buffer = Date.now();
				if(this.buffer_delta.length) {
					for(i=0; i<this.buffer_delta.length; i++) {
						this.receiveDelta(this.buffer_delta[i].received, this.buffer_delta[i].classification, this.buffer_delta[i].id, this.buffer_delta[i].delta);
					}
				}
				
				this.state.synchronizing = false;
				this.$emit("loaded", this);
				console.log("Ready: " + (Date.now() - rsSystem.diagnostics.at.connect) + "ms");
				rsSystem.diagnostics.at.finish = Date.now();
				console.log("Load Time: " + (rsSystem.diagnostics.at.finish - rsSystem.diagnostics.at.start) + "ms");
			}, 0);
		};
		
		// TODO: Load Previous state, possibly caching universe state data to save sync time
		// 		Note: this.metrics is sent for the sync, so restoring its "sync" time will
		// 		offset data from the universe.
		if(this.profile && this.profile.enable_cache) {
			try {
				var loadListing = localStorage.getItem(this.KEY.CLASSPREFIX),
					loadMetrics = localStorage.getItem(this.KEY.METRICS),
					loadIndex = {},
					loadNamed = {},
					keys,
					i,
					j;
					
				console.log("Loading Cache: " + (Date.now() - rsSystem.diagnostics.at.start) + "ms");
				rsSystem.diagnostics.at.load = Date.now();
				if(loadIndex && loadMetrics) {
					try {
						loadListing = JSON.parse(LZString.decompressFromUTF16(loadListing));
						keys = Object.keys(loadListing);
						for(i=0; i<keys.length; i++) {
							loadIndex[keys[i]] = {};
							for(j=0; j<loadListing[keys[i]].length; j++) {
								loadIndex[keys[i]][loadListing[keys[i]][j].id] = loadListing[keys[i]][j];
								loadNamed[loadListing[keys[i]][j].name] = loadListing[keys[i]][j];
							}
						}
						// console.log("Cached Action Max: ", _p(loadIndex.fields.action_max));
						// console.log("Cached Size: ", _p(loadIndex.fields.size));
						this.metrics = JSON.parse(loadMetrics);
						this.metrics.delta_average = this.metrics.delta_average || 0;
						this.listing = loadListing;
						this.index = loadIndex;
						this.named = loadNamed;
					} catch(exception) {
						console.error("Clearing cache, failed to load: ", exception);
						localStorage.removeItem(this.KEY.CLASSPREFIX);
						localStorage.removeItem(this.KEY.METRICS);
					}
				}
			} catch(abort) {
				this.addLogEvent("Failed to load saved universe data, aborting and allowing normal sync", 50, abort);
				Vue.set(this.metrics, "sync", 0);
			}
		}
	}

	/**
	 * 
	 * @method setProfile
	 * @deprecated Want to remove this dependency but currently need this for simple access to the profile.
	 * 		Will likely open control methods to manipulate the Universe object in relevent ways then mirror
	 * 		or move the profile under the universe for persistence.
	 * @param {Object} profile 
	 * @param {Boolean} [profile.enable_cache] When true, the current cache is deleted
	 */
	setProfile(profile) {
		console.log("Set Profile: " + (Date.now() - rsSystem.diagnostics.at.start) + "ms");
		rsSystem.diagnostics.at.profile = Date.now();
		if(profile) {
			this.profile = profile;
			if(!profile.enable_cache) {
				this.deleteCache();
			}
		}
	}

	/**
	 * 
	 * @method getCurrentMeeting
	 * @return {String} ID for the current active meeting, if any
	 */
	getCurrentMeeting() {
		return this.index.setting["setting:meeting"].value;
	}

	/**
	 * 
	 * @method cacheData
	 */
	cacheData() {
		console.log("Cache Data");
		if(this.profile && this.profile.enable_cache) {
			localStorage.setItem(this.KEY.METRICS, JSON.stringify(this.metrics));
			localStorage.setItem(this.KEY.CLASSPREFIX, LZString.compressToUTF16(JSON.stringify(this.listing)));
		} else {
			localStorage.removeItem(this.KEY.METRICS);
			localStorage.removeItem(this.KEY.CLASSPREFIX);
		}
	}

	/**
	 * 
	 * @method getImagePath
	 * @param {Object || String} id 
	 */
	getImagePath(image) {
		return  location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + (image.id || image);
	}

	/**
	 * Quick method for creating a simple notification for the UI.
	 * @method generalMessage
	 * @param {String} message 
	 * @param {String} icon 
	 * @param {Boolean | Number} display When true, anchored. When a number, specifies a timeout in ms.
	 */
	generalMessage(message, icon, display) {
		var notice = {
			"id": "account:modification",
			"message": message,
			"icon": icon || "fas fa-exclamation-triangle rs-lightyellow"
		};
		if(display === true) {
			notice.anchored = true;
		} else if(typeof(display) === "number") {
			notice.timeout = display;
		}
		this.$emit("notification", notice);
	}
	
	/**
	 * Handles processing data from the Server and pushing it into the Objects as needed.
	 * 
	 * Additionally, if the universe is not ready, the delta is buffered and read after
	 * a universe synchronization event. See the `processEvent.sync` method.
	 * @method receiveDelta
	 * @see Method at processEvent.sync
	 * @param {Integer} received 
	 * @param {String} classification 
	 * @param {String} id 
	 * @param {Object} delta 
	 */
	receiveDelta(received, classification, id, delta) {
		if(this.state.loaded) {
			var keys = Object.keys(delta),
				timing = Date.now(),
				okeys,
				k,
				x;
				
			if(this.debug) {
				console.log("Delta: ", _p(delta));
			}
			if(this.index[classification]) {
				// if(classification === "fields" && id === "action_max") {
				// 	console.log("Field Sync: " + id, _p(this.index[classification][id]), _p(delta));
				// }
				if(!this.index[classification][id]) {
					Vue.set(this.index[classification], id, delta);
					Vue.set(this.index[classification][id], "_sync", {});
					this.listing[classification].push(delta);
					if(delta.name) {
						Vue.set(this.named, delta.name, delta);
					}
					for(x=0; x<keys.length; x++) {
						Vue.set(this.index[classification][id]._sync, keys[x], received);
					}
					this.$emit("created", this.index[classification][id]);
				} else {
					for(x=0; x<keys.length; x++) {
						if(!this.index[classification][id]._sync[keys[x]] || this.index[classification][id]._sync[keys[x]] < received) {
							if(this.index[classification][id][keys[x]] === null || delta[keys[x]] === null) {
								Vue.set(this.index[classification][id], keys[x], delta[keys[x]]);
							} else if(delta[keys[x]] && (this.index[classification][id][keys[x]] instanceof Array)) {
								this.index[classification][id][keys[x]].splice(0);
								try {
									this.index[classification][id][keys[x]].push.apply(this.index[classification][id][keys[x]], delta[keys[x]]);
								} catch(e) {
									console.error("Delta Failed: ", e);
								}
							} else if(delta[keys[x]] && (typeof(this.index[classification][id][keys[x]]) === "object")) {
								okeys = Object.keys(this.index[classification][id][keys[x]]);
								for(k=0; k<okeys.length; k++) {
									Vue.delete(this.index[classification][id][keys[x]], okeys[k]);
								}
								okeys = Object.keys(delta[keys[x]]);
								for(k=0; k<okeys.length; k++) {
									Vue.set(this.index[classification][id][keys[x]], okeys[k], delta[keys[x]][okeys[k]]);
								}
							} else {
								Vue.set(this.index[classification][id], keys[x], delta[keys[x]]);
							}
							Vue.set(this.index[classification][id]._sync, keys[x], received);
						}
					}
				}
				this.$emit("updated", this.index[classification][id]);
			} else {
				rsSystem.log.error("Unknown Classification[@" + id + "]: " + classification, delta);
			}
			this.metrics.deltas++;
			// Calculate moving average for deltas per second
			// if(this.metrics.dps_last + 1000) {

			// } else {
			// 	this.metrics.dps_last = timing % 1000;
			// 	this.metrics.dps_cap = this.metrics.dps_last + 1000;
			// }
			// timing = Date.now() - timing;
			if(this.metrics.deltas < this.MOVING_AVERAGE) {
				this.metrics.delta_average -= this.metrics.delta_average/this.metrics.deltas;
				this.metrics.delta_average += timing/this.metrics.deltas;
			} else {
				this.metrics.delta_average -= this.metrics.delta_average/this.MOVING_AVERAGE;
				this.metrics.delta_average += timing/this.MOVING_AVERAGE;
			}
		} else {
			this.buffer_delta.push({
				received,
				classification,
				id,
				delta
			});
		}
		// if(classification === "fields" && id === "action_max") {
		// 	console.log("Field Sync Finish: " + id, _p(this.index[classification][id]), _p(delta));
		// }
	}
	
	/**
	 * Add an event to the UI log.
	 * 
	 * This is typically network events and used for diagnostics. These are NOT synced back
	 * to the server and primarily include general data regarding information from the
	 * server and thus should not be synced back.
	 * @method addLogEvent
	 * @param {String | Object} event A message or an object detailing various parts of
	 * 		the data to log.
	 * @param {Integer} [level] 
	 * @param {Object} [details] Describing the data for issue in an enumerated fashion,
	 * 		such as mapping key field IDs like `"entity": entity.id`.
	 */
	addLogEvent(event, level, details) {
		if(!this.profile || this.profile.enable_diagnostics) {
			// Fallback on logging if no profile is available as this may need logs and should be brief
			if(typeof(event) === "string") {
				event = {
					"message": event
				};
			}
			if(level) {
				event.level = level;
			} else if(!event.level) {
				if(typeof(event.status) === "number") {
					if(event.status > 500) {
						event.level = 60;
					} else if(event.status > 400) {
						event.level = 50;
					} else if(event.status > 300) {
						event.level = 40;
					} else if(event.status > 200) {
						event.level = 30;
					}
				} else if(typeof(event.code) === "number") {
					if(event.code > 500) {
						event.level = 60;
					} else if(event.code > 400) {
						event.level = 50;
					} else if(event.code > 300) {
						event.level = 40;
					} else if(event.code > 200) {
						event.level = 30;
					}
				}
			}
			if(details) {
				event.details = details;
			}
			if(!event.time) {
				event.time = Date.now();
			}
			this.history.unshift(event);
			if(this.history.length > this.MAX_HISTORY_LENGTH) {
				this.history.pop();
			}
			if(event.level === 40) {
				// rsSystem.log.warn(event);
			}
			if(event.level === 50) {
				// rsSystem.log.error(event);
			}
			if(event.level === 60) {
				// rsSystem.log.fatal(event);
			}
		}
	}

	/**
	 *
	 * @method connect
	 * @param {Object} session
	 * @param {String} address
	 */
	connect(session, address) {
		if(!address) {
			throw new Error("No address specified");
		}

		this.version = "Unknown";
		this.connection.session = session;
		this.connection.address = address;
		console.log("Connecting: " + (Date.now() - rsSystem.diagnostics.at.start) + "ms");
		rsSystem.diagnostics.at.connect = Date.now();

		return new Promise((done, fail) => {
			this.loggedOut = false;
			this.addLogEvent({
				"message": "Connecting to Universe",
				"address": address,
				"session": session.id
			});

			var socket = new WebSocket(address + "/connect?session=" + session.id);

			socket.onopen = (event) => {
				this.state.closing = false;
				this.state.opened = Date.now();
				this.state.reconnectAttempts = 0;
				this.addLogEvent("Connection Established", 30, event);
				if(this.state.reconnecting) {
					this.state.reconnecting = false;
					this.$emit("reconnected", this);
					this.$emit("notification", {
						"id": "universe:connection:status",
						"message": "Reconnected",
						"icon": "fas fa-exclamation-triangle rs-lightgreen",
						"event": event,
						"timeout": 10000
					});
				}
				this.$emit("connecting", this);
				if(this.state.initializing) {
					this.state.initializing = false;
					
					var ping = () => {
						this.send("ping", {
							"ping": Date.now()
						});
						setTimeout(ping, 360000);
					};
			
					setTimeout(ping, 10000);
					
					done(this);
				}
				
				if(this.buffer.length) {
					setTimeout(() => {
						var count,
						 	send;
						
						count = 0;
						while(this.buffer.length && count < 50) {
							send = this.buffer.shift();
							this.send(send.type, send.data);
							count++;
						}
						this.addLogEvent("Unbuffered waiting messages", 40, {count, "hadMore": !!this.buffer.length});
						this.buffer.splice(0);
						
						count = 0;
						while(this.backlog.length && count < 50) {
							send = this.backlog.shift();
							this.send("event:log", send);
							count++;
						}
					}, 0);
				}
			};

			socket.onerror = (event) => {
				this.addLogEvent("Connection Failure", 50, event);
				this.state.lastErrorAt = Date.now();
				this.state.lastError = "Connection Fault";
				this.connection.socket = null;
				if(!this.state.reconnecting) {
					this.addLogEvent("Mitigating Lost Connection", 40);
					this.state.reconnecting = true;
					this.$emit("error", {
						"message": "Connection Issues",
						"anchored": true,
						"event": event
					});
				}
				if(this.state.initializing) {
					this.state.initializing = false;
					console.error("Connect Fault: ", event);
					fail(event);
				} else {
					setTimeout(() => {
						this.reconnect();
					}, rsSystem.settings.reconnectTimeout);
				}
			};

			socket.onclose = (event) => {
				console.log("Close: ", event, this);
				this.addLogEvent("Connection Closed", 40, event);
				if(!this.state.closing) {
					if(event.code === 4000) {
						// Player Not Found: Bad username or passcode
						this.$emit("badlogin", {
							"message": "Bad login",
							"event": event
						});
					//} else if(event.code === 1013) { // Universe still initializing (Use Reconnect)
					} else if(!this.state.reconnecting) {
						this.addLogEvent("Mitigating Lost Connection", 40);
						this.state.lastErrorAt = Date.now();
						this.state.lastError = "Connection Fault";
						this.state.reconnecting = true;
						this.$emit("error", {
							"id": "universe:connection:status",
							"message": "Reconnecting...",
							"icon": "fas fa-exclamation-triangle rs-lightyellow",
							"anchored": true,
							"event": event
						});
						this.reconnect(event);
					}
				} else if(this.state.closing) {
					this.$emit("disconnected", this);
				}
				this.connection.socket = null;
				if(this.state.initializing) {
					this.state.initializing = false;
					fail(event);
				}
			};

			socket.onmessage = (event) => {
				var message,
					fulfill;

				Vue.set(this.metrics, "last", Date.now());

				try {
					message = JSON.parse(event.data);
					message.received = Date.now();
					if(message.version && message.version !== this.version) {
						this.version = message.version;
					}
					if(this.debugConnection || this.debug) {
						console.log("Received[" + this.state.initialized + "]: ", message, _p(message));
					}
					if(rsSystem.debug) {
						if(rsSystem.debug >= 10) {
							console.log("Received: ", message, _p(message));
						} else if(rsSystem.debug >= 5) {
							console.log("Received: ", message);
						} else {
							console.log("Received Message Type: " + message.type);
						}
					}
					
					this.addLogEvent(message.type + " Message received", message.type === "error"?50:30, message);
					if(this.processEvent[message.type]) {
						this.processEvent[message.type](message);
					} else {
						this.$emit(message.type, message.event || message.data);
						// this.$emit(message.type, message.event);
					}
				} catch(exception) {
					console.error("Communication Exception: ", exception);
					this.addLogEvent("Error processing message", 50, {event, exception});
					this.$emit("warning", {
						"message": {
							"text": "Failed to parse Universe Connection message"
						},
						"fields": {
							"message": message,
							"exception": exception
						}
					});
				}
			};
			
			this.connection.socket = socket;
		});
	}

	/**
	 * 
	 * @method getReconnectLimit
	 */
	getReconnectLimit() {
		if(this.profile) {
			return parseInt(this.profile.reconnectLimit) || Infinity;
		} else {
			return 60;
		}
	}

	/**
	 *
	 * @method reconnect
	 * @param {Object} [event] When available, the event that caused the disconnect. Used to retrieve
	 * 		the error code to determine if reconnecting should be attempted.
	 */
	reconnect(event) {
		setTimeout(() => {
			rsSystem.log.warn("Possible Reconnect: ", event);
			if((!event || event.code <4100) && this.state.reconnectAttempts < this.getReconnectLimit()) {
				this.$emit("error:reconnecting");
				this.$emit("error", {
					"id": "universe:connection:status",
					"message": "Reconnecting",
					"icon": "fas fa-sync rs-lightyellow fa-spin",
					"timeout": 15000,
					"event": event
				});
				rsSystem.log.warn("Connection Retrying...\n", this);
				this.state.reconnectAttempts++;
				this.connect(this.connection.session, this.connection.address)
				.catch((err) => {
					console.warn("Reconnect Failed: ", err);
				});
			} else {
				// this.$emit("disconnected", this);
				rsSystem.log.error("Reconnect Giving up\n", this);
				this.state.loggedOut = true;
				this.$emit("error:disconnected");
				this.$emit("error", {
					"id": "universe:connection:status",
					"message": "Connection Lost",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"anchored": true,
					"event": event,
					"emission": {
						"type": "dialog-open",
						"title": "Connection has been lost",
						"buttons": [{
							"classes": "fas fa-plug rs-lightgreen",
							"text": "Reconnect",
							"emission": "universe-reconnect"
						}, {
							"classes": "fas fa-exclamation-triangle rs-lightyellow",
							"text": "Refresh",
							"emission": "app-update"
						}]
					}
				});
			}
		}, 1000);
	}

	/**
	 *
	 * @method disconnect
	 */
	disconnect() {
		this.buffer.splice(0);
		if(!this.connection.socket) {
			this.connection.entry("Unable to disconnect, Universe not connected", 40);
		} else {
			this.addLogEvent("Disconnecting");
			this.connection.socket.close();
			this.connection.address = null;
			this.connection.socket = null;
			this.state.reconnecting = false;
			this.state.closing = true;
		}
	}

	/**
	 *
	 * @method logout
	 */
	logout() {
		this.state.loggedOut = true;
		this.disconnect();
	}

	/**
	 *
	 * @method send
	 * @param {String} type
	 * @param {Object} data
	 * @param {String} [player] ID
	 */
	send(type, data, player) {
		data = data || {};
		var sending;

		if(this.connection.socket) {
			sending = {
				"sent": Date.now(),
				"type": type,
				"data": data
			};
			if(this.debugConnection || this.debug) {
				console.log("Sending[" + this.state.initialized + "]: ", sending);
			}
			if(rsSystem.debug) {
				if(rsSystem.debug >= 10) {
					console.log("Sending: ", sending, _p(sending));
				} else if(rsSystem.debug >= 5) {
					console.log("Sending: ", sending);
				} else {
					console.log("Sending Message Type: " + type);
				}
			}
			this.connection.socket.send(JSON.stringify(sending));
		} else if(!this._noBuffer[type]) {
			// TODO: Buffer for connection restored
			this.addLogEvent("Buffering message for no socket", 40, {"address": this.connection.address, type, data});
			this.buffer.push({
				"type": type,
				"data": data
			});
		}
	}
	
	
	sync() {
		var details,
			state;
		
		// console.warn("Synchronizing: ", this.metrics.sync);
		
		if(!this.state.synchronizing) {
			this.state.synchronizing = true;
			if(this.state.initialized) {
				this.$emit("initializing");
			} else {
				this.$emit("syncing");
			}
			
			this.send("sync", this.metrics);
		}
	}
	
	resync() {
		localStorage.removeItem(this.KEY.DETAILS);
		localStorage.removeItem(this.KEY.METRICS);
		this.metrics.sync = 0;
		this.state.loaded = false;
		this.sync();
	}
	
	
	deleteCache() {
		try {
			localStorage.removeItem(this.KEY.CLASSPREFIX);
			localStorage.removeItem(this.KEY.DETAILS);
			localStorage.removeItem(this.KEY.METRICS);
		} catch(abort) {
			console.error("Delete Failed: ", abort);
			this.addLogEvent("Failed to clear Universe Cache, aborting and allowing normal sync", 50, abort);
			Vue.set(this.metrics, "sync", 0);
		}
	}
	
	/*
	exportData() {
		var appendTo = $("#anchors")[0],
			anchor = document.createElement("a");

		appendTo.appendChild(anchor);
		anchor.href = URL.createObjectURL(new Blob([JSON.stringify(this.listing, null, "\t")]));
		anchor.download = "universe_complete." + Date.now() + ".json";

		anchor.click();
		URL.revokeObjectURL(anchor.href);
		appendTo.removeChild(anchor);
	}
	*/
	
	exportData(title) {
		var appendTo = $(document).find("#anchors")[0],
			anchor = document.createElement("a"),
			keys = Object.keys(this.listing),
			exporting = {},
			i,
			j;
			
		exporting.classes = [];
		exporting.fields = [];
		exporting.export = [];
		if(!title) {
			title = document.title || "universe";
		}
		title = title.replace(/ /g, "_").toLowerCase();

		for(i=0; i<keys.length; i++) {
			for(j=0; j<this.listing[keys[i]].length; j++) {
				if(keys[i] === "classes" || keys[i] === "fields") {
					exporting[keys[i]].push(this.listing[keys[i]][j]);
				} else {
					exporting.export.push(this.listing[keys[i]][j]._data);
				}
			}
		}

		appendTo.appendChild(anchor);
		anchor.href = URL.createObjectURL(new Blob([JSON.stringify({"export": exporting}, null, "\t")]));
		anchor.download = title + ".export." + Date.now() + ".json";
		anchor.click();
		
		URL.revokeObjectURL(anchor.href);
		appendTo.removeChild(anchor);
	}
	
	exportFilteredData(title, data) {
		var appendTo = $(document).find("#anchors")[0],
			anchor = document.createElement("a"),
			exporting = {},
			i;
			
		exporting.classes = [];
		exporting.fields = [];
		exporting.export = [];
		if(!title) {
			title = document.title || "universe";
		}
		title = title.replace(/ /g, "_").toLowerCase();

		for(i=0; i<data.length; i++) {
			exporting.export.push(data[i]);
		}

		appendTo.appendChild(anchor);
		anchor.href = URL.createObjectURL(new Blob([JSON.stringify({"export": exporting}, null, "\t")]));
		anchor.download = title + ".export." + Date.now() + ".json";
		anchor.click();
		
		URL.revokeObjectURL(anchor.href);
		appendTo.removeChild(anchor);
	}
	
	getObject(id) {
		var c;
		if(id && (c = this.getClassFromID(id)) && this.index[c]) {
			switch(c) {
				case "classes":
				case "fields":
					return this.index[c][id.substring(id.indexOf(":") + 1)];
				default:
					return this.index[c][id];
			}
		}
		return null;
	}
	
	getNamed(name) {
		return this.named[name] || null;
	}
	
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
	
	isOwner(player, object) {
		return !object.is_owned || object.owned[player.id || player];
	}

	/**
	 * 
	 * @method transcribeInto
	 * @param {Array} source 
	 * @param {Array} [destination]
	 * @param {String} [classificaiton]
	 * @return {Array} The destination parameter or a newly instantiated array
	 * 		if that parameter was omited.
	 */
	transcribeInto(source, destination = [], classificaiton, filter) {
		filter = (filter || "").toLowerCase();
		var buffer,
			i;

		if(classificaiton && this.index[classificaiton]) {
			for(i=0; i<source.length; i++) {
				buffer = this.index[classificaiton][source[i]];
				if(buffer && !buffer.disabled && !buffer.is_preview && (!filter || (buffer._search && buffer._search.indexOf(filter) !== -1))) {
					destination.push(buffer);
				}
			}
		} else {
			for(i=0; i<source.length; i++) {
				buffer = this.getObject(source[i]);
				if(buffer && !buffer.disabled && !buffer.is_preview && (!filter || (buffer._search && buffer._search.indexOf(filter) !== -1))) {
					destination.push(buffer);
				}
			}
		}

		return destination;
	}

	/**
	 * Transcribe into an array ensuring that the IDs are only moved into the array once.
	 * @method transcribeUniquely
	 * @param {Array} source 
	 * @param {Array} [destination]
	 * @param {String} [classificaiton]
	 * @return {Array} The destination parameter or a newly instantiated array
	 * 		if that parameter was omited.
	 */
	transcribeUniquely(source, destination = [], classificaiton, filter) {
		filter = (filter || "").toLowerCase();
		var unique = {},
			buffer,
			i;

		if(classificaiton && this.index[classificaiton]) {
			for(i=0; i<source.length; i++) {
				if(!unique[source[i]]) { // Save a cycle if possible
					buffer = this.index[classificaiton][source[i]];
					if(buffer && !buffer.disabled && !buffer.is_preview && (!filter || (buffer._search && buffer._search.indexOf(filter) !== -1))) {
						unique[buffer.id] = true;
						destination.push(buffer);
					}
				}
			}
		} else {
			for(i=0; i<source.length; i++) {
				if(!unique[source[i]]) { // Save a cycle if possible
					buffer = this.getObject(source[i]);
					if(buffer && !buffer.disabled && !buffer.is_preview && (!filter || (buffer._search && buffer._search.indexOf(filter) !== -1))) {
						unique[buffer.id] = true;
						destination.push(buffer);
					}
				}
			}
		}

		return destination;
	}
	
	checkVersion() {
		if(!this.serviceWorkerIssues && !rsSystem.options.suppress_update_warning && this.version != rsSystem.version) {
			var ui = rsSystem.version.split("."),
				app = this.version.split(".");
			
			if(ui[0] !== app[0]) {
				this.$emit("error", {
					"id": "app:update",
					"message": "New Version Required",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"anchored": true,
					"emission": {
						"type": "dialog-open",
						"title": "Refresh page for new version?",
						"buttons": [{
							"classes": "fas fa-check rs-lightgreen",
							"text": "Yes",
							"emission": "app-update"
						}, {
							"classes": "fas fa-times rs-lightred",
							"text": "No",
							"emission": "dialog-dismiss"
						}]
					}
				});
			} else if(navigator.serviceWorker && navigator.serviceWorker.controller) {
				this.state.version_warning = true;
				navigator.serviceWorker.controller.postMessage({
					"action": "update"
				});
				this.$emit("warning", {
					"id": "app:update",
					"message": "New Version Available",
					"icon": "fas fa-exclamation-triangle rs-lightyellow",
					"anchored": true,
					"emission": {
						"type": "dialog-open",
						"title": "Refresh page for new version?",
						"buttons": [{
							"classes": "fas fa-check rs-lightgreen",
							"text": "Yes",
							"emission": "app-update"
						}, {
							"classes": "fas fa-times rs-lightred",
							"text": "No",
							"emission": "dialog-dismiss"
						}]
					}
				});
			} else {
				this.serviceWorkerIssues = true;
				// Not currently invoke this as this tends to happen when the page is ignored for awhile currently, the ignoring/timeout is expected
				// and the control warning is aimed at when the user is actively trying to update. However if the page has been active for more than
				// a day AND this issue comes up, the warning isprobably relevent.
				//rsSystem.controls.serviceWorkerFault();
				console.warn("Issues with Service Worker");
			}
		}
	}
}
