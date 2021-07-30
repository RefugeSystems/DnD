
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
		"hoverMovement": function(pass) {
			if(pass) {
				this.$emit("hovered-object", {
					"range_normal": this.entity.movement_ground
				});
			} else {
				this.$emit("hovered-object", null);
			}
		},
		/**
		 * Use the DialogList to list actions and highlight usable vs. not usable
		 * with a way to then use those actions.
		 * @method listActions
		 */
		"listActions": function() {
			var details = {},
				action,
				types,
				i,
				j;

			details.title = this.entity.name + " Actions";
			details.component = "dndDialogList";
			details.sections = ["movement", "main", "bonus", "reaction", "multiple", "free"];
			details.related = {};
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
							return "<div class=\"note\">You are short on " + section + " action points</div>";
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
					if(this.entity.response && this.entity.response[action.id]) {
						details.related[action.id] = [];
						for(j=0; j<this.entity.response[action.id].length; j++) {
							if(this.entity.response[action.id][j].name && !this.entity.response[action.id][j].hidden) {
								details.related[action.id].push(this.entity.response[action.id][j].name);
							}
						}
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
			var details = {},
				known,
				spell,
				i;

			details.title = this.entity.name;
			details.component = "dndDialogList";
			details.link = "/spells/" + this.entity.id;
			details.entity = this.entity.id;
			details.sections = ["prepared", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
			details.cards = {};
			details.limit = 20,
			details.data = {
				"prepared": this.universe.transcribeInto(this.entity.spells, [], "spell"),
				"0": [],
				"1": [],
				"2": [],
				"3": [],
				"4": [],
				"5": [],
				"6": [],
				"7": [],
				"8": [],
				"9": [],
				"10": [],
				"none": []
			};
			details.cards.none = {
				"name": "No Level"
			};
			details.cards.prepared = {
				"name": "Prepared"
			};
			details.cards[0] = {"name": "Cantrips"};
			details.cards[1] = {"name": "Level 1"};
			details.cards[2] = {"name": "Level 2"};
			details.cards[3] = {"name": "Level 3"};
			details.cards[4] = {"name": "Level 4"};
			details.cards[5] = {"name": "Level 5"};
			details.cards[6] = {"name": "Level 6"};
			details.cards[7] = {"name": "Level 7"};
			details.cards[8] = {"name": "Level 8"};
			details.cards[9] = {"name": "Level 9"};
			details.cards[10] = {"name": "Level 10"};

			known = Object.keys(this.entity.knowledge_matrix);
			for(i=0; i<known.length; i++) {
				spell = this.universe.index.spell[known[i]];
				if(spell && !spell.disabled && !spell.is_preview && details.data[spell.level]) {
					details.data[spell.level].push(spell);
				}
			}

			for(i=0; i<details.sections.length; i++) {
				details.data[details.sections[i]].sort(this.sortByLevel);
			}
		
			rsSystem.EventBus.$emit("dialog-open", details);
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
			// TODO: Investigate adding equip controls to the list
			var details = {},
				items = [],
				added,
				types,
				item,
				i,
				j;

			details.title = this.entity.name;
			details.link = "/inventory/" + this.entity.id;
			details.component = "dndDialogList";
			details.entity = this.entity.id;
			details.sections = ["effects", "knowledges", "feats"];
			details.cards = {};
			details.limit = 20,
			details.data = {
				"none": []
			};
			details.cards.none = {
				"name": "No Type"
			};

			this.universe.transcribeInto(this.entity.inventory, items, "item");
			for(i=0; i<items.length; i++) {
				item = items[i];
				if(item && !item.disabled) {
					if(item.types && item.types.length) {
						added = false;
						types = [];
						this.universe.transcribeInto(item.types, types, "type");
						for(j=0; j<types.length; j++) {
							if(types[j].is_primary) {
								added = true;
								if(!details.cards[types[j].id]) {
									details.data[types[j].id] = [];
									details.cards[types[j].id] = {
										"name": types[j].name
									};
								}
								details.data[types[j].id].push(item);
							}
						}
						if(!added) {
							details.data.none.push(item);
						}
					} else {
						details.data.none.push(item);
					}
				}
			}

			details.sections = Object.keys(details.data);
			for(i=0; i<details.sections.length; i++) {
				details.data[details.sections[i]].sort(rsSystem.utility.sortData);
			}
			details.sections.splice(details.sections.indexOf("none"), 1);
			details.sections.sort();
			details.sections.push("none");

			rsSystem.EventBus.$emit("dialog-open", details);
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
