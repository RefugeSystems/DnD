
/**
 * 
 * @class sysDialogRenderer
 * @constructor
 * @module Components
 */
(function() {
	
	rsSystem.component("sysDialogRenderer", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSShowdown
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
			"dialog": {
				"required": true,
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
			
			return data;
		},
		"watch": {
			
		},
		"mounted": function() {
			
		},
		"methods": {
			"update": function() {
			}
		},
		"beforeDestroy": function() {
			
		},
		"render": function(createElement) {
			var elements = false,
				classes = {},
				contents,
				widget;
			
			elements = [createElement(this.record.information_renderer || "sys-dialog-basic", {
				"props": {
					"universe": this.universe,
					"options": this.options,
					"player": this.player,
					"dialog": this.dialog
				}
			})];
			
			if(!elements) {
				elements = [createElement("div")];
			}
			
			/*
			classes["object-info"] = true;
			if(this.record.information_classes) {
				classes[this.record.information_classes] = true;
			}
			*/
			
			return createElement("div", {
				"class": classes
			}, elements);
		}
	});
})();
