
/**
 *
 *
 * @class systemMenu
 * @constructor
 * @module Components
 * @zindex 10
 */
(function() {
	var storageKey = "_rs_dialogComponentKey";

	rsSystem.component("systemDialog", {
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
						if(this.$route.path !== "/") {
							this.$router.push("/").then(() => {
								this.universe.logout();
							});
						} else {
							this.universe.logout();
						}
						break;
					case "none":
						break;
					default:
						this.universe.log.warn({"message":"Unknown action[" + navItem.action + "] in menu navigation", "item": navItem});
				}
			}
		},
		"render": function(createElement) {
			var elements = false,
				classes = {},
				contents,
				widget;
			
			elements = [createElement(this.record.information_renderer || "rs-object-info-basic", {
				"props": {
					"universe": this.universe,
					"options": this.options,
					"player": this.player,
					"record": this.record,
					"target": this.target,
					"base": this.base,
					"user": this.user
				}
			})];
			
			if(!elements) {
				elements = [createElement("div")];
			}
			
			classes["object-info"] = true;
			if(this.record.information_classes) {
				classes[this.record.information_classes] = true;
			}
			
			return createElement("div", {
				"class": classes
			}, elements);
		},
		"template": Vue.templified("components/system/menu.html")
	});
})();
