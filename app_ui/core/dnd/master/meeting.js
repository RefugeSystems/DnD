/**
 * 
 * @event command:gold:distribute
 * @param {Object} [data] Optional data object
 * @param {Number} data.amount
 * @param {Boolean} data.split
 * @param {Array} data.entities
 */
rsSystem.commands.register({
	"name": "Distribute Gold to Party",
	"id": "command:gold:distribute",
	"section": "master",
	"execute": function(data) {
		rsSystem.EventBus.$emit("dialog-open", {
			"component": "dndDistributeGold",
			"entities": data?data.entities || rsSystem.commands.getTargets():rsSystem.commands.getTargets(),
			"amount": data?data.amount:undefined,
			"split": data?data.split:undefined
		});
	}
});

/**
 * 
 * @event command:skill:request
 * @param {Object} [data] Optional data object
 * @param {String} data.skill The ID of the skill to request
 * @param {Array} data.entities
 */
rsSystem.commands.register({
	"name": "Send Skill Request",
	"id": "command:skill:request",
	"section": "master",
	"execute": function(data) {
		rsSystem.EventBus.$emit("dialog-open", {
			"component": "dndMasterRollRequest",
			"entities": data?data.entities || rsSystem.commands.getTargets():rsSystem.commands.getTargets(),
			"skill": data?data.skill:undefined
		});
	}
});

/**
 * 
 * @event command:master:thinking
 * @param {Object} [data] Optional data object
 * @param {Array} data.entities
 */
rsSystem.commands.register({
	"name": "Master Thinking Broadcast",
	"id": "command:master:thinking",
	"section": "master",
	"execute": function(data) {
		rsSystem.universe.send("master:thinking", {});
	}
});

/**
 * 
 * @event command:master:selection:party
 * @param {Object} [data] Optional data object
 * @param {Array} data.entities
 */
rsSystem.commands.register({
	"name": "Master Select: Party",
	"id": "command:master:selection:party",
	"section": "master",
	"execute": function(data) {
		rsSystem.utility.selectParty();
	}
});

/**
 * 
 * @event command:master:selection:party
 * @param {Object} [data] Optional data object
 * @param {Array} data.entities
 */
rsSystem.commands.register({
	"name": "Master Select: Clear",
	"id": "command:master:selection:clear",
	"section": "master",
	"execute": function(data) {
		rsSystem.commands.clearTargets();
	}
});

/**
 * 
 * @event command:master:check:perception
 * @param {Object} [data] Optional data object
 * @param {String} data.skill The ID of the skill to request
 * @param {Array} data.entities
 */
rsSystem.commands.register({
	"name": "Master Skill Check: Perception",
	"id": "command:master:check:perception",
	"section": "master",
	"execute": function(data = {}) {
		var entities = rsSystem.commands.getTargets(),
			skill = data.skill || "skill:perception";

		if(typeof(skill) === "string"){
			skill = rsSystem.universe.index.skill[skill];
		}

		if(skill) {
			rsSystem.EventBus.$emit("master:collect", {
				"entities": entities,
				"skill": skill.id
			});

			this.universe.send("master:request:roll", {
				"entities": entities,
				"skill": skill.id
			});
		} else {
			console.warn("Invalid Skill: ", data.skill, "\nFound: ", skill);
		}
	}
});

/**
 * 
 * @event command:master:check:investigation
 * @param {Object} [data] Optional data object
 * @param {String} data.skill The ID of the skill to request
 * @param {Array} data.entities
 */
rsSystem.commands.register({
	"name": "Master Skill Check: Investigation",
	"id": "command:master:check:investigation",
	"section": "master",
	"execute": function(data = {}) {
		var entities = rsSystem.commands.getTargets(),
			skill = data.skill || "skill:investigation";

		if(typeof(skill) === "string"){
			skill = rsSystem.universe.index.skill[skill];
		}

		if(skill) {
			rsSystem.EventBus.$emit("master:collect", {
				"entities": entities,
				"skill": skill.id
			});

			this.universe.send("master:request:roll", {
				"entities": entities,
				"skill": skill.id
			});
		} else {
			console.warn("Invalid Skill: ", data.skill, "\nFound: ", skill);
		}
	}
});
