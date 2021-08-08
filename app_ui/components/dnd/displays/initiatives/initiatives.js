/**
 *
 *
 * @class dndInitiatives
 * @constructor
 * @module Components
 * @param {Object} entity
 */
rsSystem.component("dndInitiatives", {
	"props": {
		"universe": {
			"requried": true,
			"type": Object
		},
		"entity": {
			"type": Object
		}
	},
	"mixins": [
		rsSystem.components.DNDCombatUtility
	],
	"computed": {
		"combatants": function() {
			var combatants = this.universe.transcribeInto(this.skirmish.entities, [], "entity");
			combatants.sort(rsSystem.utility.sortByInitiative);
			return combatants;
		},
		"myTurn": function() {
			return this.entity && this.entity.id === this.skirmish.combat_turn;
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
		"combatantPortraitClass": function(entity) {
			var classes = "";

			if(this.entity && this.entity.id === entity.id) {
				classes += "me ";
			}
			if(this.skirmish && this.skirmish.combat_turn === entity.id) {
				classes += "current_turn ";
			}

			return classes;
		},
		"info": function(entity) {
			rsSystem.utility.info(entity);
		}
	},
	"beforeDestroy": function() {
	},
	"template": Vue.templified("components/dnd/displays/initiatives.html")
});
