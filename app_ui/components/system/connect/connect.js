
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
		},
		"data": function() {
			var data = {};
			
			data.universe = new RSUniverse();
			data.session = {};
			data.external = false;
			data.password = "";
			
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
			console.log("Connect: ", this.storage);
			
			fetch(location.protocol + "//" + location.host + "/address.json")
			.then((res) => {
				return res.json();
			}).then((res) => {
				console.log(" > Address.json: ", res);
				if(res.address && (!this.storage.address || res.force)) {
					Vue.set(this.storage, "address", res.address);
				}
			}).catch((err) => {
				console.warn(err);
			});
			
			
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
		},
		"methods": {
			"toggleSecure": function() {
				Vue.set(this.storage, "secure", !this.storage.secure);
			},
			"clearPassword": function() {
				Vue.delete(this.storage, "password");
				Vue.set(this, "password", "");
			},
			"getHTTPAddress": function() {
				return (this.storage.secure?"https://":"http://") + this.storage.address;
			},
			"getSocketAddress": function() {
				return (this.storage.secure?"wss://":"ws://") + this.storage.address;
			},
			"login": function() {
				return new Promise((done, fail) => {
					if(this.storage.session) {
						console.log(" > Have Session");
						done(this.storage.session);
					} else {
						console.log(" > New Session");
						var request = new Request(this.getHTTPAddress() + "/login/local/authenticate");
						request.headers.set("rs-username", this.storage.username);
						request.headers.set("rs-password", this.storage.password);
						fetch(request)
						.then((res) => {
						    return res.json();
						}).then((res) => {
						    Vue.set(this.storage, "session", res);
							done(this.storage.session);
						}).catch(fail);
					}
				});
			},
			"connect": function() {
				if(this.password) {
					Vue.set(this.storage, "password", this.password.sha256());
				}
			
				this.login()
				.then((session) => {
					// TODO: If Session Redirect is Present, follow - This is to enable SSOs
					return this.universe.connect(session, this.getSocketAddress());
				})
				.then((universe) => {
					console.log("Connected: ", universe);
					this.$emit("connect", universe);
				})
				.catch((error) => {
					console.log("Failed to connect: ", error);
					this.$emit("message", {
						"class": "rsbd-orange",
						"icon": "fas fa-exclamation-triangle",
						"heading": "Connection Failure",
						"text": "Failed to connect to " + this.storage.address + "."
					});
				});
			}
		},
		"template": Vue.templified("components/system/connect.html")
	});
})();
