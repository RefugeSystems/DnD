
rsSystem.component("systemOptionsDialog", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		},
		"details": {
			"required": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {},
			option,
			keys,
			x;
			
		data.options = [];
		data.report_mirror = {};
		data.account_mirror = {};
		data.account_mirror.username = this.player.username;
		data.account_mirror.email = this.player.email;
		data.account_mirror.description = this.player.description;
		data.version_server = this.universe.version;
		data.version_ui = rsSystem.version;
		data.navigator = rsSystem.getBrowserName();
		data.active = null;

		data.pages = {
			"profile": {
				"name": "Profile",
				"options": [{
					"id": "screen_wake",
					"label": "Lock Screen Awake",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "inline_javascript",
					"label": "Allow Inline Javascript",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "disable_sounds",
					"label": "Disable Sounds",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "no_master",
					"label": "Block Master Controls",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "silence_messaging",
					"label": "No Message Alerts",
					"base": this.profile,
					"type": "toggle"
				}]
			},
			"account": {
				"name": "Account",
				"options": [{
					"id": "username",
					"label": "Username",
					"submit": "account-submit",
					"base": data.account_mirror,
					"type": "text"
				}, {
					"id": "description",
					"label": "Description",
					"submit": "account-submit",
					"base": data.account_mirror,
					"type": "textarea"
				}, {
					"id": "password",
					"label": "Password",
					"submit": "account-submit",
					"base": data.account_mirror,
					"type": "password"
				}, {
					"id": "confirm",
					"label": "Password (Confirm)",
					"submit": "account-submit",
					"base": data.account_mirror,
					"type": "password",
					"match": "password"
				}, {
					"id": "email",
					"label": "Email",
					"submit": "account-submit",
					"base": data.account_mirror,
					"type": "text"
				}]
			},
			"system": {
				"name": "System",
				// TODO: Investigate adding more information to the System Display
				"options": [{
					"id": "version_browser",
					"label": "Browser",
					"value": data.navigator.name + " v" + data.navigator.version,
					"type": "data"
				}, {
					"id": "version_server",
					"label": "Server",
					"value": this.universe.version,
					"type": "data"
				}, {
					"id": "version_ui",
					"label": "UI",
					"value": rsSystem.version,
					"type": "data"
				}, {
					"id": "address",
					"label": "Server Address",
					"value": this.universe.connection.socket?this.universe.connection.session.address:"Not Connected",
					"type": "data"
				}, {
					"id": "latency",
					"label": "Server Latency",
					"value": this.universe.metrics.latency + "ms",
					"type": "data"
				}, {
					"id": "app-update",
					"action": "resync",
					"icon": "fas fa-sync",
					"label": "Resync"
				}, {
					"id": "app-cache-delete",
					"action": "uncache",
					"icon": "fas fa-sync",
					"label": "Delete Cache"
				}]
			},
			"report": {
				"name": "Report",
				"options": [{
					"id": "title",
					"label": "Title",
					"base": data.report_mirror,
					"type": "text"
				}, {
					"id": "description",
					"label": "Description",
					"base": data.report_mirror,
					"type": "textarea"
				}, {
					"id": "report-submit",
					"label": "Submit Report",
					"action": "report-submit"
				}]
			},
			"logout": {
				"name": "Logout",
				"options": [{
					"label": "Logout from Server",
					"action": "logout",
					"icon": "fad fa-portal-exit"
				}]
			}
		};
		
		data.pageList = Object.keys(data.pages);
		
		if(this.universe.version !== rsSystem.version) {
			data.pages.system.options.push({
				"id": "app-update",
				"action": "emit",
				"label": "Update"
			});
		}
		if(this.player.gm) {
			data.pages.system.options.push({
				"id": "universe-export",
				"action": "universe-export",
				"icon": "fas fa-download",
				"label": "Export Universe"
			});
		}
		
		if(this.configuration.user_configuration && this.configuration.user_configuration.authentication) {
			keys = Object.keys(this.configuration.user_configuration.authentication);
			for(x=0; x<keys.length; x++) {
				if(this.configuration.user_configuration.authentication[keys[x]]) {
					if(this.player.attribute) {
						Vue.set(data.account_mirror, keys[x], this.player.attribute[keys[x]]);
					}
					data.pages.account.options.push({
						"id": keys[x],
						"label": this.configuration.user_configuration.authentication[keys[x]].label,
						"base": data.account_mirror,
						"submit": "account-submit",
						"type": "text"
					});
				}
			}
		}
		data.pages.account.options.push({
			"id": "account-submit",
			"label": "Submit Changes",
			"action": "account-submit"
		});
		
		if(this.configuration.options) {
			for(x=0; x<this.configuration.options.length; x++) {
				option = Object.assign({}, this.configuration.options[x]);
				option.base = this.profile;
				data.page.profile.options.push(option);
			}
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(!this.storage.page) {
			Vue.set(this.storage, "page", this.pageList[0]);
		}
		this.toPage(this.storage.page);
	},
	"methods": {
		"emitButton": function(button) {
			if(typeof(button.emission) === "string") {
				rsSystem.EventBus.$emit(button.emission);
			} else if(typeof(button.emission) === "object") {
				rsSystem.EventBus.$emit(button.emission.type, button.emission);
			} else {
				console.warn("Button has no emission property: ", button);
			}
		},
		"toggleOption": function(base, key) {
			Vue.set(base, key, !base[key]);
		},
		"actionOption": function(action, base, key) {
			switch(action) {
				case "logout":
					rsSystem.EventBus.$emit("logout");
					break;
				case "account-submit":
					if(!this.account_mirror.password || this.account_mirror.password === this.account_mirror.confirm) {
						if(this.account_mirror.password) {
							Vue.set(this.account_mirror, "confirm", "");
							this.account_mirror.password = this.account_mirror.password.sha256();
						}
						this.universe.send("account:update", this.account_mirror);
						Vue.set(this.account_mirror, "password", "");
					} else {
						rsSystem.EventBus.$emit("message", {
							"id": "account:updated",
							"message": "Account Update: Passwords do not match",
							"icon": "fas fa-exclamation-triangle rs-lightred",
							"event": event
						});
					}
					break;
				case "report-submit":
					this.universe.send("error:report", this.report_mirror);
					break;
				case "uncache":
					this.universe.deleteCache();
					break;
				case "emit":
					rsSystem.EventBus.$emit(key);
					break;
				case "resync":
					this.universe.resync();
					break;
				case "universe-export":
					this.universe.exportData();
					break;
			}
		},
		"getOptionClass": function(option) {
			var classes = option.type;
			if(option.match && option.base[option.match] && option.base[option.id] !== option.base[option.match]) {
				classes += " malformed";
			}
			return classes;
		},
		"clearOption": function(option) {
			switch(option.type) {
				case "toggle":
					Vue.set(option.base, option.id, false);
					break;
				case "textarea":
				case "select":
				case "text":
					Vue.set(option.base, option.id, "");
					break;
				default:
					Vue.set(option.base, option.id, null);
			}
		},
		"submitOption": function(option) {
			if(option.submit) {
				this.actionOption(option.submit, option.base, option.id);
			}
		},
		"toPage": function(page) {
			Vue.set(this, "active", page);
			this.options.splice(0);
			this.options.push.apply(this.options, this.pages[page].options);
		},
		"setOption": function(base, key, value) {
			Vue.set(this[base], key, value);
		}
	},
	"template": Vue.templified("components/system/options.html")
});
