
/**
 *
 *
 * @class dndEntitySummary
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntitySummary", {
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
		/**
		 * 
		 * @property image
		 * @type Object
		 */
		"image": function() {
			if(this.entity.picture) {
				return this.universe.index.image[this.entity.picture];
			}
			return null;
		},
		"damage": {

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
	"template": Vue.templified("components/dnd/entity/summary.html")
});
