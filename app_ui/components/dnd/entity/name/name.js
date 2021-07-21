
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
		"name": function() {

		},
		"levelUp": function() {
			if(this.entity.point_pool && this.entity.point_pool.level > 0) {
				rsSystem.EventBus.$emit("dialog-open", {
					"component": "dndCharacterLevelDialog",
					"level": this.entity.level + 1,
					"entity": this.entity.id
				});
			}
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
