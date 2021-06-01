
/**
 *
 *
 * @class dndDisplayGeneral
 * @constructor
 * @module Components
 */
rsSystem.component("dndDisplayGeneral", {
	"props": {
		"object": {
			"requried": true,
			"type": Object
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
	"template": Vue.templified("components/dnd/display/general.html")
});
