
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
			"universe": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};
			
			data.loggingIn = false;
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
			"login": function() {
				if(!this.loggingIn) {
					Vue.set(this, "loggingIn", true);
					var request = new Request(this.getHTTPAddress() + "/login/local/authenticate");
					request.headers.set("rs-username", this.storage.username);
					if(this.password) {
						Vue.set(this.storage, "password", this.password.sha256());
					}
					request.headers.set("rs-password", this.storage.password);
					
					fetch(request)
					.then((res) => {
						console.log("Response: ", res);
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
