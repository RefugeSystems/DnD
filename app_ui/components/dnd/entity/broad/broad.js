
/**
 *
 *
 * @class dndEntityBroad
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityBroad", {
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
		},
		"longRestNote": function() {
			if(this.entity.last_rest) {
				return "Last long rest was " + this.displayTime(this.entity.last_rest) + " (" + this.universe.calendar.displayDuration(this.universe.time - this.entity.last_rest, true, false) + " ago)";
			}
			return "Your last long rest was sometime ago";
		},
		"bag_weight": function() {
			var bag_weight = 0,
				items,
				i;
	
			items = this.universe.transcribeInto(this.entity.inventory);
			for(i=0; i<items.length; i++) {
				bag_weight += items[i].weight;
			}
	
			return bag_weight.toFixed(2);
		},
		"meeting": function() {
			if(this.universe.index.setting["setting:meeting"]) {
				return this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value];
			}
			return null;
		},
		"weather": function() {
			if(this.meeting) {
				return this.universe.index.weather[this.meeting.weather];
			}
			return null;
		},
		"location": function() {
			return this.universe.index.location[this.entity.location];
		},
		"languages": function() {
			var languages = [],
				track = {},
				prf,
				i;
			if(this.entity.proficiencies) {
				for(i=0; i<this.entity.proficiencies.length; i++) {
					if(!track[this.entity.proficiencies[i]]) {
						track[this.entity.proficiencies[i]] = true;
						prf = this.universe.index.proficiency[this.entity.proficiencies[i]];
						if(prf && prf.id.indexOf("language") !== -1) {
							languages.push(prf);
						}
					}
				}
			}
			return languages;
		},
		"max_carry": function() {
			return this.entity.encumberance_max?this.entity.encumberance_max.toFixed(2):0;
		}
	},
	"data": function() {
		var data = {};

		data.shortRest = "action:rest:short";
		if(this.entity.actions && this.entity.actions.indexOf("action:rest:trance") === -1) {
			data.longRestIcon = "fas fa-bed";
			data.longRest = "action:rest:long";
		} else {
			data.longRestIcon = "game-icon game-icon-meditation";
			data.longRest = "action:rest:trance";
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"emitScrollNotice": function(marker) {
			this.$emit("scrollcon", marker);
		},
		"scrollHome": function() {
			this.$emit("scrollhome");
		},
		"getModifier": function(field) {
			if(0 <= this.entity[field]) {
				return "+" + this.entity[field];
			} else {
				return this.entity[field];
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/broad.html")
});
