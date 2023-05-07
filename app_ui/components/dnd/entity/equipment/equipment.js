/**
 *
 *
 * @class dndEntityEquipment
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityEquipment", {
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
		"mainhand": function() {
			return this.universe.index.item[this.entity.main_weapon];
		},
		"mainhandAmmo": function() {
			if(this.mainhand && this.mainhand.ammo) {
				return this.universe.index.item[this.mainhand.ammo];
			}
			return null;
		},
		"offhandAmmo": function() {
			var ammos = {},
				ammo,
				i;

			for(i=0; i<this.weapons.length; i++) {
				if(ammo = this.universe.index.item[this.weapons[i].ammo]) {
					ammos[this.weapons[i].id] = ammo;
				}
			}

			return ammos;
		},
		"ammoCounts": function() {
			var ammos = {},
				ammo,
				i;
			if(this.mainhandAmmo) {
				ammos[this.mainhandAmmo.id] = rsSystem.utility.getByParentID(this.mainhandAmmo.id, this.entity, ["inventory"]);
			}
			for(i=0; i<this.weapons.length; i++) {
				if(ammo = this.weapons[i].ammo) {
					ammos[ammo] = rsSystem.utility.getByParentID(ammo, this.entity, ["inventory"]);
				}
			}

			return ammos;
		},
		"weapons": function() {
			var weapons = [],
				item,
				i;
		
			for(i=0; i<this.entity.equipped.length; i++) {
				item = this.universe.index.item[this.entity.equipped[i]];
				if(item && (item.melee || item.ranged || item.thrown || item.is_weapon) && item.id !== this.entity.main_weapon) {
					weapons.push(item);
				}
			}

			return weapons;
		},
		"equipment": function() {
			if(this.entity.equipped && this.entity.equipped.length) {
				var equipment = {},
					weapons = [],
					item,
					i;
				
				equipment.hidden = [];
				equipment.shown = [];

				for(i=0; i<this.entity.equipped.length; i++) {
					item = this.universe.index.item[this.entity.equipped[i]];
					if(item && !item.melee && !item.ranged && !item.thrown && !item.is_weapon && item.id !== this.entity.main_weapon) {
						if(this.storage && this.storage.hide && this.storage.hide[item.id]) {
							equipment.shown.push(item);
						} else if(!item.concealed) {
							equipment.hidden.push(item);
						}
					}
				}

				/* No longer enforcing weapon show for general list
				for(i=0; i<this.entity.equipped.length; i++) {
					item = this.universe.index.item[this.entity.equipped[i]];
					if(item) {
						if(item.melee || item.ranged || item.thrown) {
							weapons.push(item);
						} else if(this.storage && this.storage.hide && this.storage.hide[item.id]) {
							equipment.shown.push(item);
						} else if(!item.concealed) {
							equipment.hidden.push(item);
						}
					}
				}

				equipment.shown = weapons.concat(equipment.shown);
				*/
				return equipment;
			} else {
				return {
					"hidden": [],
					"shown": []
				};
			}
		},
		"renderedHidden": function() {
			if(this.storage.show_hidden) {
				return this.equipment.hidden;
			} else {
				return [];
			}
		}
	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(!this.storage.hide) {
			Vue.set(this.storage, "hide", {});
		}
		if(this.storage.is_open === undefined) {
			Vue.set(this.storage, "is_open", true);
		}
	},
	"methods": {
		"getDamage": function(item) {
			var types = Object.keys(item.damage),
				roll,
				i;
			for(i=0; i<types.length; i++) {
				if(roll) {
					roll += " + " + item.damage[types[i]];
				} else {
					roll = item.damage[types[i]];
				}
			}
			if(roll) {
				return rsSystem.dnd.Calculator.reducedDiceRoll(roll.trim(), item);
			} else {
				return "0d0";
			}
		},
		"getDamageRange": function(item) {
			var field = this.universe.index.fields.range_normal,
				range = item.range_normal;

			if(field.attribute && field.attribute.cell_size) {
				range = range + "(" + (item.range_normal/field.attribute.cell_size).toFixed(0) + " Cells)";
			}
			
			if(item.range_minimum) {
				range = "(Min:" + item.range_minimum + ") " + range;
			}
			// if(item.range_maximum) {
			// 	range = range + " / " + item.range_maximum;
			// }

			return range;
		},
		"getDamageIcon": function(item) {
			var type = this.universe.get(item.damage_type);
			if(type) {
				return type.icon || "fa-solid fa-info-circle rs-yellow";
			}
			return "fa-solid fa-exclamation-triangle rs-red";
		},
		"getDamageType": function(item) {
			var type = this.universe.get(item.damage_type);
			if(type) {
				return type.name;
			}
			return "No Type";
		},
		"hoveredItem": function(item) {
			this.$emit("hovered-object", item);
		},
		"toggle": function() {
			Vue.set(this.storage, "is_open", !this.storage.is_open);
		},
		"toggleFormat": function() {
			Vue.set(this.storage, "is_view_list", !this.storage.is_view_list);
		},
		"toggleHide": function(item) {
			Vue.set(this.storage.hide, item.id, !this.storage.hide[item.id]);
			// Weapon isolation moved to fore-front
			// if(item.is_melee || item.is_ranged || item.melee || item.ranged) {
			// 	this.takeAction(this.universe.index.action["action:main:attack"], item, [item.damage]);
			// } else {
			// 	Vue.set(this.storage.hide, item.id, !this.storage.hide[item.id]);
			// }
		},
		"toggleHidden": function() {
			Vue.set(this.storage, "show_hidden", !this.storage.show_hidden);
		},
		"attack": function(weapon) {
			this.takeAction(this.universe.index.action["action:main:attack"], weapon, [weapon.damage]);
		},
		// TODO: Update for more accurate use of item instead?
		"use": function(item) {
			this.open(item);
		},
		"showCharges": function(object) {
			return typeof(object.charges_max) === "number" || typeof(object.charges_max) === "string";
		},
		"open": function(item) {
			this.info(item);

			// var details = {
			// 	"component": "dndCard",
			// 	"entity": this.entity.id,
			// 	"object": item,
			// 	"bubbles": [
			// 		"attuned",
			// 		"armor",
			// 		"damage_type",
			// 		"dice_type",
			// 		"dc",
			// 		"range",
			// 		"durability",
			// 		"charges_max",
			// 		"strength",
			// 		"dexterity",
			// 		"constitution",
			// 		"intelligence",
			// 		"wisdom",
			// 		"charisma",
			// 		"movement_ground",
			// 		"movement_walk" /* Future Proofing */ ,
			// 		"movement_fly",
			// 		"movement_swim",
			// 		"duration"],
			// 	"fields": [
			// 		"damage",
			// 		"resistance",
			// 		"advantage",
			// 		"disadvantage"],
			// 	"fieldComponent": {}
			// };
			// if(this.showCharges(item)) {
			// 	details.fieldComponent.charges_max = "dndObjectCharges";
			// }
			// rsSystem.EventBus.$emit("dialog-open", details);
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/equipment.html")
});
