
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
				return equipment;
			} else {
				return {
					"hidden": [],
					"shown": []
				};
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
	},
	"methods": {
		"hoveredItem": function(item) {
			this.$emit("hovered-object", item);
		},
		"toggleHide": function(feat) {
			Vue.set(this.storage.hide, feat.id, !this.storage.hide[feat.id]);
		},
		"toggleHidden": function() {
			Vue.set(this.storage, "show_hidden", !this.storage.show_hidden);
		},
		"use": function(item) {
			if(item.is_melee || item.is_ranged || item.melee || item.ranged) {
				this.takeAction(this.universe.index.action["action:main:attack"], item, [item.damage]);
			} else {
				this.open(item);
			}
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
