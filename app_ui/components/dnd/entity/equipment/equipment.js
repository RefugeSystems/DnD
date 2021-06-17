
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
				var equipment = [],
					weapons = [],
					item,
					i;
				
				for(i=0; i<this.entity.equipped.length; i++) {
					item = this.universe.index.item[this.entity.equipped[i]];
					if(item) {
						if(item.melee || item.ranged || item.thrown) {
							weapons.push(item);
						} else {
							equipment.push(item);
						}
					}
				}

				return weapons.concat(equipment);
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
	},
	"methods": {
		"use": function(item) {
			console.log("Use: ", item);
			this.takeAction(this.universe.index.action["action:main:attack"], item, [item.damage]);
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
