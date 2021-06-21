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
		
		this.MAX_HISTORY_LENGTH = 400;
		this.KEY = {};
		this.KEY.CLASSPREFIX = "_universe:" + (rsSystem.configuration.name || rsSystem.configuration.title || "name") + ":datacache:objects";
		this.KEY.DETAILS = "_universe:" + (rsSystem.configuration.name || rsSystem.configuration.title || "name") + ":datacache:details";
		this.KEY.METRICS = "_universe:" + (rsSystem.configuration.name || rsSystem.configuration.title || "name") + ":datacache:metrics";
		
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
			} else {
				this.backlog.push({
					"message": msg,
					"details": data,
					"level": level
				});
			}
		};
		
		this.history = [];
		
		this.buffer = [];
		this.buffer_delta = [];
		
		this.connection = {};
		
		this.metrics = {};
		this.metrics.dialation = 0;
		this.metrics.latency = 0;
		this.metrics.sync = 0;
		this.metrics.last = 0;
		
		this.state = {};
		this.state.loaded = false;
		this.state.initialized = false;
		this.state.synchronizing = false;
		this.state.initializing = true;
		this.state.version_warning = false;
		
		this.version = "Unknown";
		
		this._noBuffer = {};
		this._noBuffer.ping = true;
		
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

		this.index = {};
		
		this.named = {};
		
		this.listing = {};

		this.profile = {};
		
		rsSystem.EventBus.$on("universe-reconnect", () => {
			if(!this.connection.socket) {
				this.state.reconnectAttempts = 0;
				rsSystem.EventBus.$emit("dialog-dismiss");
				this.reconnect();
			}
		});
		
		this.processEvent = {};
		
		this.processEvent["time:changed"] = (event) => {
			Vue.set(this, "time", event.data.time);
			this.$emit("time:changed", event.data.time);
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
				"id": event.data.mid,
				"message": event.data.message,
				"icon": event.data.icon || "fas fa-exclamation-triangle rs-lightgreen",
				"event": event,
				"timeout": event.data.timeout,
				"anchored": event.data.anchored,
				"emission": event.data.emission
			});
		};
		this.processEvent["dismiss-message"] = (event) => {
			console.log("Dismiss: ", event.data);
			this.$emit("dismiss-message", {
				"id": event.data.mid
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

			this.$emit("notification", notice);
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
				this.cacheData();
				// localStorage.setItem(this.KEY.METRICS, JSON.stringify(this.metrics));
				// localStorage.setItem(this.KEY.CLASSPREFIX, LZString.compressToUTF16(JSON.stringify(this.listing)));
				
				Vue.set(this, "version", event.version);
				this.checkVersion();
				
				if(this.buffer_delta.length) {
					for(i=0; i<this.buffer_delta.length; i++) {
						this.receiveDelta(this.buffer_delta[i].received, this.buffer_delta[i].classification, this.buffer_delta[i].id, this.buffer_delta[i].delta);
					}
				}
				
				this.state.synchronizing = false;
				this.$emit("loaded", this);
			}, 0);
		};
		
		// TODO: Load Previous state, possibly caching universe state data to save sync time
		// 		Note: this.metrics is sent for the sync, so restoring its "sync" time will
		// 		offset data from the universe.
		try {
			var loadListing = localStorage.getItem(this.KEY.CLASSPREFIX),
				loadMetrics = localStorage.getItem(this.KEY.METRICS),
				loadIndex = {},
				loadNamed = {},
				keys,
				i,
				j;
				
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

	setProfile(profile) {
		if(profile) {
			this.profile = profile;
		}
	}

	/**
	 * 
	 * @method cacheData
	 */
	cacheData() {
		localStorage.setItem(this.KEY.METRICS, JSON.stringify(this.metrics));
		localStorage.setItem(this.KEY.CLASSPREFIX, LZString.compressToUTF16(JSON.stringify(this.listing)));
	}

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
	 * 
	 * @method receiveDelta
	 * @param {Integer} received 
	 * @param {String} classification 
	 * @param {String} id 
	 * @param {Object} delta 
	 */
	receiveDelta(received, classification, id, delta) {
		if(this.state.loaded) {
			var keys = Object.keys(delta),
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
			} else {
				rsSystem.log.error("Unknown Classification[@" + id + "]: " + classification, delta);
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
	
	addLogEvent(event, level, details) {
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
					this.reconnect();
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
					this.$emit(message.type, message.event || message.data);
					
					if(this.processEvent[message.type]) {
						this.processEvent[message.type](message);
					} else {
						this.$emit(message.type, message.event);
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
	 * @method reconnect
	 * @param {Object} [event] When available, the event that caused the disconnect. Used to retrieve
	 * 		the error code to determine if reconnecting should be attempted.
	 */
	reconnect(event) {
		setTimeout(() => {
			rsSystem.log.warn("Possible Reconnect: ", event);
			if((!event || event.code <4100) && this.state.reconnectAttempts < 5) {
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
	
	getObject(id) {
		var c;
		if(id && (c = this.getClassFromID(id)) && this.index[c]) {
			switch(c) {
				case "classes":
				case "fields":
					return this.index[c][id.substring(id.indexOf(":") + 1)];
					break;
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
	
	checkVersion() {
		if(this.version != rsSystem.version) {
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
			} else if(ui[1] !== app[1] && !this.state.version_warning) {
				this.state.version_warning = true;
				this.$emit("warning", {
					"id": "app:update",
					"message": "New Version Available",
					"icon": "fas fa-sync rs-lightyellow",
					"timeout": 20000,
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
			} else if(!this.state.version_warning) {
				this.state.version_warning = true;
				rsSystem.log.warn("New version available");
			}
		}
	}
}
