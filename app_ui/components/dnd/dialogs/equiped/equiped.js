/**
 *
 *
 * @class dndDialogEquiped
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogEquiped", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
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

	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/equiped.html")
});