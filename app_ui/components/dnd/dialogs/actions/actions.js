/**
 *
 *
 * @class dndActionsList
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndActionsList", {
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
		"actions": function() {
			var actions = {},
				action,
				i;

			return actions;
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
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/actions.html")
});