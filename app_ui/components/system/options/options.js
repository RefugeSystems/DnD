/**
 * Component for controlling device options.
 * @class systemOptionsDialog
 * @constructor
 */
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
		"chatCore": {
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
			dashboards = [],
			default_dash,
			worldAddress,
			worldName,
			section,
			loading,
			option,
			sizes,
			maps,
			keys,
			key,
			i,
			j,
			x;
			
		sizes = [{
			"name": "Minimum",
			"id": 5
		}, {
			"name": "Small",
			"id": 30
		}, {
			"name": "Medium",
			"id": 50
		}, {
			"name": "Large",
			"id": 70
		}, {
			"name": "Full",
			"id": 90
		}];

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
		data.updating = "";
		data.filter = "";
		data.keymapDefaultOption = {
			"id": "default-keybinds",
			"action": "restore-defaults",
			"icon": "fas fa-ban rs-light-orange",
			"label": "Restore Defaults"
		};

		for(i=0; i<this.universe.listing.dashboard.length; i++) {
			if(!this.universe.listing.dashboard[i].is_preview && !this.universe.listing.dashboard[i].disabled) {
				if(this.universe.listing.dashboard[i].default_value) {
					default_dash = this.universe.listing.dashboard[i];
				}
				if(this.player.gm || !this.universe.listing.dashboard[i].concealed) {
					dashboards.push(this.universe.listing.dashboard[i]);
				}
			}
		}
		if(!this.profile.default_dashboard && default_dash) {
			Vue.set(this.profile, "default_dashboard", default_dash.id);
		}

		data.availableKeyEvents = [{
			"label": "Filter",
			"id": null,
			"type": "filter"
		}, {
			"label": "Character Actions",
			"id": null,
			"meta": "character:::action",
			"type": "section"
		}, {
			"name": "Character Info",
			"id": "character:info",
			"type": "keybind"
		}, {
			"name": "Character Attack",
			"id": "character:attack",
			"type": "keybind"
		}, {
			"label": "System Actions",
			"id": null,
			"meta": "system:::action",
			"type": "section"
		}, {
			"name": "Menu",
			"id": "system:menu",
			"type": "keybind"
		}, {
			"name": "Help",
			"id": "system:help",
			"type": "keybind"
		}];
		data.availableKeyMapEvents = {};
		for(i=0; i<data.availableKeyEvents.length; i++) {
			loading = data.availableKeyEvents[i];
			if(loading.id) {
				data.availableKeyMapEvents[loading.id] = loading.name;
				if(typeof(loading.meta) !== "string") {
					loading.meta = "";
				}
				loading.meta += ":::" + loading.name.toLowerCase();
				if(!loading.section && section) {
					loading.section = section;
					loading.meta += ":::" + section.meta;
				}
			} else {
				section = loading;
			}
		}

		data.currentKeyMap = {};
		keys = Object.keys(rsSystem.keyboard.keymap);
		for(i=0; i<keys.length; i++) {
			key = rsSystem.keyboard.keymap[keys[i]];
			if(key) {
				if(key.alt) {
					data.currentKeyMap[key.alt] = "alt + " + keys[i];
				}
				if(key.ctrl) {
					data.currentKeyMap[key.ctrl] = "ctrl + " + keys[i];
				}
				if(key[""]) {
					data.currentKeyMap[key[""]] = keys[i];
				}
			}
		}

		if(this.profile.details_easyaction === undefined) {
			Vue.set(this.profile, "details_easyaction", "bruiser");
		}

		worldAddress = this.universe.connection.socket?this.universe.connection.session.address:"Not Connected";
		if(worldAddress !== "Not Connected") {
			worldAddress = worldAddress.replace("wss://", "").replace("ws://", "");
			for(i=0; i<this.universe.listing.world.length; i++) {
				if(rsSystem.utility.isValid(this.universe.listing.world[i]) && this.universe.listing.world[i].address === worldAddress) {
					worldName = this.universe.listing.world[i].name;
				}
			}
		} else {
			worldName = worldAddress;
		}
		
		data.pages = {
			/**
			 * 
			 * @property profile
			 * @type UIProfile
			 */
			"profile": {
				"name": "Profile",
				"options": [{
					"id": "auto_roll",
					"label": "Automatically Roll Dice",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "auto_submit_minion",
					"label": "Minions Quick Submit Rolls",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "auto_submit",
					"label": "Quick Submit Rolls",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "lock_character",
					"label": "Lock Character Column",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "suppress_auto_action",
					"label": "Do not open the Action Dialog on Turn Start",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "disable_mousescroll",
					"label": "Disable the 'mouse scroll as touch' feature",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "disable_easyaction",
					"label": "Disable the 'Action' button in Character view",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "details_easyaction",
					"label": "Control the data on the Easy Action button",
					"base": this.profile,
					"type": "select",
					"options": [{
						"name": "Caster",
						"id": "caster"
					}, {
						"name": "Bruiser",
						"id": "bruiser"
					}]
				}, {
					"id": "skip_turn_prompt",
					"label": "Skip End of Turn Prompt",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "encounter_ignore_type",
					"label": "Ignore Encounter Type Changes",
					"base": this.profile,
					"type": "toggle"
				}, {
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
					"id": "hints_disabled",
					"label": "Disable Hints",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "navigation_labels",
					"label": "Label Navigation",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "chat_top",
					"label": "Chat Window to Top",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "enable_cache",
					"label": "Enable Cache",
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
					"id": "enforce_requirements",
					"label": "Enforce Action Requirements",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "silence_messaging",
					"label": "No Message Alerts",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "enable_diagnostics",
					"label": "Enable Diagnostics",
					"base": this.profile,
					"type": "toggle"
				}, {
					"id": "info_size",
					"label": "Information Detail Amount in Flyout",
					"base": this.profile,
					"type": "select",
					"options": sizes
				}, {
					"id": "default_dashboard",
					"label": "Default Character Dashboard",
					"base": this.profile,
					"type": "select",
					"options": dashboards
				}]
			},
			"keybinds": {
				"name": "Keybindings",
				"options": data.availableKeyEvents.concat([data.keymapDefaultOption])
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
					"id": "name",
					"label": "Name",
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
					"id": "world",
					"label": "World",
					"value": worldName,
					"type": "data"
				}, {
					"id": "address",
					"label": "Server Address",
					"value": worldAddress,
					"type": "data"
				}, {
					"id": "latency",
					"label": "Server Latency",
					"value": this.universe.metrics.latency + "ms",
					"type": "data"
				}, {
					"id": "app-resync",
					"action": "resync",
					"icon": "fas fa-sync",
					"label": "Resync"
				}, {
					"id": "app-cache-delete",
					"action": "uncache",
					"icon": "fas fa-trash",
					"label": "Delete Cache"
				}, {
					"id": "app-cache-delete",
					"action": "uncache-messages",
					"icon": "fas fa-trash",
					"label": "Delete Messages"
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
					"id": "link",
					"label": "For bugs and features, also see",
					"link": "https://trello.com/b/dO2fHEfu/rsdnd",
					"type": "link"
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

		data.controlDebugging = {
			"id": "universe-debugging",
			"action": "universe-debugging",
			"icon": "fas fa-bug",
			"label": "Enable Debugging"
		};
		
		if(this.universe.version !== rsSystem.version) {
			data.pages.system.options.push({
				"id": "app-update",
				"action": "emit",
				"icon": "fas fa-download rs-light-orange",
				"label": "Update"
			});
		} else {
			data.pages.system.options.push({
				"id": "app-update",
				"action": "emit",
				"icon": "fas fa-download",
				"label": "Refresh App"
			});
		}
		if(!this.universe.connection.socket) {
			data.pages.system.options.push({
				"id": "universe-reconnect",
				"action": "universe-reconnect",
				"icon": "fas fa-plug rs-lightgreen",
				"label": "Reconnect"
			});
		}
		if(this.player.gm) {
			data.pages.profile.options.push({
				"id": "overide_must_know",
				"label": "When viewing info for an obscured or knowledge required object, display anyway",
				"base": this.profile,
				"type": "toggle"
			});
			data.pages.profile.options.push({
				"id": "edit_new_window",
				"label": "Edit to New Window",
				"base": this.profile,
				"type": "toggle"
			});
			data.pages.profile.options.push({
				"id": "collapse_system_alerts",
				"label": "Collapse System Alerts",
				"base": this.profile,
				"type": "toggle"
			});
			data.pages.profile.options.push({
				"id": "suppress_system_alerts",
				"label": "Suppress System Alerts",
				"base": this.profile,
				"type": "toggle"
			});
			data.pages.profile.options.push(data.controlDebugging);
			data.pages.system.options.push({
				"id": "universe-export",
				"action": "universe-export",
				"icon": "fas fa-download",
				"label": "Export Universe"
			});
			sizes.push({
				"name": "Complete",
				"id": 100
			});
			sizes.push({
				"name": "Debug",
				"id": 200
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
		rsSystem.keyboard.$on("system:keymap:defaulted", this.keymapDefaulted);
		rsSystem.keyboard.$on("system:keymap:updated", this.refreshMapping);
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
		"actionOption": function(action, base, key, option) {
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
							"icon": "fas fa-exclamation-triangle rs-lightred"
							// "event": event
						});
					}
					break;
				case "universe-debugging":
					if(this.universe.debug) {
						Vue.set(this.universe, "debug", false);
						Vue.set(this.controlDebugging, "label", "Enable Debugging");
					} else {
						Vue.set(this.universe, "debug", true);
						Vue.set(this.controlDebugging, "label", "Disable Debugging");
					}
					break;
				case "report-submit":
					this.universe.send("error:report", this.report_mirror);
					break;
				case "restore-defaults":
					rsSystem.keyboard.$emit("system:keymap:default");
					break;
				case "uncache":
					this.universe.deleteCache();
					// Handlea reload(true) with the forced reload being deprecated
					rsSystem.utility.forceReload();
					break;
				case "uncache-messages":
					this.chatCore.deleteCache();
					break;
				case "emit":
					rsSystem.EventBus.$emit(key);
					if(key === "app-update") {
						// TODO: Smooth update process
						Vue.set(option, "icon", "fas fa-sync fa-spin");
					}
					break;
				case "resync":
					this.universe.resync();
					break;
				case "universe-export":
					this.universe.exportData(this.configuration.title);
					break;
				case "universe-reconnect":
					rsSystem.EventBus.$emit("universe-reconnect");
					break;
			}
		},
		"isShown": function(option, type) {
			return (!this.filter || (option.meta && option.meta.indexOf(this.filter) !== -1)) && option.type === type;
		},
		"setMapping": function(event, option) {
			Vue.set(option, "remapping", true);
		},
		"updateMapping": function(event, option) {
			if(option) {
				Vue.set(option, "remapping", false);
				rsSystem.keyboard.$emit("system:keymap:set", {
					"key": event.key === "Backspace"?null:event.key,
					"old": this.currentKeyMap[option.id],
					"alt": event.altKey,
					"ctrl": event.ctrlKey,
					"emit": option.id
				});
			}

			event.preventDefault();
			if(typeof(event.stopPropogation) === "function") {
				event.stopPropogation();
			}
		},
		"refreshMapping": function() {
			var keys = Object.keys(this.currentKeyMap),
				key,
				i;
			
			for(i=0; i<keys.length; i++) {
				Vue.delete(this.currentKeyMap, keys[i]);
			}

			keys = Object.keys(rsSystem.keyboard.keymap);
			for(i=0; i<keys.length; i++) {
				key = rsSystem.keyboard.keymap[keys[i]];
				if(key) {
					if(key.alt) {
						Vue.set(this.currentKeyMap, key.alt, "alt + " + keys[i]);
					}
					if(key.ctrl) {
						Vue.set(this.currentKeyMap, key.ctrl, "ctrl + " + keys[i]);
					}
					if(key[""]) {
						Vue.set(this.currentKeyMap, key[""], keys[i]);
					}
				}
			}
		},
		"keymapDefaulted": function() {
			Vue.set(this.keymapDefaultOption, "action", "noop");
			Vue.set(this.keymapDefaultOption, "icon", "fas fa-check rs-light-green");
			setTimeout(() => {
				Vue.set(this.keymapDefaultOption, "icon", "fas fa-ban rs-light-orange");
				Vue.set(this.keymapDefaultOption, "action", "restore-defaults");
			}, 5000);
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
	"beforeDestroy": function() {
		rsSystem.keyboard.$off("system:keymap:defaulted", this.keymapDefaulted);
		rsSystem.keyboard.$off("system:keymap:updated", this.refreshMapping);
	},
	"template": Vue.templified("components/system/options.html")
});


/**
 * Tracked as a normal object, this represents and stores general preferences
 * for the device. Later to be updated to follow the user.
 * @class UIProfile
 * @constructor
 */
/**
 * 
 * @property auto_roll
 * @type Boolean
 */
/**
 * 
 * @property screen_wake
 * @type Boolean
 */
/**
 * 
 * @property inline_javascript
 * @type Boolean
 */
/**
 * 
 * @property disable_sounds
 * @type Boolean
 */
/**
 * 
 * @property enable_cache
 * @type Boolean
 */
/**
 * Enables diagnostic activity such as universe network logging.
 * @property enable_diagnostics
 * @type Boolean
 */
/**
 * 
 * @property no_master
 * @type Boolean
 */
/**
 * 
 * @property silence_messaging
 * @type Boolean
 */
/**
 * 
 * @property full_info
 * @type Boolean
 */
/**
 * 
 * @property info_size
 * @type Integer
 */
/**
 * 
 * @property default_dashboard
 * @type String
 */

/**
 * Game Masters Only, gives an ID to alerts from the server to keep them from sprawling.
 * @property collapse_system_alerts
 * @type Boolean
 */
/**
 * Game Masters Only, ignores system alerts.
 * @property suppress_system_alerts
 * @type Boolean
 */
/**
 * Game Masters Only, the editNoun method in RSCore redirects to a new window named edit
 * to support more involved editing.
 * @property edit_new_window
 * @type Boolean
 */
