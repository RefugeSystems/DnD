
/**
 * 
 * 
 * @class rsContainer
 * @constructor
 * @module Components
 */
(function() {
	var storageKey = "_rs_containerComponentKey";
	
	rsSystem.component("rsContainer", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageManager
		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			},
			"entity": {
				"required": false,
				"type": Object
			},
			"user": {
				"required": false,
				"type": Object
			},
			"contents": {
				"required": true,
				"type": Object
			},
			"index": {
				"type": Number
			}
		},
		"data": function() {
			var data = {};
			
			data.storageID = storageKey + (this.contents.sid || this.contents.id || this.contents._sourced);
			if(this.entity) {
				data.storageID += this.entity.id;
			}
			data.state = this.loadStorage(data.storageID, {
				"closed": false
			});
			
			return data;
		},
		"watch": {
			"state": {
				"deep": true,
				"handler": function(value) {
					this.saveStorage(this.storageID, this.state);
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);

			if(this.$el) {
				if(this.state.configuring) {
					if(this.state.closed) {
						this.$el.classList.add("configuring");
					} else {
						Vue.set(this.state, "configuring", false);
					}
				}
			} else {
				console.error("no el");
			}
		},
		"methods": {
			"showName": function() {
				return this.entity && this.index === 0;
			},
			"getClasses": function() {
				var classes = "";
				if(this.borderColor) {
					classes += " rs-border one rsbd-" + this.borderColor;
				}
				return classes.trim();
			},
			"toggle": function() {
				if(this.$el) {
					if(this.state.closed) {
						Vue.set(this.state, "configuring", false);
						this.$el.classList.remove("configuring");
						this.$el.classList.remove("collapsed");
					} else {
						this.$el.classList.add("collapsed");
						Vue.set(this.state, "configuring", false);
					}
					Vue.set(this.state, "closed", !this.state.closed);
				} else {
					console.error("Can't Find Container");
				}
			},
			"config": function() {
				if(this.$el) {
					if(this.state.configuring) {
						this.$el.classList.remove("configuring");
					} else {
						this.$el.classList.add("configuring");
					}
					Vue.set(this.state, "configuring", !this.state.configuring);
				} else {
					console.error("Can't Find Container");
				}
			},
			"editSettings": function() {

			},
			"closeSettings": function() {
			
			}
		},
		"render": function(createElement) {
			var elements = [],
				classes = {},
				contents,
				widget,
				keys,
				x;
			
			if(this.contents.enabled && this.contents.declaration && rsSystem.components[this.contents.declaration]) {
				if(this.contents.state) {
					keys = Object.keys(this.contents.state);
					for(x=0; x<keys.length; x++) {
						Vue.set(this.state, keys[x], this.contents.state[keys[x]]);
					}
				}
				
				if(this.state && this.state.filter && (this.state.filter["null"] === null || this.state.filter["null"] === undefined)) {
					this.state.filter["null"] = "";
				}
				
				if(this.contents && this.contents.defaults) {
					keys = Object.keys(this.contents.defaults);
					for(x=0; x<keys.length; x++) {
						if(this.state[keys[x]] === undefined) {
							Vue.set(this.state, keys[x], this.contents.defaults[keys[x]]);
						}
					}
				}

				widget = {};
				widget.props = {};
				widget.props["settings"] = this.contents.settings;
				widget.props["universe"] = this.universe;
				widget.props["contents"] = this.contents;
				widget.props["entity"] = this.entity;
				widget.props["index"] = this.index;
				widget.props["state"] = this.state;
				elements.push(createElement("rs-widget-configure", widget));
				
				widget.on = {};
				widget.on.toggle = this.toggle;
				widget.on.config = this.config;
				elements.push(createElement("rs-widget-control", widget));
				
				widget = {};
				widget.props = {};
				widget.props["storage_id"] = this.storageID;
				widget.props["universe"] = this.universe;
				widget.props["character"] = this.entity;
				widget.props["entity"] = this.entity;
				widget.props["sid"] = this.storageID;
				widget.props["index"] = this.index;
				widget.props["state"] = this.state;
				widget.props["user"] = this.user;
				widget.class = {};
				widget.class["rs-containment"] = true;
				elements.push(createElement(this.contents.declaration, widget));
			} else {
				elements.push(createElement("div"));
			}
			
			classes["rs-component rs-container"] = true;
			classes[this.getClasses()] = true;
			/*
			return createElement("div", {
				"class": classes
			}, elements);
			/* */
			contents = [createElement("div", {
				"class": classes
			}, elements)];
			
			return createElement("div", {
				"class": {
					"rs-component rs-widget": true,
					"sticky": !!this.state.sticky_widget,
					"collapsed": this.state.closed
				}
			}, [contents]);
			/* */
		}
	});
})();
