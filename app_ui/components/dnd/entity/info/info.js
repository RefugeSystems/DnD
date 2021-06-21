
/**
 *
 *
 * @class dndEntityInfo
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityInfo", {
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
		"totalHitDice": function() {
			var total = 0,
				keys,
				i;
			
			if(this.entity.hit_dice) {
				keys = Object.keys(this.entity.hit_dice);
				for(i=0; i<keys.length; i++) {
					total += (this.entity.hit_dice[keys[i]] || 0);
				}
			}

			return total;
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
		"takeDamage": function() {
			var rolling = {},
				action = this.universe.index.action["action:free:damage"],
				resist = Object.assign({}, this.entity.resistance),
				damage,
				i;

			/*
			for(i=0; i<this.universe.listing.damage_type.length; i++) {
				damage = this.universe.listing.damage_type[i];
				if(damage && !damage.disabled && !damage.is_preview) {
					rolling[damage.id] = "";
				}
				if(this.entity.resistance && this.entity.resistance[damage.id]) {
					resist[damage.id] = this.entity.resistance[damage.id];
				}
			}
			*/

			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"damage": rolling,
				"resist": resist,
				"action": action,
				"closeAfterAction": true
			});
		},
		"transferGold": function() {

		},
		"useHitDice": function() {

		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/info.html")
});
