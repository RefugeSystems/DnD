
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
		"main": function() {
			if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				return this.universe.index.entity[this.player.attribute.playing_as];
			}
			return null;
		},
		"entities": function() {
			var entities = [],
				entity,
				x;
				
			
			for(x=0; x<this.universe.listing.entity.length; x++) {
				entity = this.universe.listing.entity[x];
				if(entity.played_by === this.player.id && !entity.disabled && entity.state !== "deceased" && !entity.is_preview && !entity.obscured && !entity.is_minion && entity.id !== this.player.attribute.playing_as) {
					entities.uniquely(entity);
				}
			}
			
			return entities;
		},
		"minions": function() {
			var entities = [],
				entity,	
				x;
			
			for(x=0; x<this.universe.listing.entity.length; x++) {
				entity = this.universe.listing.entity[x];
				if((entity.played_by === this.player.id || (this.main && entity.loyal_to.indexOf(this.main.id) !== -1)) && !entity.is_preview && !entity.disabled && entity.state !== "deceased" && !entity.obscured && entity.is_minion) {
					entities.uniquely(entity);
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
