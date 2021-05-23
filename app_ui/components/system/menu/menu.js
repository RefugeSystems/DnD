
/**
 *
 *
 * @class systemMenu
 * @constructor
 * @module Components
 * @zindex 10
 */
(function() {
	var storageKey = "_rs_menuComponentKey",
		bufferItem = {
			"icon": "",
			"class": "buffer",
			"label": ""
		};

	rsSystem.component("systemMenu", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageManager
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
			}
		},
		"data": function() {
			var data = {};

			data.storageID = storageKey;
			data.state = this.loadStorage(data.storageID, {
				"labels": true
			});
			if(data.state.labels === undefined) {
				data.state.labels = true;
			}

			data.myentity = null;
			data.navigationItems = [];
			data.navigationItems.push({
				"icon": "fas fa-chart-network",
				"action": "navigate",
				"label": "Network",
				"path": "/network",
				"highlight": "/network"
			});
			data.navigationItems.push({
				"icon": "fas fa-street-view",
				"action": "navigate",
				"label": "Locality",
				"path": "/locality",
				"highlight": "/locality"
			});
			data.navigationItems.push({
				"icon": "fas fa-credit-card-front rot0 inverted",
				"action": "navigate",
				"label": "Stories",
				"path": "/stories",
				"highlight": "/stories"
			});
			data.navigationItems.push({
				"icon": "fas fa-journal-whills",
				"action": "navigate",
				"label": "Epics",
				"path": "/epics",
				"highlight": "/epics"
			});

			data.navigationItems.push({
				"icon": "fas fa-database",
				"action": "navigate",
				"label": "Nouns",
				"path": "/nouns",
				"highlight": "/nouns"
			});
			data.navigationItems.push({
				"icon": "fad fa-galaxy",
				"action": "navigate",
				"label": "Universe",
				"path": "/universe",
				"highlight": "/universe"
			});

			data.navigationItems.push(bufferItem);
			data.navigationItems.push({
				"icon": "far fa-user",
				"action": "navigate",
				"label": "Account",
				"path": "/account",
				"highlight": "/account"
			});
			data.navigationItems.push({
				"icon": "far fa-server",
				"action": "navigate",
				"label": "System",
				"path": "/system",
				"highlight": "/system"
			});
			data.navigationItems.push({
				"icon": "far fa-question-square",
				"action": "navigate",
				"label": "About",
				"path": "/about",
				"highlight": "/about"
			});

			data.generalItems = [];
			data.shrinkItem = {
				"icon": "far fa-text-width",
				"action": "toggle-labels",
				"label": "Shrink"
			};
			data.generalItems.push(data.shrinkItem);
			data.generalItems.push(bufferItem);
			data.generalItems.push({
				"icon": "far fa-sign-out",
				"action": "logout",
				"label": "Logout"
			});

			return data;
		},
		"watch": {
			"$route": {
				"deep": true,
				"handler": function() {
					this.$forceUpdate();
				}
			},
			"state": {
				"deep": true,
				"handler": function(value) {
					this.saveStorage(this.storageID, this.state);
				}
			},
			"player": {
				"deep": true,
				"handler": function() {
					if(this.player && this.player.entity && !this.myentity) {
						Vue.set(this, "myentity", this.universe.indexes.entity.index[this.player.entity]);
						if(this.myentity) {
							this.navigationItems.unshift({
								"icon": this.myentity.icon || "fas fa-dice-d20",
								"action": "navigate",
								"label": this.myentity.name,
								"path": "/dashboard/" + this.myentity.classification + "/" + this.player.entity,
								"conditionals": [{
									"master": false
								}]
							});
						}
					} else if(this.myentity && (!this.player || !this.player.entity)) {
						Vue.set(this, "myentity", null);
						this.navigationItems.pop();
					}
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
		},
		"methods": {
			"isActive": function(navItem) {
				if(navItem.conditionals) {
					for(var x=0; x<navItem.conditionals.length; x++) {
						if(this.evaluateConditional(navItem.conditionals[x])) {
							return true;
						}
					}
					return false;
				}
				return true;
			},
			"evaluateConditional": function(condition) {
				var keys = Object.keys(condition),
					x;

				for(x=0; x<keys.length; x++) {
					switch(keys[x]) {
						case "master":
							if(condition[keys[x]] === true) {
								return this.player && this.player.master;
							} else if(condition[keys[x]] === false) {
								return !this.player || !this.player.master;
							}
							break;
					}
				}
			},
			"getClassSettings": function() {
				var classes = "full standard undocked";
				if(!this.state.labels) {
					classes += " collapsed";
				}
				return classes;
			},
			"processNavigation": function(navItem) {
//				console.log("Nav: " , navItem);
				switch(navItem.action) {
					case "navigate":
						break;
					case "toggle-labels":
						Vue.set(this.state, "labels", !this.state.labels);
						if(this.state.labels) {
							Vue.set(this.shrinkItem, "label", "Shrink");
						} else {
							Vue.set(this.shrinkItem, "label", "Expand");
						}
						break;
					case "logout":
						rsSystem.EventBus.$emit("logout");
						/*
						if(this.$route.path !== "/") {
							this.$router.push("/").then(() => {
								this.universe.logout();
							});
						} else {
							this.universe.logout();
						}
						*/
						break;
					case "none":
						break;
					default:
						this.universe.log.warn({"message":"Unknown action[" + navItem.action + "] in menu navigation", "item": navItem});
				}
			}
		},
		"template": Vue.templified("components/system/menu.html")
	});
})();
