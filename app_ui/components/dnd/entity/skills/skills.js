
/**
 *
 *
 * @class dndEntitySkills
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntitySkills", {
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
		"sections": function() {
			var sections = [],
				store = {},
				filter,
				section,
				skills,
				skill,
				name,
				i;
			
			if(this.storage.filter) {
				filter = this.storage.filter.toLowerCase();
			}

			for(i=0; i<this.entity.skills.length; i++) {
				skill = this.universe.index.skill[this.entity.skills[i]];
				if(!skill.disabled) {
					name = skill.section || "Uncategorized";
					if(store[name]) {
						section = store[name];
					} else {
						section = store[name] = {
							"id": name,
							"name": name,
							"skills": [],
							"ordering": 0
						};
						sections.push(section);
					}
					if(!filter || skill._search.indexOf(filter) !== -1) {
						section.skills.push(skill);
					}
					if(skill.ordering > section.ordering) {
						section.ordering = skill.ordering;
					}
				}
			}

			sections.sort(this.sortData);
			for(i=0; i<sections.length; i++) {
				section = sections[i];
				skills = section.skills;
				section.skills.sort(this.sortData);
				section.skills = [skills, skills.splice(skills.length/2)];
			}

			return sections;
		}
	},
	"data": function() {
		var data = {};

		data.rolled = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(!this.storage.rolled) {
			Vue.set(this.storage, "rolled", {});
		}

		this.universe.$on("entity:roll", this.processRoll);
	},
	"methods": {
		"processRoll": function(event) {
			// console.log("Process Roll: ", event);
			if(event.entity === this.entity.id) {
				Vue.set(this.storage.rolled, event.skill, event.result);
			}
		},
		"toggleSection": function(section) {
			Vue.set(this.storage, section, !this.storage[section]);
		},
		"getSkillIcon": function(skill) {
			var classes = skill.icon || "";

			if(this.entity.skill_advantage[skill.id] > 0) {
				classes += " has-advantage";
			} else if(this.entity.skill_advantage[skill.id] < 0) {
				classes += " has-disadvantage";
			}

			return classes;
		},
		"getValue": function(skill) {
			var value = this.entity.skill_check[skill.id] || 0;
			if(value < 0) {
				return value;
			} else {
				return "+" + value;
			}
		},
		"dismissRoll": function(skill) {
			Vue.set(this.storage.rolled, skill.id, null);
		},
		"rollSkill": function(skill) {
			Vue.set(this.storage.rolled, skill.id, null);
			this.performSkillCheck(skill);
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("entity:roll", this.processRoll);
	},
	"template": Vue.templified("components/dnd/entity/skills.html")
});
