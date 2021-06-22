/**
 *
 *
 * @class dndDialogGive
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogGive", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSCore
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

		data.entity = this.universe.getObject(this.details.entity);

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {

	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/give.html")
});