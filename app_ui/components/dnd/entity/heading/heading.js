
/**
 * Simple naming bar meant to label entities a player does not know.
 * @class dndEntityHeading
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityHeading", {
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
	"template": Vue.templified("components/dnd/entity/heading.html")
});
