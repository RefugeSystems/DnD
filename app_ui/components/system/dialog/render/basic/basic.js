
/**
 *
 *
 * @class sysDialogBasic
 * @constructor
 * @module Components
 */
(function() {


	rsSystem.component("sysDialogBasic", {
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
			"dialog": {
				"deep": true,
				"handler": function() {
					this.update();
				}
			}
		},
		"mounted": function() {
			
			
			rsSystem.register(this);
			this.update();
		},
		"methods": {
			"update": function() {
				
				
			}
		},
		"beforeDestroy": function() {
			/*
			this.universe.$off("model:modified", this.update);
			if(this.record && this.record.$off) {
				this.record.$off("modified", this.update);
			}
			*/
		},
		"template": Vue.templified("components/system/dialog/render/basic.html")
	}, "display");
})();
