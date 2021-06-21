/**
 *
 *
 * @class dndEntityDamage
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityDamage", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"sources": function() {

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
	},
	"template": Vue.templified("components/dnd/entity/damage.html")
});
