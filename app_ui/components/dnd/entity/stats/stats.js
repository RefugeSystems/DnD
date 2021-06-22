
/**
 *
 *
 * @class dndEntityStats
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityStats", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
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
	"computed": {

	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		/**
		 * Use the DialogList to list actions and highlight usable vs. not usable
		 * with a way to then use those actions.
		 * @method listActions
		 */
		"listActions": function() {
			// TODO: Load List
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogList",
				"entity": this.entity.id
			});
		},
		"getMainHand": function() {
			var attack = this.entity.skill_check["skill:mainhand"] || 0;
			if(attack < 0) {
				return attack;
			}
			return "+" + attack;
		},
		"getOffHand": function() {
			var attack = this.entity.skill_check["skill:offhand"] || 0;
			if(attack < 0) {
				return attack;
			}
			return "+" + attack;
		},
		/**
		 * Use the DialogList to list memorized spells with basic search and a way to
		 * switch into casting that spell.
		 * @method listSpells
		 */
		"listSpells": function() {
			// TODO: Load List
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogList",
				"entity": this.entity.id
			});
		},
		"getSpellAttack": function() {
			var attack = this.entity.spell_attack || 0;
			if(attack < 0) {
				return attack;
			}
			return "+" + attack;
		},
		"getSpellDC": function() {
			return this.entity.spell_dc || 0;
		},
		/**
		 * Use the DialogList to list the contents of the entity's inventory with
		 * basic search and a link to the Inventory page.
		 * @method listInventory
		 */
		"listInventory": function() {
			// TODO: Load List
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogList",
				"entity": this.entity.id
			});
		},
		"getWeightScales": function() {
			if(this.entity.encumberance < this.entity.encumberance_max * .8) {
				return "fa-balance-scale-right";
			} else if(this.entity.encumberance <= this.entity.encumberance_max) {
				return "fa-balance-scale-right rs-lightyellow";
			// } else if(this.entity.encumberance > this.entity.encumberance_max) {
			// 	return "fa-balance-scale-right rs-lightred";
			} else {
				return "fa-balance-scale-left rs-lightred";
				// return "fa-balance-scale rs-lightyellow";
			}
		},
		"checkWeight": function() {
			
		},
		"move": function() {

		},
		"openDiceBin": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id
			});
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/stats.html")
});
