
/**
 *
 *
 * @class RSHome
 * @constructor
 * @module Pages
 */
rsSystem.component("RSHome", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"storageKey": {
			"default": "rsHomeStorageKey"
		},
		"activeUniverse": {
			"type": Object
		}
	},
	"data": function() {
		var data = {};
		
		data.messageTimestamp = "";
		data.messageHeading = "";
		data.messageClass = "";
		data.messageIcon = "";
		data.message = "";
		data.state = 0;

		// Track Connection Information
		data.configuration = null;
		data.player = null;
		data.user = null;
		
		data.title = document.title;
		data.pages = ["Privacy", "License", "Terms"];
		data.version = rsSystem.version;
		data.screenLock = null;
		data.mainpage = "RSDashboard";
		data.menuSpacing = null;
		
		data.active = null;
		data.configuration = null;
		data.universe = new RSUniverse();
		data.chatCore = new RSChatCore(data.universe);
		data.universe.$on("disconnected", () => {
			Vue.set(this, "messageClass", "");
			Vue.set(this, "messageIcon", "fas fa-info-circle rs-light-blue");
			Vue.set(this, "messageHeading", "Disconnected");
			Vue.set(this, "message", "Disconnected from the server");
			if(this.state >= 0) {
				Vue.set(this, "state", 0);
			}
		});
		data.universe.$on("badlogin", () => {
			this.universe.loggedOut = true;
			Vue.set(this, "messageClass", "");
			Vue.set(this, "messageIcon", "fas fa-exclamation-triangle rs-light-red");
			Vue.set(this, "messageHeading", "Login Failed");
			Vue.set(this, "message", "Bad Username or Passcode");
			if(this.state >= 0) {
				Vue.set(this, "state", 0);
			}
		});
		data.universe.$on("initializing", () => {
			if(this.state >= 0) {
				Vue.set(this, "state", 2);
			}
		});
		data.universe.$on("loaded", () => {
			// console.log("Loaded: ", this.universe);
			Vue.set(this, "player", this.universe.index.player[this.universe.connection.session.player]);
			this.chatCore.setPlayer(this.player);
			if(this.state >= 0) {
				Vue.set(this, "state", 10);
			}
		});

		return data;
	},
	"watch": {
		"$route.query": {
			"deep": true,
			"handler": function() {
				this.setActive();
			}
		},
		"storage.profile.screen_wake": function() {
			if(this.storage.profile.screen_wake) {
				this.acquireScreenLock();
			} else if(this.screenLock) {
				this.screenLock.release();
			}
		}
	},
	"mounted": function() {
		rsSystem.register(this);
		var path = location.pathname,
			index = path.lastIndexOf("/");

		if(index !== -1) {
			path = path.substring(0, index);
		}
		
		/**
		 * When emitted, a logout is triggered for the universe.
		 * @event logout
		 * @for EventBus
		 */
		rsSystem.EventBus.$on("logout", () => {
			console.log("Lougout: ", _p(this.storage));
			if(this.storage.session) {
				Vue.set(this.storage, "session", null);
				Vue.set(this, "player", null);
				Vue.set(this, "state", 0);
				this.universe.logout();
			}
		});
		
		if(rsSystem.configuration) {
			Vue.set(this, "configuration", rsSystem.configuration);
			if(this.configuration.mainpage && rsSystem.components[this.configuration.mainpage]) {
				Vue.set(this, "mainpage", this.configuration.mainpage);
			}
			rsSystem.configureRouting(this.configuration);
			this.$emit("configure", this.configuration);
		} else {
			fetch(location.protocol + "//" + location.host + path + "/configuration.json")
			.then((res) => {
				if(res.status === 404) {
					throw new Error("Site Unavailable");
				} else if(res.status === 500) {
					throw new Error("Site Unavailable due to Server Error");
				}
				return res.json();
			}).then((configuration) => {
				if(configuration.address && (!this.storage.address || configuration.force)) {
					Vue.set(this.storage, "address", configuration.address);
				}
				if(configuration.debug !== undefined) {
					rsSystem.debug = configuration.debug;
				}
				Vue.set(this, "configuration", configuration);
				if(this.configuration.mainpage && rsSystem.components[this.configuration.mainpage]) {
					Vue.set(this, "mainpage", this.configuration.mainpage);
				}
				return rsSystem.configureRouting(this.configuration);
			}).then((configuration) => {
				this.$emit("configure", configuration);
			}).catch((err) => {
				console.warn(err);
				Vue.set(this, "state", -1);
				Vue.set(this, "configuration", {});
				this.receiveMessage({
					"class": "rsbd-red",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"heading": "Configuration Failed",
					"text": err.message || "Failed to retrieve site configuration."
				});
			});
		}
		
		if(this.storage.session) {
			this.connect(this.storage.session);
		}
		
		if(!this.storage.profile) {
			Vue.set(this.storage, "profile", {});
		}
		if(!this.storage.profile.screen_wake === undefined) {
			Vue.set(this.storage.profile, "screen_wake", true);
		}
		if(!this.storage.profile.default_dashboard === undefined) {
			Vue.set(this.storage.profile, "default_dashboard", "dashboard:character:default");
		}
		
		this.universe.setProfile(this.storage.profile);
		this.setActive();
	},
	"methods": {
		"styleSplash": function() {
			if(this.universe && this.universe.connection && this.universe.connection.socket) {
				return "";
			}

			if(this.universe && this.universe.connection && this.universe.connection.metrics && this.universe.connection.metrics.connected_server) {
				return "";
			}

			if(this.configuration && this.configuration.background) {
				return "background-image: url(\"" + this.configuration.background + "\");";
			}
			
			return "";
		},
		"setActive": function() {
			if(this.$route.query.p) {
				Vue.set(this, "active", this.$route.query.p);
			} else if(this.active) {
				Vue.set(this, "active", null);
			}
		},
		"view": function(page) {
			if(this.active === page) {
				this.$router.push(this.$route.path);
			} else {
				this.$router.push(this.$route.path + "?p=" + page);
			}
		},
		"acquireScreenLock": function() {
			if(navigator.wakeLock) {
				navigator.wakeLock.request()
				.then((lock) => {
					Vue.set(this, "screenLock", lock);
					lock.onrelease = (event) => {
						Vue.set(this, "screenLock", null);
						if(this.storage.profile.screen_wake) {
							this.acquireScreenLock();
						}
					};
				})
				.catch((err) => {
					console.error("Screen Wake Lock Failed: ", err);
				});
			}
		},
		"screenSleepLock": function(state) {
			Vue.set(this, "screenLock", state);
		},
		"receiveMessage": function(message) {
			if(message) {
				var date = new Date();
				Vue.set(this, "messageClass", message.classes || "");
				Vue.set(this, "messageIcon", message.icon);
				Vue.set(this, "messageHeading", message.heading);
				Vue.set(this, "messageTimestamp", date.toLocaleDateString("en-us") + " " + date.toLocaleTimeString("en-us"));
				Vue.set(this, "message", message.text || message);
			} else {
				Vue.set(this, "message", null);
			}
		},
		"dismissMessage": function() {
			Vue.set(this, "message", null);
		},
		"receiveConfiguration": function(configuration) {
			Vue.set(this, "configuration", configuration);
		},
		"connect": function(session) {
			// console.log("Connect: ", session);
			Vue.set(this, "state", 1);
			this.universe.state.initializing = true;
			this.universe.connect(session, session.address)
			.then((universe) => {
				// console.log("Set Session: ", session);
				Vue.set(this.storage, "session", session);
			})
			.catch((error) => {
				console.error("Failed to connect: ", error);
				Vue.set(this.storage, "session", null);
				Vue.set(this, "state", 0);
				this.$emit("message", {
					"class": "rsbd-orange",
					"icon": "fas fa-exclamation-triangle",
					"heading": "Connection Failure",
					"text": "Failed to connect to " + this.storage.address + "."
				});
			});
		}
	},
	"template": Vue.templified("pages/home.html")
});
