
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
		"toggleHide": function(feat) {
			Vue.set(this.storage.hide, feat.id, !this.storage.hide[feat.id]);
		},
		"toggleHidden": function() {
			Vue.set(this.storage, "show_hidden", !this.storage.show_hidden);
		},
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
