/**
 *
 *
 * @class dndDialogCheck
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogCheck", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DNDEntityCore,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
			"type": Object
		}
	},
	"computed": {
		"additives": function() {
			var additives = [],
				search,
				check,
				i;

			
			if(this.entity) {
				search = this.universe.transcribeInto(this.entity.feats);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill && check.additive_skill[this.skill.id]) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(this.entity.equipped);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill && check.additive_skill[this.skill.id]) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(this.entity.spells);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill && check.additive_skill[this.skill.id]) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(this.entity.effects);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill && check.additive_skill[this.skill.id]) {
						additives.push(check);
					}
				}
			}

			return additives;
		}
	},
	"data": function () {
		var data = {},
			formula;

		data.active_additives = {};

		data.entity = this.details.entity;
		if(typeof(data.entity) === "string") {
			data.entity = this.universe.index.entity[this.details.entity];
		}
		if(this.details.formula) {
			formula = this.details.formula;
		} else if(this.details.skill) {
			data.skill = this.details.skill;
			if(typeof(data.skill) === "string") {
				data.skill = this.universe.index.skill[data.skill];
			}
			if(data.skill && data.entity && data.entity.skill_check) {
				formula = "1d20 + " + (data.entity.skill_check[data.skill.id] || 0);
			} else {
				formula = "1d20";
			}
		} else {
			formula = "1d20";
		}

		data.roll = new Roll({
			"name": data.skill?data.skill.name:this.details.name,
			"source": data.entity,
			"formula": formula
		});
		data.dice = rsSystem.dnd.diceDefinitions;

		data.name = data.skill?data.skill.name:"Skill Check";

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
		if(this.profile && this.profile.auto_roll && (this.profile.auto_submit || (this.entity.is_minion && this.profile.auto_submit_minion))) {
			setTimeout(() => {
				this.send();
			}, 100);
		}
	},
	"methods": {
		"toggleAdditive": function(additive) {
			if(this.active_additives[additive.id]) {
				this.removeAdditive(additive);
			} else {
				this.addAdditive(additive);
			}
		},
		"addAdditive": function(additive) {
			Vue.set(this.active_additives, additive.id, additive);
			console.log("Adding: ", additive);
			this.recalculateFormula();
		},
		"removeAdditive": function(additive) {
			Vue.delete(this.active_additives, additive.id);
			console.log("Removing: ", additive);
			this.recalculateFormula();
		},
		"classAdditive": function(additive) {
			// var classes = additive.icon || "game-icon game-icon-abstract-041";

			if(this.active_additives[additive.id]) {
				return "selected";
				// classes += " selected";
			}
			return "";
			// return classes;
		},
		"recalculateFormula": function() {
			// var formula = "1d20 + " + this.entity.skill_check[this.skill.id],
			var adds = Object.keys(this.active_additives),
				formula,
				i;
			
			if(this.details.formula) {
				formula = this.details.formula;
			} else if(this.skill) {
				if(this.entity && this.entity.skill_check) {
					formula = "1d20 + " + (this.entity.skill_check[this.skill.id] || 0);
				} else {
					formula = "1d20";
				}

				for(i=0; i<adds.length; i++) {
					formula += " + " + this.active_additives[adds[i]].additive_skill[this.skill.id];
				}
			} else {
				formula = "1d20";
			}

			this.roll.setFormula(formula);
		},
		"autoSubmit": function() {
			if(this.profile && (this.profile.auto_submit || (this.entity.is_minion && this.profile.auto_submit_minion))) {
				this.send();
			}
		},
		"setFocus": function(roll) {

		},
		"addStat": function(stat) {
			Vue.set(this.roll, "computed", this.focused_roll.computed + stat.value);
		},
		"addDie": function(die) {
			this.roll.add(die.id);
		},
		"send": function() {
			var check = {};
			if(this.roll.computed !== null && this.roll.computed !== undefined && this.roll.computed !== "") {
				check.result = this.roll.computed || 0;
				check.channel = this.details.channel;
				check.entity = this.entity?this.entity.id:undefined;
				check.name = this.skill?this.skill.name:this.details.name;
				check.skill = this.skill?this.skill.id:null;
				check.dice = this.roll.dice_rolls; // Legacy Support;
				check.roll = this.roll; // Future Support
				check.additives = Object.keys(this.active_additives);
				check.critical = this.roll.is_critical;
				check.failure = this.roll.is_failure;
				check.target = this.details.target;
				console.log("Sending[" + this.roll.computed + "]: ", check);
				this.universe.send("action:check", check);
				if(this.details.closeAfterCheck) {
					this.closeDialog();
				}
			}
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/check.html")
});