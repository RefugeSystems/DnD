
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
			if(this.inside) {
				return this.universe.index.location[this.inside.location];
			}
			return this.universe.index.location[this.entity.location];
		},
		"inside": function() {
			return this.universe.get(this.entity.inside);
		},
		"totalProficiencies": function() {
			return this.proficientSkills.length + this.proficientTools.length;
		},
		"proficientSkills": function() {
			var proficiencies = [],
				track = {},
				skills,
				prf,
				i;
			if(this.entity.skill_proficiency) {
				skills = Object.keys(this.entity.skill_proficiency);
				for(i=0; i<skills.length; i++) {
					if(!track[skills[i]] && this.entity.skill_proficiency[skills[i]] != 0) {
						track[skills[i]] = true;
						prf = this.universe.index.skill[skills[i]];
						proficiencies.push(prf);
					}
				}
			}
			if(this.proficiencyDetails.data) {
				Vue.set(this.proficiencyDetails.data, "skills", proficiencies);
			}
			return proficiencies;
		},
		"proficientTools": function() {
			var proficiencies = [],
				track = {},
				skills,
				prf,
				i;
			if(this.entity.proficiencies) {
				for(i=0; i<this.entity.proficiencies.length; i++) {
					if(!track[this.entity.proficiencies[i]]) {
						track[this.entity.proficiencies[i]] = true;
						prf = this.universe.index.proficiency[this.entity.proficiencies[i]];
						if(prf && prf.id.indexOf("language") === -1) {
							proficiencies.push(prf);
						}
					}
				}
			}
			if(this.proficiencyDetails.data) {
				Vue.set(this.proficiencyDetails.data, "tools", proficiencies);
			}
			return proficiencies;
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
		var data = {},
			entity,
			i;

		data.shortRest = "action:rest:short";
		if(this.entity.actions && this.entity.actions.indexOf("action:rest:trance") === -1) {
			data.longRestIcon = "fas fa-bed";
			data.longRest = "action:rest:long";
		} else {
			data.longRestIcon = "game-icon game-icon-meditation";
			data.longRest = "action:rest:trance";
		}

		data.proficiencyDetails = {};
		data.contained = {};
		data.creations = {};

		for(i=0; i<this.universe.listing.entity.length; i++) {
			entity = this.universe.listing.entity[i];
			if(rsSystem.utility.isValid(entity)) {
				if(entity.inside === this.entity.id) {
					data.contained[entity.id] = entity;
				}
				if(entity.creator === this.entity.id) {
					data.creations[entity.id] = entity;
				}
			}
		}

		for(i=0; i<this.universe.listing.item.length; i++) {
			entity = this.universe.listing.item[i];
			if(rsSystem.utility.isValid(entity) && entity.creator === this.entity.id) {
				data.creations[entity.id] = entity;
			}
		}

		data.proficiencyDetails.title = this.entity.name + " Proficiencies";
		data.proficiencyDetails.sections = ["skills", "tools"];
		data.proficiencyDetails.related = {};
		data.proficiencyDetails.cards = {
			"skills": {
				"name": "Skills",
				"icon": "fa-regular fa-universal-access",
				"description": "Activities at which you are proicient."
			},
			"tools": {
				"name": "Tools",
				"icon": "fa-regular fa-screwdriver-wrench",
				"description": "Tools with which you are proficient."
			}
		};
		data.proficiencyDetails.data = {
			"skills": this.proficientSkills,
			"tools": this.proficientTools
		};

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
		/**
		 * 
		 * @method isEmpty
		 * @param {Object} object 
		 * @returns {Boolean} True if an object exists and has no elements.
		 */
		"isEmpty": function(object) {
			return rsSystem.utility.isEmpty(object);
		},
		"trackUpdates": function(updated) {
			if(rsSystem.utility.isValid(updated)) {
				if(this.contained[updated.id] && updated.inside !== this.entity.id) {
					Vue.delete(this.contained, updated.id);
				} else if(!this.contained[updated.id] && updated.inside === this.entity.id) {
					Vue.set(this.contained, updated.id, updated);
				}
				if(this.creations[updated.id] && updated.creator !== this.entity.id) {
					Vue.delete(this.creations, updated.id);
				} else if(!this.creations[updated.id] && updated.creator === this.entity.id) {
					Vue.set(this.creations, updated.id, updated);
				}
			}
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
