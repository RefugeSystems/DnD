/**
 *
 *
 * @class dndDisplayRoll
 * @constructor
 * @module Components
 * @param {Roll} roll To render
 */
rsSystem.component("dndDisplayRoll", {
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
	"mounted": function() {
		rsSystem.register(this);
		if(this.formula && this.profile && this.profile.auto_roll) {
			this.rollResult();
		}
	},
	"methods": {
		"focused": function(state) {
			if(state) {
				this.$emit("rollfocused", this.roll);
			} else {
				this.$emit("rollblurred", this.roll);
			}
		},
		"rollResult": function() {
			this.roll.roll(this.source);
		}
	},
	"template": Vue.templified("components/dnd/displays/roll.html")
});
