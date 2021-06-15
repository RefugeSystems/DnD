
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
				section,
				skills,
				skill,
				name,
				i;
			
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
					section.skills.push(skill);
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

		this.universe.$on("entity:roll", this.processRoll);
	},
	"methods": {
		"processRoll": function(event) {
		},
		"toggleSection": function(section) {
			Vue.set(this.storage, section, !this.storage[section]);
		},
		"getValue": function(skill) {
			var value = (this.entity[skill.stat] || 0) + (this.entity.skill_check[skill.id] || 0);
			if(value < 0) {
				return value;
			} else {
				return "+" + value;
			}
		},
		"rollSkill": function(skill) {

		}
	},
	"beforeDestroy": function() {
		this.universe.$off("entity:roll", this.processRoll);
	},
	"template": Vue.templified("components/dnd/entity/skills.html")
});
