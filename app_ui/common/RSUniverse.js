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
		
		this.MAX_LOG_LENGTH = 400;
		
		try {
			// Workers aren't fully supported yet, expecially on Mobile browsers
			this.worker = new SharedWorker("shared.js");
			this.worker.port.onmessage = function(event) {
			    console.log("Sync: ", event.data);
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
		
		this.log = [];
		
		this.buffer = [];
		
		this.connection = {};
		
		this.metrics = {};
		this.metrics.dialation = 0;
		this.metrics.latency = 0;
		this.metrics.sync = 0;
		this.metrics.last = 0;
		
		
		this.state = {};
		this.state.initialized = false;
		this.state.synchronizing = false;
		
		this.version = "Unknown";
		
		this._noBuffer = {};
		this._noBuffer.ping = true;
		
		this.indexes = {};
		
		this.listing = {};
		
		this.processEvent = {};
		this.processEvent.ping = (event) => {
			var latency = Date.now() - event.sent;
			if(this.metrics.latency) {
				this.metrics.latency = (this.metrics.latency + (latency/2))/2;
			} else {
				this.metrics.latency = latency/2;
			}
			this.metrics.latency = Math.floor(this.metrics.latency);
			this.metrics.dialation = event.received - (event.sent + this.metrics.latency);
		};
		this.processEvent.connected = (event) => {
			console.warn("Connected to Server: ", event);
			this.metrics.connected = Date.now();
			this.metrics.connected_server = event.sent;
			this.$emit("connected");
			this.send("sync", {"sync": 0});
		};
		this.processEvent.close = (event) => {
			console.warn("Server Close Received: ", event);
			this.metrics.closed = event.sent;
			this.$emit("closed");
		};
		this.processEvent.sync = (event) => {
			console.warn("Server State Received: ", event);
			this.metrics.sync = event.sent;
			this.$emit("loading");
			setTimeout(() => {
				// Let the display update then load the data
				var classes = Object.keys(event.data),
					object,
					x;
				
				this.$emit("loaded");
			}, 0);
		};
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
		this.log.unshift(event);
		if(this.log.length > this.MAX_LOG_LENGTH) {
			this.log.pop();
		}
		if(event.level === 40) {
			rsSystem.log.warn(event);
		}
		if(event.level === 50) {
			rsSystem.log.error(event);
		}
		if(event.level === 60) {
			rsSystem.log.fatal(event);
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

		var initializing = true;
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
				this.addLogEvent("Connection Established", 30, event);
				if(this.state.reconnecting) {
					this.state.reconnecting = false;
					this.$emit("reconnected", this);
				}
				this.$emit("connecting", this);
				if(initializing) {
					initializing = false;
					
					var ping = () => {
						this.send("ping", {
							"ping": Date.now()
						});
						setTimeout(ping, 60000);
					};
			
					setTimeout(ping, 10000);
					
					done(this);
				}
				
				if(this.buffer.length) {
					setTimeout(() => {
						var count = 0;
						while(this.buffer.length && count < 50) {
							this.send(this.buffer.shift());
							count++;
						}
						this.addLogEvent("Unbuffered waiting messages", 40, {count, "hadMore": !!this.buffer.length});
						this.buffer.splice(0);
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
						"event": event
					});
				}
				if(initializing) {
					initializing = false;
					console.log("Connect Fault: ", event);
					fail(this);
				} else {
					this.reconnect();
				}
			};

			socket.onclose = (event) => {
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
							"message": "Connection Issues",
							"event": event
						});
						this.reconnect(event);
					}
				} else if(this.state.closing) {
					this.$emit("disconnected", this);
				}
				this.connection.socket = null;
				if(initializing) {
					initializing = false;
					fail(this);
				}
			};

			socket.onmessage = (event) => {
				var message,
					fulfill;

				this.metrics.sync = event.time;
				this.metrics.last = Date.now();

				try {
					message = JSON.parse(event.data);
					message.received = Date.now();
					console.log("Received: ", message);
					if(message.version && message.version !== this.version) {
						this.version = message.version;
					}
					if(this.debugConnection || this.debug || rsSystem.debug) {
						console.log("Connection - Received: ", _p(message));
					}
					
					this.addLogEvent(message.type + " Message received", message.type === "error"?50:30, message);
					this.$emit(message.type, message.event);
					
					if(this.processEvent[message.type]) {
						this.processEvent[message.type](message);
					} else {
						this.$emit(message.type + ":complete", message.event);
					}
				} catch(exception) {
					console.error("Communication Exception: ", exception);
					this.addLogEvent("Error processing message", 50, {event, exception});
					this.$emit("warning", {
						"message": {
							"text": "Failed to parse AQ Connection message"
						},
						"fields": {
							"message": message,
							"exception": exception
						}
					});
				}
			};

			this.$on("synchronize", (event) => {
				if(this.state.synchronizing) {
					this.addLogEvent("Synchronizing", 20, {event});
					console.log("Sync Event: ", event);
					this.$emit("initialized");
				} else {
					this.addLogEvent("Erroneous Synchronization Event skipped", 40, {event});
				}
			});

			this.$on("model:deleted", (event) => {
				var record = this.nouns[event.classed][event.id];
				if(record) {
					if(this.debug || rsSystem.debug) {
						console.warn("Deleting Record: " + (event.classed) + " - " + event.id + ": ", event, record);
					}

					this.index.unindexItem(record);
					if(this.indexes[event.classed]) {
						this.indexes[event.classed].unindexItem(record);
						delete(this.nouns[event.classed][event.id]);
					}

					this.$emit("modified", this);
				}
			});

			this.$on("model:modified", (event) => {
				console.log("Event: ", event);
				var record = this.nouns[event.classed][event.id];
				if(record) {
					record.receiveUpdate(event.modification);
				} else {
					if(!this.nouns[event.classed]) {
						this.nouns[event.classed] = {};
					}
					this.nouns[event.classed][event.id] = new rsSystem.availableNouns[event.classed](event.modification, this);
					this.indexes[event.classed].indexItem(this.nouns[event.classed][event.id]);
					this.index.indexItem(this.nouns[event.classed][event.id]);
					this.$emit("universe:built", this.nouns[event.classed][event.id]);
				}
				this.$emit("modified", this);
			});

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
			if((!event || event.code <4100) && this.connection.retries < 5) {
				rsSystem.log.warn("Connection Retrying...\n", this);
				this.state.reconnectAttempts++;
				this.state.retries++;
				this.connect(this.connection.session, this.connection.address);
			} else {
				this.$emit("disconnected", this);
				rsSystem.log.error("Reconnect Giving up\n", this);
				this.state.loggedOut = true;
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
	 */
	send(type, data) {
		data = data || {};
		var sending;

		if(this.connection.socket) {
			this.state.retries = 0;
			sending = {
				"sent": Date.now(),
				"type": type,
				"data": data
			};
			
			if(this.debugConnection) {
				console.log("Connection - Sending: ", sending);
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
}
