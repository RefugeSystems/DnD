
/**
 *
 *
 * @class dndEntityName
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityName", {
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
		"info": function() {
			rsSystem.EventBus.$emit("display-info", {
				"info": this.entity.id
			});
		},
		"levelUp": function() {
			// TODO
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/name.html")
});
