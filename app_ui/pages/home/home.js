
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
	],
	"props": {
		"activeUniverse": {
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		data.messageHeading = "";
		data.messageClass = "";
		data.messageIcon = "";
		data.message = "";
		data.state = 0;

		// Track Connection Information
		data.universe = null;
		data.player = null;
		data.user = null;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"receiveMessage": function(message) {
			if(message) {
				Vue.set(this, "messageClass", message.classes || "");
				Vue.set(this, "messageIcon", message.icon);
				Vue.set(this, "messageHeading", message.heading);
				Vue.set(this, "message", message.text || message);
			} else {
				Vue.set(this, "message", null);
			}
		},
		"connect": function(event) {
			if(this.$route.hash !== "" && this.universe && this.universe.loggedOut) {
				this.universe.loggedOut = false;
			} else {
				Vue.set(this, "universe", new RSUniverse({}));
				Vue.set(this, "user", event.user);
				Vue.set(this, "state", 1);

				this.universe.$on("disconnected", () => {
					Vue.set(this, "messageClass", "");
					Vue.set(this, "messageIcon", "fas fa-info-circle rs-light-blue");
					Vue.set(this, "messageHeading", "Disconnected");
					Vue.set(this, "message", "Disconnected from the server");
					Vue.set(this, "state", 0);
				});
				this.universe.$on("badlogin", () => {
					this.universe.loggedOut = true;
					Vue.set(this, "messageClass", "");
					Vue.set(this, "messageIcon", "fas fa-exclamation-triangle rs-light-red");
					Vue.set(this, "messageHeading", "Login Failed");
					Vue.set(this, "message", "Bad Username or Passcode");
					Vue.set(this, "state", 0);
				});
				this.universe.$on("initializing", () => {
					Vue.set(this, "state", 2);
				});
				this.universe.$on("initialized", () => {
					Vue.set(this, "player", this.universe.indexes.player.lookup[this.user.id]);
					Vue.set(this, "state", 10);
				});
				this.universe.connect(event.user, event.address);
			}
		}
	},
	"template": Vue.templified("pages/home.html")
});
