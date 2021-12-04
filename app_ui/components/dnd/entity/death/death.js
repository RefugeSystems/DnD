
/**
 *
 *
 * @class dndEntityDeath
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityDeath", {
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

		data.send = {};
		data.send.entity = this.entity.id;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"isVisible": function() {
			return this.entity.effects.indexOf("effect:condition:stabilized") === -1 && this.entity.hp === 0;
		},
		"passSave": function() {
			this.universe.send("death:save", this.send);
		},
		"failSave": function() {
			this.universe.send("death:fail", this.send);
		},
		"unPass": function() {
			this.universe.send("death:unsave", this.send);
		},
		"unFail": function() {
			this.universe.send("death:unfail", this.send);
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/death.html")
});
