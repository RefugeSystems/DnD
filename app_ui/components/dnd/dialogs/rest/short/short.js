/**
 *
 *
 * @class dndDialogShortRest
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogShortRest", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"attunables": function() {
			var attunables = [],
				item,
				i;

			if(this.entity && this.entity.inventory) {
				for(i=0; i<this.entity.inventory.length; i++) {
					item = this.universe.index.item[this.entity.inventory[i]];
					if(item && !item.obscured && item.attunes && item.attuned !== this.entity.id) {
						attunables.push(item);
					}
				}
			}

			return attunables;
		}
	},
	"data": function () {
		var data = {},
			i;

		if(typeof(this.details.entity) === "string") {
			data.entity = this.universe.getObject(this.details.entity);
		} else {
			data.entity = this.details.entity;
		}

		data.attune = null;
		data.roll = 0;
		if(data.entity.hit_dice) {
			data.hitdie = Object.keys(data.entity.hit_dice);
			data.used = {};
			for(i=0; i<data.hitdie.length; i++) {
				data.used[data.hitdie[i]] = 0;
			}
		} else {
			data.hitdie = [];
			data.used = {};
		}

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"rest": function() {
			this.universe.send("action:perform", {
				"action": "action:rest:short",
				"entity": this.entity.id,
				"result": this.used,
				"item": this.attune,
				"roll": this.roll
			});
			for(var i=0; i<this.hitdie.length; i++) {
				Vue.set(this.used, this.hitdie[i], 0);
			}
			this.closeDialog();
		},
		"addDie": function(die) {
			if(this.used[die] < parseInt(this.entity.hit_dice[die])) {
				Vue.set(this.used, die, this.used[die] + 1);
				if(this.profile.auto_roll) {
					Vue.set(this, "roll", this.roll + rsSystem.dnd.Calculator.diceRoll(die));
				}
			}
		},
		"subDie": function(die) {
			if(this.used[die] > 0) {
				if(this.profile.auto_roll) {
					Vue.set(this.used, die, 0);
					Vue.set(this, "roll", 0);
				} else {
					Vue.set(this.used, die, this.used[die] - 1);
				}
			}
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/rest/short.html")
});