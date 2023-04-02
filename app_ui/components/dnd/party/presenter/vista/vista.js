
/**
 *
 *
 * @class dndPresenterVista
 * @constructor
 * @module Components
 */
rsSystem.component("dndPresenterVista", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDCore
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
	"template": Vue.templified("components/dnd/party/presenter/vista.html")
});
