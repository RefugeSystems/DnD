
/**
 *
 *
 * @class DNDEntities
 * @constructor
 * @module Components
 */
rsSystem.component("DNDEntities", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"entities": function() {
			var entities = [],
				x;
				
			if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				entities.uniquely(this.universe.index.entity[this.player.attribute.playing_as]);
			}
			
			for(x=0; x<this.universe.listing.entity.length; x++) {
				if(this.universe.listing.entity[x].played_by === this.player.id && !this.universe.listing.entity[x].disabled && this.universe.listing.entity[x].state !== "deceased") {
					entities.uniquely(this.universe.listing.entity[x]);
				}
			}
			
			return entities;
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
		"createPlayer": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndCreateCharacterDialog",
				"storageKey": "createCharacterStorage",
				"id": "dndCreateCharacterDialog",
				"max_size": true
			});
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/entities.html")
});
