
/**
 *
 *
 * @class DNDMasterEntity
 * @constructor
 * @module Components
 */
rsSystem.component("dndMasterEntity", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"entity": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		},
		"rolled": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"image": function() {
			return this.universe.index.image[this.entity.portrait];
		}
		/* Doesn't trigger on updates from heirarchecal "parents"
		 */
		// "rolls": function() {
		// 	var rolls = [],
		// 		roll,
		// 		i;

		// 	if(this.rolled[this.entity.id]) {
		// 		console.log(" > Exists");
		// 		for(i=0; i<this.rolled[this.entity.id].length; i++) {
		// 			console.log(" > Adding " + i);
		// 			roll = this.rolled[this.entity.id][i];
		// 			// TODO: Skill Check
		// 			if(roll) {
		// 				console.log(" > Added");
		// 				rolls.push(roll);
		// 			}
		// 		}
		// 	}

		// 	console.log(" = Returned");
		// 	return rolls;
		// }
	},
	"data": function() {
		var data = {};

		data.rolls = [];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("entity:roll", this.entityRolled);
	},
	"methods": {
		"getRollClass": function(roll) {
			if(roll && roll.dice && roll.dice.d20) {
				if(roll.dice.d20 && roll.dice.d20.length) {
					if(roll.dice.d20[0] === 1) {
						return "crit-fail";
					} else if(roll.dice.d20[0] === 20) {
						return "crit-pass";
					}
				}
			} else if(roll.skill && roll.skill.id) {
				if(roll.result - (this.entity.skill_check[roll.skill.id] || 0) === 1) {
					return "crit-fail";
				} else if(roll.result - (this.entity.skill_check[roll.skill.id] || 0) === 20) {
					return "crit-pass";
				}
			}

			return "";
		},
		"entityRolled": function(event) {
			if(event && event.entity === this.entity.id) {
				var roll = Object.assign({}, event);
				if(!this.rolled[roll.entity]) {
					this.rolled[roll.entity] = [];
				}
				if(typeof(roll.skill) === "string") {
					if(this.universe.index.skill[roll.skill]) {
						roll.skill = this.universe.index.skill[roll.skill];
					}
				}
				this.rolls.push(roll);
			}
			// setTimeout(() => {
			// 	this.updateRolls();
			// }, 0);
		},
		"updateRolls": function() {
			this.rolls.splice(0);
			var roll,
				i;

			if(this.rolled[this.entity.id]) {
				console.log(" > Exists");
				for(i=0; i<this.rolled[this.entity.id].length; i++) {
					console.log(" > Adding " + i);
					roll = this.rolled[this.entity.id][i];
					// TODO: Skill Check
					if(roll) {
						console.log(" > Added");
						this.rolls.push(roll);
					}
				}
			}
		},
		"giveGold": function() {

		},
		"givePoints": function() {

		},
		"giveEffects": function() {

		},
		"openRoll": function(roll) {

		},
		"dismissRoll": function(index) {
			if(this.rolled[this.entity.id]) {
				this.rolled[this.entity.id].splice(index, 1);
				this.updateRolls();
			}
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("entity:roll", this.entityRolled);
	},
	"template": Vue.templified("components/dnd/master/entity.html")
});
