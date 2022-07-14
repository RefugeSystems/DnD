
/**
 * Handles listing pending and current activities and actions
 * @class dndEntityPending
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityPending", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"computed": {

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
	"template": Vue.templified("components/dnd/entity/pending.html")
});
