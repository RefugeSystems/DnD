
/**
 *
 *
 * @class dndPresenterBattle
 * @constructor
 * @module Components
 */
rsSystem.component("dndPresenterBattle", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDCore
	],
	"props": {
		"universe": {
			"type": Object,
			"default": function() {
				return rsSystem.universe;
			}
		},
		"presenting": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"combatants": function() {
			var combatants = [],
				entity,
				i;
			
			if(this.presenting.skirmish) {
				for(i=0; i<this.presenting.skirmish.entities.length; i++) {
					entity = this.universe.get(this.presenting.skirmish.entities[i]);
					if(entity) {
						combatants.push(entity);
					}
				}
			}

			combatants.sort(rsSystem.utility.sortByInitiative);

			return combatants;
		}
	},
	"data": function() {
		var data = {};

		data.scrollBehavior = {
			"behavior": "smooth"
		};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("updated", this.update);
	},
	"methods": {
		"update": function(event) {
			if(this.presenting.skirmish && event && event.id === this.presenting.skirmish.id) {
				var turn = document.getElementById(this.presenting.skirmish.combat_turn);
				if(turn) {
					turn.scrollIntoView(this.scrollBehavior);
				}
			}
		},
		"getCombatantHat": function(combatant) {
			if(combatant.color_flag.startsWith("bordered-")) {
				return "fa-duotone fa-circle-dot rs-" + combatant.color_flag.substring(9);
			} else {
				return "fa-solid fa-circle rs-" + combatant.color_flag;
			}
		},
		"getCombatantClasses": function(combatant) {
			var classes = [];
			if(combatant.is_hostile) {
				classes.push("hostile");
			}
			if(combatant.is_npc) {
				classes.push("npc");
			}
			if(combatant.is_friendly) {
				classes.push("friendly");
			}
			return classes.join(" ");
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("updated", this.update);
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/party/presenter/battle.html")
});
