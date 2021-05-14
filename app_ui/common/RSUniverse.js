/**
 *
 * @class RSUniverse
 * @extends RSObject
 * @constructor
 * @module Common
 * @param {Object} details Source information to initialize the object
 * 		received from the Universe.
 */
class RSUniverse extends EventEmitter {
	constructor(details) {
		super();

		/**
		 * Tracks if the system has been logged out and flags as such to prevent
		 * automatic reconnection attempts.
		 *
		 * Automatic connection processing tends to be handled in the Connect component.
		 * @property loggedOut
		 * @type Boolean
		 */
		this.index = new SearchIndex();
		this.version = "Disconnected";
		this.debugConnection = false;
		this.initialized = false;
		this.loggedOut = false;

		this.processEvent = {};
		this.timeouts = {};
		this.indexes = {};
		this.echoed = {};
		this.nouns = {};

		this.echoTimeout = 10000;
		this.indexes.all = this.index;
		this.latency = 0;

		this.connection = {};
		this.connection.maxHistory = 100;
		this.connection.authenticator = null;
		this.connection.user = null;
		this.connection.reconnectAttempts = 0;
		this.connection.connectMark = 0;
		this.connection.retries = 0;
		this.connection.reconnecting = false;
		this.connection.closing = false;
		this.connection.master = false;
		this.connection.lastError = false;
		this.connection.history = [];

		this.importing = {};
		this.importing.active = false;
		this.importing.abort = false;
		this.importing.imported = [];
		this.importing.skipped = [];
		this.importing.failed = [];
		/**
		 *
		 * @method connection.entry
		 * @param {String} message String as a short description
		 * @param {Number} [level] See https://github.com/trentm/node-bunyan#levels. Default is 30
		 * @param {Object} [data] Arguments attempt to allocate passed objects here.
		 * @param {Object} [error] Information, is explicit about argument position.
		 */
		this.connection.entry = (message, level, data, error) => {
			var entry = {};

			if(typeof(message) === "object") {
				data = message;
				message = undefined;
			} else if(typeof(message) === "number") {
				level = message;
				message = undefined;
			}

			if(level === undefined) {
				level = 30;
			} else if(typeof(level) === "object") {
				data = level;
				level = 30;
			}

			entry.user = this.connection.user.toJSON();
			entry.time = Date.now();
			entry.message = message;
			entry.level = level;
			entry.error = error;
			entry.data = data;

			this.connection.history.unshift(entry);
			if(this.connection.history.length > this.connection.maxHistory) {
				this.connection.history.pop();
			}
		};

		this.tracking = {};

		if(!details.calculator) {
			this.calculator = new RSCalculator(this);
		}

		/**
		 * Logging point for this universe.
		 * @property log
		 * @type RSLog
		 */
		this.log = new RSLog(this);

		this.$on("world:state", (event) => {
			if(!this.initialized) {
				this.$emit("initializing", event);
			}
			this.loadState(event);
		});

		this.processEvent.ping = (event) => {
			var latency = event.received - event.ping;
			if(this.latency) {
				this.latency = (this.latency + (latency/2))/2;
			} else {
				this.latency = latency/2;
			}
			this.latency = parseInt(this.latency);
		};

		var ping = () => {
			this.send("ping", {
				"ping": Date.now()
			});
			setTimeout(ping, 60000);
		};

		setTimeout(ping, 10000);
	}

