/**
 *
 * @class dndDialogEquipSet
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {UIProfile} profile
 * @param {Object} details
 */
rsSystem.component("dndDialogEquipSet", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DialogController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {

	},
	"data": function () {
		var data = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"update": function() {
			Vue.set(this, "lastAction", Date.now());
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/dnd/dialogs/equipset.html")
});
