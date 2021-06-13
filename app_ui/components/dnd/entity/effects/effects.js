
/**
 *
 *
 * @class dndEntityEffects
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityEffects", {
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
		"effects": function() {
			if(this.entity.effects && this.entity.effects.length) {
				var positive = [],
					negative = [],
					effect,
					i;
				
				for(i=0; i<this.entity.effects.length; i++) {
					effect = this.universe.index.effect[this.entity.effects[i]];
					if(effect) {
						if(effect.debuff) {
							negative.push(effect);
						} else {
							positive.push(effect);
						}
					}
				}

				return positive.concat(negative);
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
		"effectClasses": function(effect) {
			var classes = effect.icon || "game-icon game-icon-abstract-041";

			if(effect.debuff) {
				classes += " rs-lightred";
			}

			return classes;
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/effects.html")
});
