
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
		data.universe = null;
		data.player = null;
		data.user = null;
		
		
		data.pages = ["Privacy", "License", "Terms"];
		
		data.active = null;
		data.configuration = null;
		data.universe = new RSUniverse();
		data.universe.$on("disconnected", () => {
			Vue.set(this, "messageClass", "");
			Vue.set(this, "messageIcon", "fas fa-info-circle rs-light-blue");
			Vue.set(this, "messageHeading", "Disconnected");
			Vue.set(this, "message", "Disconnected from the server");
			Vue.set(this, "state", 0);
		});
		data.universe.$on("badlogin", () => {
			this.universe.loggedOut = true;
			Vue.set(this, "messageClass", "");
			Vue.set(this, "messageIcon", "fas fa-exclamation-triangle rs-light-red");
			Vue.set(this, "messageHeading", "Login Failed");
			Vue.set(this, "message", "Bad Username or Passcode");
			Vue.set(this, "state", 0);
		});
		data.universe.$on("initializing", () => {
			Vue.set(this, "state", 2);
		});
		data.universe.$on("loaded", () => {
			console.log("Loaded: ", this.universe);
			Vue.set(this, "player", this.universe.index.player[this.universe.connection.session.player]);
			Vue.set(this, "state", 10);
		});

		return data;
	},
	"watch": {
		"$route.query": {
			"deep": true,
			"handler": function() {
				this.setActive();
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
		
		rsSystem.EventBus.$on("logout", () => {
			if(this.storage.session) {
				Vue.set(this.storage, "session", null);
				Vue.set(this, "player", null);
				Vue.set(this, "state", 0);
				this.universe.logout();
			}
		});
		
		var path = location.pathname,
			index = path.lastIndexOf("/");
		if(index !== -1) {
			path = path.substring(0, index);
		}
		
		fetch(location.protocol + "//" + location.host + path + "/configuration.json")
		.then((res) => {
			return res.json();
		}).then((configuration) => {
			if(configuration.address && (!this.storage.address || configuration.force)) {
				Vue.set(this.storage, "address", configuration.address);
			}
			if(configuration.debug !== undefined) {
				rsSystem.debug = configuration.debug;
			}
			Vue.set(this, "configuration", configuration);
			return rsSystem.configureRouting(configuration);
		}).then((configuration) => {
			this.$emit("configure", configuration);
		}).catch((err) => {
			console.warn(err);
		});
		
		if(this.storage.session) {
			this.connect(this.storage.session);
		}
		
		this.setActive();
	},
	"methods": {
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
			Vue.set(this, "state", 1);
			this.universe.connect(session, session.address)
			.then((universe) => {
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
