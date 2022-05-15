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
	"watch": {
		"roll.formula": function(nV, oV) {
			console.log("Roll Forumula Changed: " + oV + " -> " + nV);
			// this.autoRoll(true, true);
			if(this.roll.computed === undefined || this.roll.computed === null) {
				this.autoRoll(true);
			} else {
				this.autoFill();
			}
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

		data.skill_check = this.roll && this.roll.formula && typeof(this.roll.formula) == "string" && this.roll.formula.indexOf("d20") !== -1;
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
		"autoRoll": function(set, forced) {
			if(this.roll.formula && this.profile && this.profile.auto_roll && (forced || this.roll.computed === undefined || this.roll.computed === null)) {
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
		/**
		 * This is meant to handle corrections for minor additions to skill rolls or dice count changes in general rolls, such as damage.
		 * As such, no considerations of "Critical" are considered here.
		 * @method autoFill
		 */
		"autoFill": function() {
			if(this.roll.formula && this.profile && this.profile.auto_roll) {
				var pending = rsSystem.dnd.parseDiceRoll(this.roll.formula),
					keys = Object.keys(pending).concat(Object.keys(this.roll.dice_rolls)),
					checked = {},
					key,
					i;
				
				for(i=0; i<keys.length; i++) {
					if(!checked[key = keys[i]] && key !== "remainder") {
						pending[key] = parseInt(pending[key]) || 0;
						checked[key] = true;
						if(typeof(pending[key]) === "number") {
							while(!this.roll.dice_rolls[key] || this.roll.dice_rolls[key].length < pending[key]) {
								this.roll.add(key);
							}
							while(this.roll.dice_rolls[key] && this.roll.dice_rolls[key].length > pending[key]) {
								this.roll.remove(key);
							}
						}
					}
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
			Vue.set(this.roll, "is_critical", !this.roll.is_critical); // Due to Vue update cycle issues with usage within the Roll class
			if(this.roll.is_failure) {
				Vue.set(this.roll, "is_failure", false);
			}
		},
		"toggleFailure": function() {
			Vue.set(this.roll, "is_failure", !this.roll.is_failure); // Due to Vue update cycle issues with usage within the Roll class, 
			if(this.roll.is_critical) {
				Vue.set(this.roll, "is_critical", false);
			}
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
