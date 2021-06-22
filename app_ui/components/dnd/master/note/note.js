
/**
 *
 *
 * @class dndMasterNote
 * @constructor
 * @module Components
 */
rsSystem.component("dndMasterNote", {
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
		"profile": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {

	},
	"data": function() {
		var data = {};

		data.note = "";

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
	},
	"methods": {
		"giveGold": function() {

		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/note.html")
});
