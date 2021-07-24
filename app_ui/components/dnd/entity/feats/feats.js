
/**
 *
 *
 * @class dndEntityFeats
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityFeats", {
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
		"feats": function() {
			var feats = {},
				feat,
				i;

			feats.hidden = [];
			feats.shown = [];

			for(i=0; i<this.entity.feats.length; i++) {
				feat = this.universe.index.feat[this.entity.feats[i]];
				if(feat && !feat.obscured && !feat.is_obscured) {
					if(this.storage && this.storage.hide && this.storage.hide[feat.id]) {
						feats.hidden.push(feat);
					} else if(!feat.concealed) {
						feats.shown.push(feat);
					}
				}
			}

			return feats;
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
		"open": function(feat) {
			var details = {
				"component": "dndCard",
				"entity": this.entity.id,
				"object": feat,
				"bubbles": [
					"attuned",
					"armor",
					"damage_type",
					"dice_type",
					"dc",
					"range",
					"durability",
					"charges_max",
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
				"fieldComponent": {}
			};
			if(this.showCharges(feat)) {
				details.fieldComponent.charges_max = "dndObjectCharges";
			}
			rsSystem.EventBus.$emit("dialog-open", details);
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/feats.html")
});
