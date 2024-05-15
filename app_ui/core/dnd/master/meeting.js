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
 * @param {String} data.skill The ID of the skill to request
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
