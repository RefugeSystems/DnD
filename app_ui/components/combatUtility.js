/**
 *
 *
 * @class DNDCombatUtility
 * @constructor
 * @module Components
 */
rsSystem.component("DNDCombatUtility", {
	"inherit": true,
	"mixins": [],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"skirmish": function() {
			var skirmish,
				i;
			for(i=0; i<this.universe.listing.skirmish.length; i++) {
				skirmish = this.universe.listing.skirmish[i];
				if(skirmish && !skirmish.is_preview && !skirmish.disabled && skirmish.is_active) {
					return skirmish;
				}
			}
			return null;
		}
	},
	"methods": {
		/**
		 * 
		 * @method endTurn
		 * @param {Object} [entity] Whose turn should be ended. Defaults to the components entity
		 * 		property.
		 * @param {Object} [skirmish] Optional, defaults to the utility's detected active skirmish.
		 */
		"endTurn": function(entity, skirmish) {
			skirmish = skirmish || this.skirmish;
			entity = entity || this.entity;
			if(skirmish && entity) {
				rsSystem.EventBus.$emit("dialog-open", {
					"component": "dndEndTurn",
					"entity": entity.id,
					"skirmish": this.skirmish.id
				});
			} else {
				console.warn("Can not end turn, missing data: ", {skirmish, entity, "component": this});
			}
		}
	}
});
