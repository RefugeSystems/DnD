(function() {
	rsSystem.dnd = rsSystem.dnd || {};
	var buffer,
		i;

	rsSystem.dnd.dice = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];
	
	buffer = ["d20", "d12", "d10", "d8", "d6", "d4"];
	rsSystem.dnd.diceDefinitions = [{
		"icon": "fa-duotone fa-dice-d10",
		"name": "d100",
		"id": "d100",
		"sides": 100
	}];
	for(i=0; i<buffer.length; i++) {
		rsSystem.dnd.diceDefinitions.unshift({
			"icon": "fa-solid fa-dice-" + buffer[i],
			"name": buffer[i],
			"id": buffer[i],
			"sides": parseInt(buffer[i].substring(1))
		});
	}
})();
