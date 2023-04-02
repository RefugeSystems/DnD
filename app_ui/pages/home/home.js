
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
	"computed": {
		"main": function() {
			if(this.player.gm && this.$route.query.entity) {
				return this.universe.index.entity[this.$route.query.entity];
			} else if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				return this.universe.index.entity[this.player.attribute.playing_as];
			}
			return null;
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
		
		data.routeViewClass = null;
		data.mainViewClass = null;
		data.title = document.title;
		data.pages = ["Privacy", "License", "Terms"];
		data.version = rsSystem.version;
		data.screenLock = null;
		data.mainpage = "RSDashboard";
		data.menuSpacing = null;
		data.meetingNotice = false;
		data.hidden = {};
		
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
				setTimeout(() => {
					var now = Date.now(),
						nextMeet,
						meeting,
						date,
						i;
					if(!this.meetingNotice) {
						this.meetingNotice = true;
						for(i=0; i<this.universe.listing.meeting.length; i++) {
							meeting = this.universe.listing.meeting[i];
							if(now < meeting.date && !meeting.is_preview && !meeting.disabled && !meeting.is_disabled && meeting.players.indexOf(this.player.id) !== -1 && (!nextMeet || meeting.date < nextMeet.date)) {
								nextMeet = meeting;
							}
						}
						// If logging in within an hours of the next meeting, don't pop-up
						if(nextMeet && now + this.universe.calendar.CONSTANTS.hour < nextMeet.date) {
							date = new Date(nextMeet.date);
							rsSystem.EventBus.$emit("message", {
								"icon": "fas fa-calendar-day rs-lightblue",
								"message": "Next meeting is \"" + nextMeet.name + "\" on " + date.toLocaleDateString() + " at " + date.toLocaleTimeString(),
								"timeout": 10000
							});
						}
					}
				}, 0);
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
				console.warn("Lock Screen Wake");
				this.acquireScreenLock();
			} else if(this.screenLock) {
				console.warn("Release Lock Screen");
				this.screenLock.release();
			}
		},
		"storage.profile.navigation_labels": function() {
			Vue.set(this, "mainViewClass", this.getNavClasses());
		},
		"storage.profile.navigation_collapsed": function() {
			Vue.set(this, "mainViewClass", this.getNavClasses());
		},
		"storage.profile.lock_character": function() {
			Vue.set(this, "mainViewClass", this.getNavClasses());
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
		
		Vue.set(this, "mainViewClass", this.getNavClasses());
		this.universe.setProfile(this.storage.profile);
		this.setActive();
		
		document.addEventListener("visibilitychange", this.acquireScreenLock, false);
		if(this.storage.profile.screen_wake) {
			this.acquireScreenLock();
		}

		rsSystem.EventBus.$on("home.hide", this.respondHideEvent);
		rsSystem.EventBus.$on("home.show", this.respondShowEvent);
	},
	"methods": {
		"respondShowEvent": function(event) {
			switch(event.element) {
				case "message":
				case "info":
				case "chat":
				case "menu":
					Vue.set(this.hidden, event.element, false);
					Vue.set(this, "routeViewClass", this.getNavClasses());
					Vue.set(this, "mainViewClass", this.getNavClasses());
					break;
			}
		},
		"respondHideEvent": function(event) {
			switch(event.element) {
				case "message":
				case "info":
				case "chat":
				case "menu":
					Vue.set(this.hidden, event.element, true);
					Vue.set(this, "routeViewClass", this.getNavClasses());
					Vue.set(this, "mainViewClass", this.getNavClasses());
					break;
			}
		},
		"getNavClasses": function() {
			if(this.storage.profile.lock_character) {
				if(this.storage.profile.navigation_collapsed || this.hidden.menu) {
					return "collapsed-shiv";
				} else if(this.storage.profile.navigation_labels) {
					return "labelled-shiv";
				} else {
					return "extended-shiv";
				}
			} else {
				if(this.storage.profile.navigation_collapsed || this.hidden.menu) {
					return "collapsed";
				} else if(this.storage.profile.navigation_labels) {
					return "labelled";
				} else {
					return "extended";
				}
			}
		},
		"getLockClasses": function() {
			if(this.storage.profile.navigation_collapsed || this.hidden.menu) {
				return "collapsed";
			} else if(this.storage.profile.navigation_labels) {
				return "labelled";
			} else {
				return "extended";
			}
		},
		"getViewClasses": function() {
			if(this.storage.profile.lock_character) {
				return "";
			} else {
				if(this.storage.profile.navigation_collapsed || this.hidden.menu) {
					return "collapsed";
				} else {
					return "extended";
				}
			}
		},
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
		/**
		 * Handles the initial request for the screenlock from the profile update.
		 * @method acquireScreenLock
		 */
		"acquireScreenLock": function() {
			if(this.storage.profile.screen_wake && navigator.wakeLock) {
				navigator.wakeLock.request()
				.then((lock) => {
					Vue.set(this, "screenLock", lock);
					lock.onrelease = (event) => {
						// console.warn("Screen Lock Released");
						Vue.set(this, "screenLock", null);
						if(this.storage.profile.screen_wake) {
							// console.warn("Screen Wake Reaquiring");
							this.reacquireScreenLock();
						}
					};
				})
				.catch((err) => {
					// This error state is common for when someone navigates away from the page and the API drops the lock for us
					// console.error("Screen Wake Lock Failed, retrying: ", err);
					this.reacquireScreenLock();
				});
			}
		},
		/**
		 * Handles maintaining the screenlock. This has some minor logical differences,
		 * but notably assumes the wakeLock API exists as handled by the initial acquire
		 * method.
		 * @method reacquireScreenLock
		 */
		"reacquireScreenLock": function() {
			if(this.storage.profile.screen_wake && !this.screenLock) {
				navigator.wakeLock.request()
				.then((lock) => {
					console.warn("Screen Lock Reaquired");
					Vue.set(this, "screenLock", lock);
					lock.onrelease = (event) => {
						// console.warn("Screen Lock Release Event");
						Vue.set(this, "screenLock", null);
						if(this.storage.profile.screen_wake) {
							// console.warn("Screen Wake Reaquiring");
							this.reacquireScreenLock();
						}
					};
				})
				.catch((err) => {
					// console.error("Screen Wake Lock Retrying...", err);
					setTimeout(this.reacquireScreenLock, 5000);
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
	"beforeDestroy": function() {
		document.removeEventListener("visibilitychange", this.acquireScreenLock, false);
		rsSystem.EventBus.$off("home.hide", this.respondHideEvent);
		rsSystem.EventBus.$off("home.show", this.respondShowEvent);
	},
	"template": Vue.templified("pages/home.html")
});
