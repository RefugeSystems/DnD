
/**
 *
 *
 * @class dndDisplayEquiped
 * @constructor
 * @module Components
 * @param {Object} entity Whose duration should be displayed
 * @param {Object} [universe] Specified to facilitate showing remaining duration.
 */
rsSystem.component("dndDisplayEquiped", {
	"inherit": true,
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"universe": {
			"type": Object
		}
	},
	"computed": {
		"attuned": function() {
			var attuned = [],
				item,
				i;
			for(i=0; i<this.universe.listing.item.length; i++) {
				item = this.universe.listing.item[i];
				if(item && item.attuned === this.entity.id && rsSystem.utility.isValid(item)) {
					attuned.push(item);
				}
			}
			return attuned;
		},
		"slots": function() {
			var result = [],
				islots,
				slots,
				slot,
				item,
				e,
				i;

			if(this.entity.equip_slots) {
				slots = Object.keys(this.entity.equip_slots);
				for(i=0; i<slots.length; i++) {
					slot = this.universe.index.slot[slots[i]];
					if(slot) {
						if(this.sloted[slot.id]) {
							this.sloted[slot.id].splice(0);
						} else {
							Vue.set(this.sloted, slot.id, []);
						}
						result.push(slot);
					}
				}
				result.sort(rsSystem.utility.sortByName);

				if(this.entity.equipped) {
					for(i=0; i<this.entity.equipped.length; i++) {
						item = this.universe.index.item[this.entity.equipped[i]];
						if(item && item.equip_slots) {
							islots = Object.keys(item.equip_slots);
							for(e=0; e<islots.length; e++) {
								this.sloted[islots[e]].push(item);
							}
						}
					}

					islots = Object.keys(this.sloted);
					for(i=0; i<islots.length; i++) {
						this.sloted[islots[i]].sort(rsSystem.utility.sortByName);
					}
				}
			}

			return result;
		}
	},
	"data": function() {
		var data = {};

		data.sloted = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		}
	},
	"template": Vue.templified("components/dnd/displays/equiped.html")
});
