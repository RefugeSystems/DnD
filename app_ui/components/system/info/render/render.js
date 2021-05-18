
/**
 * Handles rendering the record's information display.
 * 
 * This defaults to the rs-object-info-basic component if the record doesn't specify
 * a "information_renderer" property to point to a different component to handle
 * rending its information.
 * 
 * @class rsObjectInfo
 * @constructor
 * @module Components
 */
(function() {
	
	var invisibleKeys = {};
	invisibleKeys.id = true;
	invisibleKeys.name = true;
	invisibleKeys.universe = true;
	invisibleKeys.icon = true;
	invisibleKeys.modifierstats = true;
	invisibleKeys.modifierattrs = true;
	invisibleKeys.invisibleProperties = true;
	invisibleKeys.description = true;
	invisibleKeys.echo = true;
	
	rsSystem.component("rsObjectInfo", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSShowdown
		],
		"props": {
			"record": {
				"required": true,
				"type": Object
			},
			"player": {
				"type": Object
			},
			"target": {
				"type": Object
			},
			"user": {
				"type": Object
			},
			"base": {
				"type": Object
			},
			"options": {
				"type": Object,
				"default": function() {
					return {};
				}
			}
		},
		"data": function() {
			var data = {};
			
			data.holdDescription = null;
			data.description = null;
			data.keys = [];
			data.id = null;
			
			return data;
		},
		"watch": {
			
		},
		"mounted": function() {
			
		},
		"methods": {
			"visible": function(key) {
				return key && key[0] !== "_" && !invisibleKeys[key] && (!this.record.invisibleProperties || this.record.invisibleProperties.indexOf(key) === -1);
			},
			"update": function() {
			}
		},
		"beforeDestroy": function() {
			if(this.record && this.record.$off) {
				this.record.$off("modified", this.update);
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
		}
	});
})();