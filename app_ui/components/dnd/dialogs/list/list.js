/**
 *
 *
 * @class dndDialogList
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogList", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DnDLocale,
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"listing": function() {
			var list = [],
				item,
				i;

			return list;
		}
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
		"canPerform": function(action) {

		},
		"perform": function (action) {
			
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/dnd/dialogs/list.html")
});