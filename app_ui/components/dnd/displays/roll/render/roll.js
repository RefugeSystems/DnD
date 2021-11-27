/**
 *
 *
 * @class dndRenderRoll
 * @constructor
 * @module Components
 * @param {Roll} roll To render
 */
rsSystem.component("dndRenderRoll", {
	"inherit": true,
	"props": {
		"roll": {
			"requried": true,
			"type": Object
		},
		"source": {
			"type": Object
		},
		"profile": {
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		data.skill_check = this.roll && this.roll.formula && this.roll.formula.indexOf("d20") !== -1;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
	},
	"template": Vue.templified("components/dnd/displays/render/roll.html")
});
