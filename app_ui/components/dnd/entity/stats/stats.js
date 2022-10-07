
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
		"bag_weight": function() {
			var bag_weight = 0,
				items,
				i;
	
			items = this.universe.transcribeInto(this.entity.inventory);
			for(i=0; i<items.length; i++) {
				bag_weight += items[i].weight;
			}
	
			return bag_weight.toFixed(2);
		},
		"inside": function() {
			return this.universe.get(this.entity.inside);
		},
		"max_carry": function() {
			return this.entity.encumberance_max?this.entity.encumberance_max.toFixed(2):0;
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
		"hoverMovement": function(pass) {
			if(pass) {
				this.$emit("hovered-object", {
					"range_normal": this.entity.movement_ground
				});
			} else {
				this.$emit("hovered-object", null);
			}
		},
		"toggleMovementBoundry": function() {
			this.$emit("toggle-boundry", {
				"object": this.entity.id,
				"type": this.entity._class,
				"field": "movement_ground"
			});
		},
		/**
		 * Open the damage display to declare damage to something
		 * @method declareAttack
		 */
		"declareAttack": function() {
			var details = {},
				i,
				j;

			details.title = this.entity.name + " Actions";
			details.component = "dndDialogDamage";
			details.entity = this.entity;

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
			details.extra = "Spell Attack Bonus: " + (this.entity.spell_attack || 0) + " | Spell DC: " + (this.entity.spell_dc || 0);
			details.clear = true;
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
			details.clear = true;
			details.cards = {};
			details.limit = 20,
			details.extra = "Bag Weight: " + this.bag_weight + " / " + this.max_carry;
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
