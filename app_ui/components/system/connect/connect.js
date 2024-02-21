
/**
 * Handles retrieving login information from the user.
 * @class rsConnect
 * @constructor
 * @module Components
 */
(function() {
	var storageKey = "_rs_connectComponentKey";

	rsSystem.component("rsConnect", {
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
			
			data.title = this.configuration.title || document.title || "RSApp";
			data.loading = true;
			data.loggingIn = false;
			data.session = {};
			data.external = false;
			data.password = "";
			data.otherWorlds = null;
			data.worlds = {};
			
			/*
			data.storage = this.loadStorage({
				"secure": location.protocol === "https:",
				"passcode": "",
				"username": "",
				"address": "",
				"session": null
			});
			*/
			
			return data;
		},
		"watch": {
			"storage.address": function(value) {
				console.log("World Set: " , value);
				if(this.worlds[value]) {
					if(this.worlds[value].is_secure) {
						Vue.set(this.storage, "secure", true);
					} else if(value.startsWith("https") || value.startsWith("wss")) {
						Vue.set(this.storage, "secure", true);
					} else {
						Vue.set(this.storage, "secure", false);
					}
				}
			}
		},
		"computed": {
			"passwordPlaceholder": function() {
				if(this.storage.passcode) {
					return " < Saved Password > ";
				} else {
					return " Enter a Password...";
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			
			if(!this.storage.secure) {
				Vue.set(this.storage, "secure", location.protocol === "https:");
			}
			if(!this.storage.address) {
				Vue.set(this.storage, "address", location.host);
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
					session.address = this.getSocketAddress();
					console.log("Received Session: ", session);
					this.$emit("login", session);
				} catch(sessionBuildException) {
					console.error("Failed to receive session: ", session);
				}
			}

			if(this.storage.username) {
				fetch(new Request(this.getHTTPAddress() + "/api/v1/meet/next/" + this.storage.username))
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
			
			fetch(new Request(this.getHTTPAddress() + "/login/available"))
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

				return fetch(new Request(this.getHTTPAddress() + "/api/v1/worlds/list"));
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
				if(list) {
					Vue.set(this, "otherWorlds", list);
					for(var x=0; x<list.length; x++) {
						this.worlds[list[x].address] = list[x];
					}
				}
			}).catch((error) => {
				console.error("Error processing Available Authentication Modules: ", error);
				this.$emit("message", {
					"class": "rsbd-lightred",
					"icon": "fas fa-exclamation-triangle rs-lightorange",
					"heading": "System Failure",
					"text": "Failed to connect to server to check authentication options"
				});
				Vue.set(this, "loading", false);
			});
		},
		"methods": {
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
					window.location.href = this.getHTTPAddress() + "/login/" + module.id + "/authenticate";
				}
			},
			"login": function() {
				if(!this.loggingIn) {
					// console.warn("Logging In...");
					Vue.set(this, "loggingIn", true);
					var request = new Request(this.getHTTPAddress() + "/login/local/authenticate");
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
							"text": err.message || "Unable to connect to the server to login at " + request.url
						});
					});
				}
			}
		},
		"template": Vue.templified("components/system/connect.html")
	});
})();
