/**
 *
 *
 * @class DNDCharacters
 * @constructor
 * @module Components
 */
rsSystem.component("DNDCharacters", {
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
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"characters": function() {
			var characters = [],
				entity,
				i;

			for(i=0; i<this.universe.listing.entity.length; i++) {
				entity = this.universe.listing.entity[i];
				if(entity && entity.played_by === this.player.id && !entity.is_preview && !entity.preview && !entity.disabled && !entity.is_disabled) {
					characters.push(entity);
				}
			}

			return characters;
		}
	},
	"watch": {
	},
	"data": function() {
		var reference = this,
			data = {};

		

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("updated", this.checkUpdate);
	},
	"methods": {
		"assumeCharacter": function(character) {
			if(character.played_by === this.player.id || this.player.gm) {
				this.universe.send("entity:assume", {"entity": character.id});
			}
		},
		"createPlayer": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndCreateCharacterDialog",
				"storageKey": "createCharacterStorage",
				"id": "dndCreateCharacterDialog",
				"max_size": true
			});
		},
		"checkUpdate": function(event) {

		}
	},
	"beforeDestroy": function() {
		this.universe.$off("updated", this.checkUpdate);
	},
	"template": Vue.templified("pages/dnd/characters.html")
});
