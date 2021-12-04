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

	},
	"data": function () {
		var data = {},
			formula;

		data.entity = this.details.entity;
		if(typeof(data.entity) === "string") {
			data.entity = this.universe.index.entity[this.details.entity];
		}
		data.skill = this.details.skill;
		if(typeof(data.skill) === "string") {
			data.skill = this.universe.index.skill[data.skill];
		}
		if(data.skill && data.entity && data.entity.skill_check) {
			formula = "1d20 + " + (data.entity.skill_check[data.skill.id] || 0);
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
		if(this.profile && this.profile.auto_roll && this.profile.auto_submit) {
			setTimeout(() => {
				this.send();
			}, 100);
		}
	},
	"methods": {
		"autoSubmit": function() {
			if(this.profile && this.profile.auto_submit) {
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
				check.critical = this.roll.is_critical;
				check.failure = this.roll.is_failure;
				check.target = this.details.target;
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