
/**
 *
 *
 * @class DNDMasterMain
 * @constructor
 * @module Components
 */
rsSystem.component("DNDMasterMain", {
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
		}
	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
	},
	"methods": {
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/master/main.html")
});
