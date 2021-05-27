
/**
 *
 *
 * @class systemMenu
 * @constructor
 * @module Components
 * @zindex 10
 */
rsSystem.component("systemMenu", {
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
		}
	},
	"data": function() {
		var data = {},
			item,
			i,
			j;

		data.items = {};
		data.items.app = [];
		data.items.controls = [];
		data.items.options = [];
		
		var navigation = [],
			routes = {},
			item;
			
		if(this.configuration.mainpage) {
			item = {
				"path": "/home",
				"component": rsSystem.components[this.configuration.mainpage],
				"icon": "fas fa-globe"
			};
			data.items.app.push(item);
		}
		if(this.configuration.navigations) {
			for(i=0; i<this.configuration.navigations.length; i++) {
				// item = Object.assign({}, this.configuration.navigations[i]); // TODO: Nested children processing
				item = this.configuration.navigations[i]; // TODO: Nested children processing
				if(item.route && item.component) {
					if(rsSystem.components[item.component]) {
						switch(item.grouping) {
							case "options":
							case "controls":
								data.items[item.grouping].push(item);
								break;
							default:
								data.items.app.push(item);
						}
					} else {
						// console.error("No component for navigation item: ", item); // Handled in navigation load
					}
				}
			}
		}
		//rsSystem.Router.addRoute(routes);
		
		/*
		if(this.configuration.navigations) {
			for(i=0; i<this.configuration.navigations.length; i++) {
				item = this.configuration.navigations[i];
				if(item.route && item.component) {
					if(rsSystem.components[item.component]) {
						rsSystem.Router.addRoute({
							"path": item.route,
							"component": rsSystem.components[item.component]
						});
					} else {
						console.error("No component for navigation item: ", item);
					}
				}
				switch(item.grouping) {
					case "options":
					case "controls":
						data.items[item.grouping].push(item);
						break;
					default:
						data.items.app.push(item);
				}
			}
		}
		*/
		
		data.optionsItem = {
			"icon": "fas fa-cogs",
			"emit": rsSystem.object_reference.events.options
		};
		
		data.classing = "";
		data.collapseItem = {};
		
		return data;
	},
	"watch": {
		"$route": {
			"deep": true,
			"handler": function() {
				this.$forceUpdate();
			}
		}
	},
	"mounted": function() {
		rsSystem.register(this);
		this.updateCollapse();
	},
	"methods": {
		"updateCollapse": function() {
			Vue.set(this.collapseItem, "icon", "fas fa-sign-out-alt " + (this.storage.collapsed?"rot0":"rot180"));
			Vue.set(this.storage, "classing", this.storage.collapsed?"collapsed":"extended");
		},
		"isActive": function(item) {
			if(item.path || item.emit) {
				if(item.conditionals) {
					for(var x=0; x<item.conditionals.length; x++) {
						if(this.evaluateConditional(item.conditionals[x])) {
							return true;
						}
					}
					return false;
				}
				return true;
			}
			return false;
		},
		"evaluateConditional": function(condition) {
			var keys = Object.keys(condition),
				x;

			for(x=0; x<keys.length; x++) {
				switch(keys[x]) {
					case "master":
					case "gm":
						if(condition[keys[x]] === true) {
							return this.player && this.player[keys[x]];
						} else if(condition[keys[x]] === false) {
							return !this.player || !this.player[keys[x]];
						}
						break;
					default:
						return this.player && this.player[keys[x]] === condition[keys[x]];
				}
			}
		},
		"setClassing": function(classing) {
			Vue.set(this, "classing", classing);
		},
		"getItemClassing": function(item) {
			var classing = item.classes || "";
			if(item.highlight && ( (item.highlight[0] === "/" && this.$route.path.startsWith(item.highlight)) || (item.highlight[0] === "?" && this.$route.path.indexOf(item.highlight) !== -1) )) {
				return classing + " highlight";
			}
			return classing;
		},
		"processNavigation": function(item) {
			if(item === this.collapseItem) {
				Vue.set(this.storage, "collapsed", !this.storage.collapsed);
				this.updateCollapse();
			} else if(item.path) {
				this.$router.push(item.path);
			} else if(item.action) {
				switch(item.action) {
					case "toggle-labels":
						Vue.set(this.storage, "labels", !this.storage.labels);
						break;
					case "logout":
						rsSystem.EventBus.$emit("logout");
						break;
					default:
						this.universe.log.warn({"message":"Unknown action[" + item.action + "] in menu navigation", "item": item});
				}
			} else if(item.emit) {
				if(item.emit.type) {
					rsSystem.EventBus.$emit(item.emit.type, item.emit);
				} else {
					rsSystem.EventBus.$emit(item.emit);
				}
			} else {
				console.log("Unknown Navigation Item Processing: ", item);
			}
		}
	},
	"template": Vue.templified("components/system/menu.html")
});
