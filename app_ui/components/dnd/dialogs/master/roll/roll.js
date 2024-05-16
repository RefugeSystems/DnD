/**
 *
 *
 * @class dndMasterRollRequest
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 * @param {Object} details
 * @param {Array} details.entities Of Entity ID Strings
 */
rsSystem.component("dndMasterRollRequest", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore,
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"availableSkills": function () {
			var skills = {},
				entity,
				i,
				j;

			for(i=0; i<this.entities.length; i++) {
				entity = this.entities[i];
				if(entity.skills) {
					for(j=0; j<entity.skills.length; j++) {
						skills[entity.skills[j]] = true;
					}
				}
			}

			return this.universe.transcribe(Object.keys(skills));
		}
	},
	"data": function () {
		var data = {},
			i;

		data.building = {};
		data.filter = "";
		data.entities = this.details.entities || [];
		data.skill = this.details.skill || null;
		if(data.entities.length) {
			this.universe.transcribe(data.entities);
		}

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"choose": function(skill) {
			var entities = this.entities.map((entity) => entity.id);
			this.closeDialog();
			
			rsSystem.EventBus.$emit("master:collect", {
				"entities": entities,
				"skill": skill.id
			});

			this.universe.send("master:request:roll", {
				"entities": entities,
				"skill": skill.id
			});
		},
		"getSkillInfoClass": function(skill) {
			switch(skill.stat) {
				case "strength": return "light-red";
				case "dexterity": return "light-red";
				case "constitution": return "light-red";
				case "intelligence": return "light-blue";
				case "wisdom": return "light-blue";
				case "charisma": return "light-blue";
				default: return "light-gray";
			}
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/master/roll.html")
});
