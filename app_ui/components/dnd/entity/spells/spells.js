
/**
 *
 *
 * @class dndEntitySpells
 * @extends DNDWidgetCore
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntitySpells", {
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
		"spells": function() {
			return this.universe.transcribeInto(this.entity.spells, [], "spell", this.storage?this.storage.filter:null);
		},
		"slots": function() {
			var keys = Object.keys(this.entity.spell_slot_max),
				slots = [],
				i;

			for(i=0; i<keys.length; i++) {
				slots.push(keys[i]);
			}

			slots.sort();
			return slots;
		},
		"styleSpellList": function() {
			if(this.widget && this.widget.attribute && this.widget.attribute.spell_list_height) {
				return "max-height: " + this.widget.attribute.spell_list_height;
			}
			return "max-height: 250px";
		},
		"styleTypeList": function() {
			if(this.widget && this.widget.attribute && this.widget.attribute.type_list_height) {
				return "max-height: " + this.widget.attribute.type_list_height;
			}
			return "max-height: 100px";
		}
	},
	"data": function() {
		var data = {},
			i;

		data.sizes = [{
			"id": "1",
			"name": "Simple",
			"icon": "fad fa-newspaper rs-transparent rs-secondary-solid rs-secondary-white",
			"properties": ["name", "level", "concentration"]
		}, {
			"id": "3",
			"name": "Stats",
			"icon": "game-icon game-icon-scroll-unfurled",
			"properties": ["name", "level", "concentration", "range", "components"]
		}, {
			"id": "5",
			"name": "card",
			"icon": "game-icon game-icon-scroll-quill",
			"properties": ["name", "level", "concentration", "save", "components", "school", "range", "damage"]
		}];

		data.index = {};
		for(i=0; i<data.sizes.length; i++) {
			data.index[data.sizes[i].id] = data.sizes[i];
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(this.storage && !this.storage.size) {
			Vue.set(this.storage, "size", "simple");
		}
		if(this.storage && !this.storage.slot) {
			Vue.set(this.storage, "slot", "1");
		}
	},
	"methods": {
		"toggleList": function() {
			Vue.set(this.storage, "collapsed", !this.storage.collapsed);
		},
		"setSize": function(size) {
			Vue.set(this.storage, "size", size.id);
		},
		"getSlotClass": function(slot) {
			var classes = "";
			if(this.storage.slot === slot) {
				return "active-slot";
			}
			return classes;
		},
		"getSlotIcon": function(slot) {
			var available = this.slotAvailable(slot);
			if(available > 0) {
				if(this.storage.slot === slot) {
					return "fad fa-bolt rs-light-blue rs-secondary-solid rs-secondary-orange";
				} else {
					return "fas fa-bolt rs-light-blue";
				}
			} else {
				return "fas fa-ban rs-light-red";
			}
		},
		"getSlotTitle": function(slot) {
			var available = this.slotAvailable(slot);
			if(available > 0) {
				if(this.storage.slot === slot) {
					return "Currently Casting at this Level";
				} else {
					return "Slots Available";
				}
			} else {
				return "No Slots Available";
			}
		},
		"slotAvailable": function(slot) {
			if(this.entity.spell_slots) {
				return parseInt(this.entity.spell_slots[slot]) || 0;
			}
			return 0;
		},
		"slotMax": function(slot) {
			if(this.entity.spell_slot_max) {
				return this.entity.spell_slot_max[slot] || 0;
			}
			return 0;
		},
		"typeName": function(type) {
			var object = this.universe.index.type[type];
			if(object) {
				return object.name;
			}
			return type;
		},
		"saveName": function(save) {
			var object = this.universe.index.skill[save];
			if(object) {
				return object.name;
			}
			return save;
		},
		"spellRange": function(spell) {
			if(spell.range_normal) {
				return spell.range_normal;
			}
			return "Touch";
		},
		"damageIcon": function(damage) {
			damage = this.universe.index.damage_type[damage];
			if(damage) {
				return damage.icon || "fas fa-cube";
			}
			return "fas fa-cube";
		},
		"cast": function(spell) {
			var available = this.slotAvailable(this.storage.slot);
			console.log("Cast: ", available, spell);
			if(available > 0) {
				console.log("Cast[" + this.storage.slot + "]: " + spell.id, spell);
				this.castSpell(this.storage.slot, spell);
			}
		},
		"use": function(slot) {
			Vue.set(this.storage, "slot", slot);
		}
	},
	"beforeDestroy": function() {

	},
	"template": Vue.templified("components/dnd/entity/spells.html")
});
