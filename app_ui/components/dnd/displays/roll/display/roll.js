/**
 *
 *
 * @class dndDisplayRoll
 * @constructor
 * @module Components
 * @param {Roll} roll To control and display
 */
rsSystem.component("dndDisplayRoll", {
	"inherit": true,
	"props": {
		"roll": {
			"requried": true,
			"type": Object
		},
		"autoFocus": {
			"type": Boolean
		},
		"source": {
			"type": Object
		},
		"skill": {
			"type": Object
		},
		"profile": {
			"type": Object
		}
	},
	"computed": {
		"autoRollBinding": function() {
			this.autoRoll(true);
			this.setClasses();
			if(this.source && this.skill && this.source.skill_advantage && this.source.skill_advantage[this.skill.id]) {
				if(this.source.skill_advantage[this.skill.id] > 0) {
					return "advantage ";
				} else if(this.source.skill_advantage[this.skill.id] < 0) {
					return "disadvantage ";
				}
			}
			return "";
		}
	},
	"data": function() {
		var data = {};

		data.skill_check = this.roll && this.roll.formula && this.roll.formula.indexOf("d20") !== -1;
		this.autoRoll(false);
		data.is_critical = this.roll.is_critical;
		data.is_failure = this.roll.is_failure;
		data.classes = "";
		if(data.is_critical) {
			data.classes += " critical";
		}
		if(data.is_failure) {
			data.classes += " failure";
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(this.autoFocus) {
			this.$el.querySelector("input").focus();
		}
	},
	"methods": {
		"autoRoll": function(set) {
			if(this.roll.formula && this.profile && this.profile.auto_roll && (this.roll.computed === undefined || this.roll.computed === null)) {
				if(this.source && this.skill && this.source.skill_advantage && this.source.skill_advantage[this.skill.id]) {
					if(this.source.skill_advantage[this.skill.id] < 0) {
						this.disadvantage();
					} else if(this.source.skill_advantage[this.skill.id] > 0) {
						this.advantage();
					} else {
						this.rollResult();
					}
				} else {
					this.rollResult();
				}
				if(set) {
					Vue.set(this, "is_critical", this.roll.is_critical);
					Vue.set(this, "is_failure", this.roll.is_failure);
					this.setClasses();
				}
				this.$emit("rolled");
			}
		},
		"focused": function(state) {
			if(state) {
				this.$emit("rollfocused", this.roll);
				this.setClasses();
			} else {
				this.$emit("rollblurred", this.roll);
				this.setClasses();
			}
		},
		"toggleCritical": function() {
			Vue.set(this.roll, "is_critical", !this.roll.is_critical); // Due to Vue update cycle issues with usage within the Roll class, 
		},
		"toggleFailure": function() {
			Vue.set(this.roll, "is_failure", !this.roll.is_failure); // Due to Vue update cycle issues with usage within the Roll class, 
		},
		"advantage": function() {
			if(!this.roll.dice_rolls.d20 || !this.roll.dice_rolls.d20.length) {
				this.rollResult();
			}
			this.roll.reroll("d20", 0, 1);
			this.$emit("rolled");
		},
		"disadvantage": function() {
			if(!this.roll.dice_rolls.d20 || !this.roll.dice_rolls.d20.length) {
				this.rollResult();
			}
			this.roll.reroll("d20", 0, -1);
			this.$emit("rolled");
		},
		"rollResult": function() {
			this.roll.roll(this.source);
			this.$emit("rolled");
		},
		"setClasses": function() {
			var classes = "";
			if(this.roll.is_focused) {
				classes += " roll-focused";
			}
			if(this.is_critical) {
				classes += " critical";
			}
			if(this.is_failure) {
				classes += " failure";
			}
			Vue.set(this, "classes", classes);
		}
	},
	"template": Vue.templified("components/dnd/displays/roll/display.html")
});
