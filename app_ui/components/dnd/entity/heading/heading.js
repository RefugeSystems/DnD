
/**
 * Simple naming bar meant to label entities a player does not know.
 * @class dndEntityHeading
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityHeading", {
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
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"shop": function() {
			if(this.player.attribute) {
				var entity = this.universe.index.entity[this.player.attribute.playing_as];
				if(entity) {
					rsSystem.EventBus.$emit("dialog-open", {
						"component": "dndDialogShop",
						"entity": entity.id,
						"shop": this.entity.id
					});
				} else {
					console.warn("Player Character not found: " + this.player.attribute.playing_as);
				}
			} else {
				console.warn("Player has no attribute property from which to read character: ", this.player);
			}
		},
		"getHatColor": function() {
			return "rs-" + this.entity.color_flag;
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/heading.html")
});