	/**
	 *
	 * @method connect
	 * @param {UserInformation} userInformation
	 * @param {String} address
	 */
	connect(userInformation, address) {
		if(!address) {
			throw new Error("No address specified");
		}

		if(!userInformation) {
			userInformation = rsSystem.AnonymousUser;
		}

		this.version = "Unknown";
		this.connection.user = userInformation;
		this.connection.address = address;

		return new Promise((done, fail) => {
			this.loggedOut = false;
			this.connection.entry("Connecting to Universe", {
				"address": address
			});

			var socket = new WebSocket(address + "?authenticator=" + userInformation.token + "&username=" + userInformation.username + "&id=" + userInformation.id + "&name=" + userInformation.name + "&passcode=" + userInformation.passcode);

			socket.onopen = (event) => {
				this.closing = false;
				this.connection.connectMark = Date.now();
				this.connection.entry("Connection Established", event);
				if(this.connection.reconnecting) {
					this.connection.reconnecting = false;
					this.$emit("reconnected", this);
				}
				this.$emit("connected", this);
			};

			socket.onerror = (event) => {
				this.connection.entry("Connection Failure", 50, event);
				rsSystem.log.fatal({
					"message": "Connection Failure",
					"error": event
				});
				this.connection.lastErrorAt = Date.now();
				this.connection.lastError = "Connection Fault";
				this.connection.socket = null;
				if(!this.connection.reconnecting) {
					this.connection.entry("Mitigating Lost Connection", 40);
					this.connection.reconnecting = true;
					this.$emit("error", {
						"message": "Connection Issues",
						"event": event
					});
				}
				this.reconnect();
			};

			socket.onclose = (event) => {
				this.connection.entry("Connection Closed", 40, event);
				if(!this.connection.closing) {
					if(event.code === 4000) {
						// Player Not Found: Bad username or passcode
						this.$emit("badlogin", {
							"message": "Bad login",
							"event": event
						});
					//} else if(event.code === 1013) { // Universe still initializing (Use Reconnect)
					} else if(!this.connection.reconnecting) {
						this.connection.entry("Mitigating Lost Connection", 40);
						this.connection.lastErrorAt = Date.now();
						this.connection.lastError = "Connection Fault";
						this.connection.reconnecting = true;
						this.$emit("error", {
							"message": "Connection Issues",
							"event": event
						});
						this.reconnect(event);
					}
				} else if(this.connection.closing) {
					this.$emit("disconnected", this);
				}
				this.connection.socket = null;
			};

			socket.onmessage = (event) => {
				var message,
					fulfill;

				this.connection.syncMark = event.time;
				this.connection.last = Date.now();

				try {
					message = JSON.parse(event.data);
					message.received = Date.now();
					message.sent = parseInt(message.sent);
					if(message.version && message.version !== this.version) {
						this.version = message.version;
					}
					if(this.debugConnection || this.debug || rsSystem.debug) {
						console.log("Connection - Received: ", _p(message), this.echoed[message.echo]);
					}
					if(message.echo && typeof(this.echoed[message.echo]) === "function") {
						fulfill = this.echoed[message.echo];
						clearTimeout(this.timeouts[message.echo]);
						delete(this.timeouts[message.echo]);
						delete(this.echoed[message.echo]);
						fulfill(message.data || message.event || message);
					} else if(message.echo && message.event && !message.event.echo) {
						message.event.echo = message.echo;
						message.echo = this.echoed[message.echo];
						delete(this.echoed[message.echo]);
					}

					this.$emit(message.type, message.event);
					if(message.echo) {
						this.$emit("echoing", message);
					}

					this.connection.entry(message.type + " Message received", message.type === "error"?50:30, message);
					if(this.debugConnection || this.debug) {
						console.log("Emission[" + message.type + ":complete]: ", message.event);
					}
					if(this.processEvent[message.type]) {
						this.processEvent[message.type](message);
					} else {
						this.$emit(message.type + ":complete", message.event);
					}
				} catch(exception) {
					console.error("Communication Exception: ", exception);
					this.connection.entry("Error processing message", 50, event, exception);
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
			/*
			this.$on("model:modified", (event) => {
				console.info("Record Modification: ", event);
				var record = this.nouns[event.classed || event.type][event.id];
				if(record) {
					if(this.debug || rsSystem.debug) {
						console.info("Modifying Record: " + (event.classed || event.type) + " - " + event.id + ": ", event);
					}
					record.loadDelta(event.modification);
				} else {
					if(this.debug || rsSystem.debug) {
						console.warn("Building new record: " + (event.classed || event.type) + " - " + event.id + ": ", event);
					}
					if(!this.nouns[event.classed || event.type]) {
						this.nouns[event.classed || event.type] = {};
					}
					this.nouns[event.classed || event.type][event.id] = new rsSystem.availableNouns[event.classed || event.type](event.modification, this);
					this.nouns[event.classed || event.type][event.id].recalculateProperties();
					this.indexes[event.classed || event.type].indexItem(this.nouns[event.classed || event.type][event.id]);
					this.index.indexItem(this.nouns[event.classed || event.type][event.id]);
					this.$emit("universe:built", this.nouns[event.classed || event.type][event.id]);
				}
				this.$emit("modified", this);
			});
			*/

			this.$on("entity:rolled", (event) => {
				var record = this.nouns.entity[event.id];
				if(record) {
					event.type = "rolled";
					record.performActionEvent(event);
				}
			});

			this.$on("entity:action", (event) => {
				var record = this.nouns[event._class || event.type][event.id];
				if(record) {
					if(this.debug || rsSystem.debug) {
						console.info("Entity Action Received: " + (event._class || event.type) + " - " + event.id + ": ", event);
					}
					record.performActionEvent(event.modification);
				} else {
					rsSystem.log.error("Event Target Missing", event);
				}
			});

			this.$on("control", (event) => {
				if(this.debugConnection) {
					console.warn("Control Event: ", event);
				}
				switch(event.data.control) {
					case "page":
						if(document.hasFocus() && this.checkEventCondition(event.data.condition)) {
							window.location = "#" + event.data.url;
						}
						break;
				}
			});

			this.$on("data:receive", (event) => {
				this.loadData(event);
			});

			this.connection.socket = socket;
			this.user = userInformation;
			done();
		});
	}

	/**
	 *
	 * @method calculateExpression
	 * @param {String} expression
	 * @param {RSObject} source
	 * @param {Object} base
	 * @param {RSObject} target
	 * @return {String}
	 */
	calculateExpression(expression, source, base, target) {
		if(this.calculator) {
			return this.calculator.process(expression, source, base, target).toString();
		} else {
			return expression.toString();
		}
	}

	/**
	 *
	 * @method displayExpression
	 * @param {String} expression
	 * @param {RSObject} source
	 * @param {Object} base
	 * @param {RSObject} target
	 * @return {String}
	 */
	displayExpression(expression, source, base, target) {
		if(this.calculator) {
			return this.calculator.display(expression, source, base, target).toString();
		} else {
			return expression.toString();
		}
	}

	checkEventCondition(condition) {
		if(!condition) {
			return true;
		}

		var keys = Object.keys(condition),
			result = true,
			buffer,
			x;

		for(x=0; result && x<keys.length; x++) {
			switch(keys[x]) {
				case "hash":
					buffer = new RegExp(condition[keys[x]]);
					result = buffer.test(location.hash);
					break;
				default:
					console.warn("Unknown Event Conditional[" + keys[x] + "]: ", condition);
			}
		}

		return result;
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
				this.connection.reconnectAttempts++;
				this.connection.retries++;
				this.connect(this.connection.user, this.connection.address);
			} else {
				this.$emit("disconnected", this);
				rsSystem.log.error("Reconnect Giving up\n", this);
				this.loggedOut = true;
			}
		}, 1000);
	}

	/**
	 *
	 * @method disconnect
	 */
	disconnect() {
		if(!this.connection.socket) {
			this.connection.entry("Unable to disconnect, Universe not connected", 40);
		} else {
			this.connection.entry("Disconnecting");
			this.connection.socket.close();
			this.connection.reconnecting = false;
			this.connection.closing = true;
			this.connection.socket = null;
			this.connection.address = null;
		}
	}

	/**
	 *
	 * @method logout
	 */
	logout() {
		this.loggedOut = true;
		this.disconnect();
	}

	/**
	 *
	 * @param {Object} state
	 * @return {Promise}
	 */
	loadState(state) {
		return new Promise((done, fail) => {
			var keys = Object.keys(state),
				Constructor,
				noun,
				type,
				ids,
				id,
				i,
				t;

			keys.unshift("modifierattrs");
			keys.unshift("modifierstats");
			keys.unshift("condition");
//			console.warn("Load State: ", keys, state);

			for(t=0; t<keys.length; t++) {
				type = keys[t];
				Constructor = rsSystem.availableNouns[type];
				if(!Constructor) {
					rsSystem.log.warn("Noun does not have a registered constructor: " + type);
					Constructor = RSObject;
				}
				if(state[type]) {
					ids = Object.keys(state[type]);
					if(!this.nouns[type]) {
						this.indexes[type] = new SearchIndex();
						this.nouns[type] = {};
					}
					for(i=0; i<ids.length; i++) {
						id = ids[i];
						if(this.nouns[type][id]) {
							this.nouns[type][id].receiveState(state[type][id]);
						} else {
							this.nouns[type][id] = new Constructor(state[type][id], this);
							this.nouns[type][id].classed = type;
							this.indexes[type].indexItem(this.nouns[type][id]);
							this.index.indexItem(this.nouns[type][id]);
						}
						noun = this.nouns[type][id];
					}
				}
			}

			for(i=0; i<this.index.listing.length; i++) {
				if(this.index.listing[i].recalculateProperties) {
					this.index.listing[i].recalculateProperties();
				}
			}

			for(i=0; i<this.index.listing.length; i++) {
				if(this.index.listing[i].recalculateProperties) {
					this.index.listing[i].recalculateProperties();
				}
			}

			for(i=0; i<rsSystem.listingNouns.length; i++) {
				if(!this.nouns[rsSystem.listingNouns[i]]) {
					this.indexes[rsSystem.listingNouns[i]] = new SearchIndex();
					this.nouns[rsSystem.listingNouns[i]] = {};
				}
			}

			if(!this.initialized) {
				this.initialized = true;
				this.$emit("initialized", this);
			}

			this.$emit("universe:modified", this);
		});
	}

	loadData(event) {
//		console.log("Receive Data[" + event.id + "]: ", event);
		var noun = this.nouns[event.classed][event.id];
		if(noun) {
			noun.loadData(event);
		} else {
			rsSystem.log.warn("Unable to locate noun for data: ", event);
		}
	}

	/**
	 *
	 * @method send
	 * @param {String} type
	 * @param {Object} data
	 */
	send(type, data, callback) {
		data = data || {};
		var sending;

		if(this.connection.socket) {
			this.connection.retries = 0;
			sending = {
				"sent": Date.now(),
				"echo": data.echo || Random.identifier("echo"),
				"event": type,
				"data": data
			};
			delete(data.echo);
			if(this.debugConnection) {
				console.log("Connection - Sending: ", sending);
			}
			if(callback) {
				this.echoed[sending.echo] = callback;
				this.timeouts[sending.echo] = setTimeout(() => {
					if(this.echoed[sending.echo]) {
						delete(this.echoed[sending.echo]);
						fail(new Error("Send Timedout"));
					}
				}, this.echoTimeout);
			} else {
				this.echoed[sending.echo] = sending;
			}
			this.connection.socket.send(JSON.stringify(sending));
			return sending.echo;
		} else {
			// TODO: Buffer for connection restored
		}
	}

	promisedSend(type, data) {
		data = data || {};

		return new Promise((done, fail) => {
			if(!type) {
				fail(new Error("No Event Type Provided"));
			} else if(this.connection.socket) {
				var sending = {
					"sent": Date.now(),
					"echo": data.echo || Random.identifier("echo"),
					"event": type,
					"data": data
				};
				delete(data.echo);
				if(this.debugConnection) {
					console.log("Connection - Sending: ", sending);
				}
				this.echoed[sending.echo] = (result) => {
					done(result);
				};
				this.connection.socket.send(JSON.stringify(sending));
				this.timeouts[sending.echo] = setTimeout(() => {
					if(this.echoed[sending.echo]) {
						delete(this.echoed[sending.echo]);
						fail(new Error("Send Timedout"));
					}
				}, this.echoTimeout);
			} else {
				// IDEA: Buffer for connection restored
				fail(new Error("Connection not available"));
			}
		});
	}


	importData(value, overwrite) {
		if(!this.importing.active) {
			Vue.set(this.importing, "active", true);
			Vue.set(this.importing, "abort", false);
			var progress,
				chain,
				value,
				keys,
				eid,
				i;

			this.importing.count = 0;
			keys = Object.keys(value);

			for(i=0; i<keys.length; i++) {
				this.importing.count += (value[keys[i]]?value[keys[i]].length:0) || 0;
			}

			this.importing.imported.splice(0);
			this.importing.skipped.splice(0);
			this.importing.failed.splice(0);

			eid = Random.identifier("tracker");
			this.$once(eid, (tracker) => {
				progress = tracker;
				Vue.set(progress, "processed", this.importing.imported.length);
			});
			this.$emit("track-progress", {
				"message": "Importing Records",
				"processing": this.importing.count,
				"id": eid
			});

			keys.forEach((key) => {
				value[key].forEach((record) => {
					// Level class type properties
					record._class = record._class || key;
					record.classed = record.classed || key;
					if(chain) {
						chain = chain.then(() => {
							return new Promise((done, fail) => {
								setTimeout(() => {
									if(progress && !progress.active) {
										this.importing.abort = true;
										progress = null;
									}

									if(this.importing.abort) {
										fail("Aborting");
									} else {
										if(overwrite || !this.indexes[record._class].index[record.id]) {
											record._class = key;
											record.classed = key;

											if(this.debugConnection) {
												console.log("Importing[" + record.id + "]");
											}

											this.promisedSend("modify:" + record._class, record)
											.then(done)
											.catch(fail);
										} else {
											this.importing.skipped.push(record);
											if(this.debugConnection) {
												console.log("Skipping[" + record.id + "]");
											}
											if(progress) {
												Vue.set(progress, "skipped", this.importing.skipped.length);
											}
											done();
										}
									}
								}, 0);
							});
						});
					} else {
						if(this.importOverwrites || !this.indexes[record._class].index[record.id]) {
							chain = this.promisedSend("modify:" + record._class, record);
						} else {
							this.importing.skipped.push(record);
							if(progress) {
								Vue.set(progress, "skipped", this.importing.skipped.length);
							}
							if(progress) {
								Vue.set(progress, "skipped", this.importing.skipped.length);
							}
							chain = new Promise((done) => {done();});
						}
					}
					chain = chain.then((msg) => {
						this.importing.imported.push(record);
						if(this.debugConnection) {
							console.log(" > Finished |", record);
						}
						if(progress) {
							Vue.set(progress, "processed", this.importing.imported.length + this.importing.failed.length);
						}
					}).catch((err) => {
						if(!this.importing.abort) {
							// Err will typically be a timeout
							console.error(" > Failed |", record, err);
							this.importing.failed.push(record);
							if(progress) {
								Vue.set(progress, "processed", this.importing.imported.length + this.importing.failed.length);
								Vue.set(progress, "failed", this.importing.failed.length);
							}
						}
					});
				});
			});
			if(chain) {
				chain.then(() => {
					Vue.set(this.importing, "active", false);
					if(progress && progress.active) {
						Vue.set(progress, "icon", "fas fa-check rs-light-green");
						if(overwrite) {
							Vue.set(progress, "message", "Imported: " + this.importing.imported.length);
						} else {
							Vue.set(progress, "message", "Imported: " + this.importing.imported.length + " (Skipped: " + this.importing.skipped.length + ")");
						}
						this.$emit(progress.id);
					}
					if(this.debugConnection) {
						console.warn("Import Completed");
					}
				}).catch((error) => {
					Vue.set(this.importing, "active", false);
					this.$emit(progress.id);
					if(this.importing.abort) {
						Vue.set(this.importing, "abort", false);
						if(progress && progress.active) {
							Vue.set(progress, "icon", "fas fa-check rs-light-red");
							Vue.set(progress, "message", "Import Aborted");
							Vue.set(progress, "aborted", true);
						}
						if(this.debugConnection) {
							console.error("Import Aborted");
						}
					} else {
						console.error("Import Error: ", error);
						if(progress && progress.active) {
							Vue.set(progress, "icon", "fas fa-exclamation-triangle rs-light-red");
							Vue.set(progress, "message", error.message);
						}
						if(this.debugConnection) {
							console.error("Import Failed");
						}
					}
				});
			} else {
				Vue.set(this, "importing", false);
			}
		}
	}
}
