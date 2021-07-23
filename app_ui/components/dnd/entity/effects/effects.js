
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
					hidden = [],
					effect,
					i;
				
				for(i=0; i<this.entity.effects.length; i++) {
					effect = this.universe.index.effect[this.entity.effects[i]];
					if(effect && !effect.obscured && !effect.is_obscured) {
						if(this.storage && this.storage.hide && this.storage.hide[effect.id]) {
							hidden.push(effect);
						} else if(effect.debuff) {
							negative.push(effect);
						} else {
							positive.push(effect);
						}
					}
				}

				return {
					"shown": positive.concat(negative),
					"hidden": hidden
				};
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
		"open": function(effect) {
			var details = {
				"component": "dndCard",
				"entity": this.entity.id,
				"object": effect,
				"bubbles": [
					"attuned",
					"armor",
					"damage_type",
					"dice_type",
					"dc",
					"range",
					"durability",
					"charges",
					"strength",
					"dexterity",
					"constitution",
					"intelligence",
					"wisdom",
					"charisma",
					"movement_ground",
					"movement_walk" /* Future Proofing */ ,
					"movement_fly",
					"movement_swim",
					"duration"],
				"fields": [
					"damage",
					"resistance",
					"advantage",
					"disadvantage"],
				"fieldComponent": {
					"duration": "dndObjectDuration"
				}
			};
			rsSystem.EventBus.$emit("dialog-open", details);
		},
		"toggleHide": function(feat) {
			Vue.set(this.storage.hide, feat.id, !this.storage.hide[feat.id]);
		},
		"toggleHidden": function() {
			Vue.set(this.storage, "show_hidden", !this.storage.show_hidden);
		},
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
