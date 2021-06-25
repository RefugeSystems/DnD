
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
			var details = {},
				action,
				types,
				i;

			details.title = this.entity.name + " Actions";
			details.component = "dndDialogList";
			details.sections = ["movement", "main", "bonus", "reaction", "multiple", "free"];
			details.cards = {};
			details.data = {
				"movement": [],
				"multiple": [],
				"reaction": [],
				"bonus": [],
				"main": [],
				"free": []
			};

			details.activate = (section, action) => {
				this.info(action);
			};

			details.classing = (section, action) => {
				if(!this.entity.action_count) {
					return "no-points";
				}
				if(!action.action_cost) {
					return "none-used";
				}

				var keys = Object.keys(action.action_cost),
					i;

				for(i=0; i<keys.length; i++) {
					if(!this.entity.action_count[keys[i]] || this.entity.action_count[keys[i]] < action.action_cost[keys[i]]) {
						return "no-points";
					}
				}

				return "has-points";
			};

			details.note = (section, action) => {
				if(!this.entity.action_count) {
					return "<div class=\"note\">You have no points</div>";
				}
				if(action.action_cost) {
					var keys = Object.keys(action.action_cost),
						i;

					for(i=0; i<keys.length; i++) {
						if(!this.entity.action_count[keys[i]] || this.entity.action_count[keys[i]] < action.action_cost[keys[i]]) {
							return "<div class=\"note\">You are missing " + section + " action oints</div>";
						}
					}
				}
				return "<span></span>";
			};

			details.cards.free = {
				"name": "Free",
				"icon": "fas fa-sword",
				"description": "You can perform these once on your turn without using any types of actions"
			};
			details.cards.movement = {
				"name": "Movement",
				"icon": "fas fa-runner",
				"description": "Used to move around the area"
			};
			details.cards.main = {
				"name": "Main",
				"icon": "fas fa-sword",
				"description": "Used for performing a task like attacking or using an item"
			};
			details.cards.bonus = {
				"name": "Bonus",
				"icon": "game-icon game-icon-icicles-aura",
				"description": "A special type of action that is small enough to perform with a ${Main Action}$"
			};
			details.cards.reaction = {
				"name": "Reaction",
				"icon": "game-icon game-icon-pendulum-swing",
				"description": "Tasks you can do in response to something happening outside of your turn"
			};
			details.cards.multiple = {
				"name": "Multiples",
				"icon": "game-icon game-icon-boomerang-cross",
				"description": "Requiring more than 1 type of action to perform"
			};
			
			for(i=0; i<this.entity.actions.length; i++) {
				action = this.universe.index.action[this.entity.actions[i]];
				if(action && !action.disabled) {
					types = Object.keys(action.action_cost);
					if(types.length === 0) {
						details.data.free.push(action);
					} else if(types.length === 1) {
						if(!details.data[types[0]]) {
							details.data[types[0]] = [];
							details.card[types[0]] = {
								"name": types[0]
							};
						}
						details.data[types[0]].push(action);
					} else {
						details.data.multiple.push(action);
					}
				}
			}

			rsSystem.EventBus.$emit("dialog-open", details);
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
