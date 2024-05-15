
/**
 * Handles retrieving login information from the user.
 * @class rsConnect
 * @constructor
 * @module Components
 */
(function() {
	var storageKey = "_rs_connectComponentKey";

	rsSystem.component("rsConnectV2", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageController
		],
		"props": {
			"configuration": {
				"required": true,
				"type": Object
			},
			"universe": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};
			
			data.alternatives = [];
			data.modules = {};
			
			data.external = false;
			data.loading = true;
			data.loggingIn = false;
			data.session = {};
			data.external = false;
			data.password = "";
			data.otherWorlds = [];
			data.worlds = {};
			data.world = {};
			data.add = {};
			data.add.address = "";
			data.add.is_secure = false;
			
			/*
			data.storage = this.loadStorage({
				"secure": location.protocol === "https:",
				"passcode": "",
				"username": "",
				"address": "",
				"session": null
			});
			*/

			data.failOver = false;
			
			return data;
		},
		"computed": {
			"httpAddress": function() {
				if(this.world) {
					(this.world.is_secure?"https://":"http://") + this.world.address;
				}
				return (this.storage.secure?"https://":"http://") + this.storage.address;
			},
			"socketAddress": function() {
				if(this.world) {
					(this.world.is_secure?"wss://":"ws://") + this.world.address;
				}
				return (this.storage.secure?"wss://":"ws://") + this.storage.address;
			},
			"passwordPlaceholder": function() {
				if(this.storage.passcode) {
					return " < Saved Password > ";
				} else {
					return " Enter a Password...";
				}
			},
			"title": function() {
				if(this.world) {
					if(this.world.title) {
						return this.world.title;
					}
					if(this.world.attribute && this.world.attribute.title) {
						return this.world.attribute.title;
					}
				}
				return this.configuration.title || document.title || "RSApp";
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			
			if(!this.storage.secure) {
				Vue.set(this.storage, "secure", location.protocol === "https:");
			}
			if(!this.storage.address) {
				Vue.set(this.storage, "address", this.storage.last_address || this.configuration.address || location.host);
			}
			if(this.storage.worlds) {
				this.otherWorlds.push.apply(this.otherWorlds, this.storage.worlds);
			} else {
				Vue.set(this.storage, "worlds", []);
			}
			
			if(this.configuration.address && (!this.storage.address || this.configuration.force)) {
				Vue.set(this.storage, "address", this.configuration.address);
			}
			
			if(this.$route.query.address) {
				Vue.set(this.storage, "address", this.$route.query.address);
				this.$emit("message", {
					"class": "rsbd-orange",
					"icon": "fas fa-exclamation-triangle",
					"heading": "Connection Address Set",
					"text": "The connection address has been updated to \"" + this.$route.query.address + "\" based on the received query information from the URL provided."
				});
				this.$router.push("/");
			}
			if(this.$route.query.authfail) {
				if(this.$route.query.authfail === "401") {
					this.$emit("message", {
						"class": "rsbd-orange",
						"icon": "fas fa-exclamation-triangle rs-lightorange",
						"heading": "Login Failed",
						"text": "Failed to login"
					});
				} else if(this.$route.query.authfail === "401.1") {
					this.$emit("message", {
						"class": "rsbd-orange",
						"icon": "fas fa-exclamation-triangle rs-lightorange",
						"heading": "Unknown User",
						"text": "SSO Login Succeeded but User Unknown"
					});
				}
				this.$router.push(this.$route.path);
			}
			if(this.$route.query.session) {
				var session;
				try {
					session = atob(this.$route.query.session);
					this.$router.push(this.$route.path);
					session = JSON.parse(session);
					session.address = this.socketAddress;
					console.log("Received Session: ", session);
					this.$emit("login", session);
				} catch(sessionBuildException) {
					console.error("Failed to receive session: ", session);
				}
			}

			if(this.storage.username) {
				fetch(new Request(this.httpAddress + "/api/v1/meet/next/" + this.storage.username))
				.then((res) => {
					if(res.status === 200) {
						return res.json();
					}
				})
				.then((json) => {
					var date;
					if(json.meeting && json.meeting.date && !isNaN(date = new Date(json.meeting.date))) {
						console.log("Meeting: ", json.meeting);
						this.$emit("message", {
							"class": "rsbd-lightblue",
							"icon": "fas fa-calendar-day rs-lightblue",
							"heading": "Next Meeting",
							"text": "Next meeting is \"" + json.meeting.name + "\" on " + date.toLocaleDateString() + " at " + date.toLocaleTimeString()
						});
					} else {
						console.log("No next meeting found for " + this.storage.username, json);
					}
				})
				.catch((error) => {
					console.warn("Failed to get Meeting: ", error);
				});
			}
			
			this.fetchLoginMethods();
		},
		"methods": {
			"toggleServerDetails": function() {
				Vue.set(this, "external", !this.external);
			},
			"addWorld": function(world) {
				if(world.address) {
					this.storage.worlds.push(world);
					this.otherWorlds.push(world);
				}
				Vue.set(world, "address", "");
				Vue.set(world, "is_secure", false);
			},
			"updateWorld": function(event) {
				var world = this.worlds[this.storage.address];
				if(!world) {
					world = {
						"address": this.storage.address,
						"is_secure": !!this.storage.secure
					};
				}
				this.changeWorld(world);
			},
			"changeWorld": function(world, skip) {
				if(!this.world || this.world.address !== world.address) {
					console.log(" > Change World[" + world.address + "]: ", world);

					Vue.set(this.storage, "address", world.address);
					Vue.set(this.storage, "secure", world.is_secure);

					Vue.set(this, "world", world);
					this.$emit("world", world);
					if(!skip) {
						this.fetchLoginMethods();
					}
				}
			},
			"toggleSecure": function() {
				Vue.set(this.storage, "secure", !this.storage.secure);
			},
			"clearUsername": function() {
				Vue.delete(this.storage, "username");
			},
			"clearPassword": function() {
				Vue.delete(this.storage, "password");
				Vue.set(this, "password", "");
			},
			"clearAddress": function() {
				Vue.delete(this.storage, "address");
			},
			"getHTTPAddress": function() {
				return (this.storage.secure?"https://":"http://") + this.storage.address;
			},
			"getSocketAddress": function() {
				return (this.storage.secure?"wss://":"ws://") + this.storage.address;
			},
			"loginModule": function(module) {
				if(!this.loggingIn) {
					Vue.set(this, "loggingIn", true);
					window.location.href = this.httpAddress + "/login/" + module.id + "/authenticate";
				}
			},
			"fetchLoginMethods": function() {
				fetch(new Request(this.httpAddress + "/login/available"))
				.then((res) => {
					// console.log("Auth Modules Available Retrieved");
					if(res.status === 404) {
						throw new Error("Endpoint Not Found");
					} else if(res.status === 500) {
						throw new Error("Server Error");
					} else if(res.status === 200) {
						return res.json();
					} else {
						throw new Error("Unknown Error");
					}
				}).then((result) => {
					// console.log("Available Modules: ", result);
					for(var x=0; x<result.modules.length; x++) {
						Vue.set(this.modules, result.modules[x].id, result.modules[x]);
						if(result.modules[x].id !== "local") {
							this.alternatives.push(result.modules[x]);
						}
					}

					Vue.set(this, "loading", false);
					
					setTimeout(() => {
						var login = $(this.$el).find("#login-username");
						if(login && login.length) {
							login[0].focus();
						}
					}, 10);

					return fetch(new Request(this.httpAddress + "/api/v1/worlds/list"));
				}).then((res) => {
					if(res.status === 404) {
						throw new Error("Endpoint Not Found");
					} else if(res.status === 500) {
						throw new Error("Server Error");
					} else if(res.status === 200) {
						return res.json();
					} else {
						throw new Error("Unknown Error");
					}
				}).then((list) => {
					console.log("World List: ", list);
					var world = null,
						x;

					if(list) {
						for(x=0; x<list.length; x++) {
							if(!this.worlds[list[x].address]) {
								this.worlds[list[x].address] = list[x];
								this.otherWorlds.push(list[x]);
								if(list[x].address === this.storage.address) {
									world = list[x];
								}
							}
						}
					}

					if(world && (!this.storage.address || this.storage.address !== world.address || !this.world || this.world.address !== world.address)) {
						this.changeWorld(world, true);
					}
					console.log("World Selected[" + world.address + "]: ", world);
				}).catch((error) => {
					// console.error("Error processing Available Authentication Modules: ", error);
					// console.log(" - Reset Address:\n", this.configuration, "\n - Storage: ", this.storage);
					if(this.storage.address && this.configuration && (this.configuration.address || this.configuration.world)) {
						if(this.configuration.world) {
							Vue.set(this.storage, "address", this.configuration.world.address);
							Vue.set(this.storage, "secure", this.configuration.world.secure);
						} else {
							Vue.set(this.storage, "address", this.configuration.address || location.host);
							Vue.set(this.storage, "secure", this.configuration.secure || location.protocol === "https:");
						}

						this.$emit("message", {
							"class": "rsbd-lightred",
							"icon": "fas fa-exclamation-triangle rs-lightorange",
							"heading": "System Failure",
							"text": "Failed to connect to server to check authentication options. World settings have been reset."
						});
					} else {
						this.$emit("message", {
							"class": "rsbd-lightred",
							"icon": "fas fa-exclamation-triangle rs-lightorange",
							"heading": "System Failure",
							"text": "Failed to connect to server to check authentication options"
						});
					}

					console.log(" - World Address: " +  this.world.address + "\n - Storage Address: " + this.storage.address);
					if(this.worlds[this.storage.address] && this.world && this.world.address === this.storage.address) {
						this.changeWorld(this.worlds[this.storage.address], true);
					}
					console.log(" - World Address: " +  this.world.address + "\n - Storage Address: " + this.storage.address);
					
					// if(!this.failOver) {
					// 	if(this.worlds[this.storage.address] && this.world && this.world.address === this.storage.address) {
					// 		this.changeWorld(this.worlds[this.storage.address], true);
					// 	}
					// 	Vue.set(this, "failOver", true);
					// 	this.fetchLoginMethods();
					// }
				});
			},
			"login": function() {
				if(!this.loggingIn) {
					// console.warn("Logging In...");
					Vue.set(this, "loggingIn", true);
					var request = new Request(this.httpAddress + "/login/local/authenticate");
					request.headers.set("rs-username", this.storage.username);
					if(this.password) {
						Vue.set(this.storage, "password", this.password.sha256());
					}
					request.headers.set("rs-password", this.storage.password);
					
					fetch(request)
					.then((res) => {
						// console.log("Response: ", res);
						if(res.status === 401) {
							throw new Error("Password Incorrect");
						} else if(res.status === 404) {
							throw new Error("Endpoint Not Found");
						} else if(res.status === 500) {
							throw new Error("Server Error");
						} else if(res.status === 200) {
					    	return res.json();
						} else {
							throw new Error("Unknown Error");
						}
					}).then((session) => {
					    // Vue.set(this.storage, "session", res);
						Vue.set(this.storage, "last_address", this.storage.address);
						session.address = this.getSocketAddress();
						this.$emit("login", session);
						Vue.set(this, "loggingIn", false);
					}).catch((err) => {
						Vue.set(this, "loggingIn", false);
						console.error("Failed to login: ", err);
						this.$emit("error", err);
						this.$emit("message", {
							"class": "rsbd-red",
							"icon": "fas fa-exclamation-triangle rs-lightred",
							"heading": "Login Failed",
							"text": "<span>Unable to connect to the server to login.</span><br/><span>Remote URL:" + request.url + "</span><br/><pre>" + err.message + "</pre>"
						});
					});
				}
			}
		},
		"template": Vue.templified("components/system/connect/v2.html")
	});
})();
