/**
 *
 *
 * @class dndDialogMove
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {Object} details
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogMove", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function () {
				return {};
			}
		}
	},
	"computed": {
	},
	"data": function() {
		var data = {},
			i;
		
		data.delta = {};
		data.delta.x = 0;
		data.delta.y = 0;
		data.delta.z = 0;
		data.movement = [];
		for(i=-60; i<=60; i+=1) {
			data.movement.push(i);
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"move": function() {

		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/move.html")
});
