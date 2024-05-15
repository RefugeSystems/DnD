rsSystem.commands = (function() {
	var commandStructure = {},
		available = {},
		targeted = {},
		assist = {},
		index = {},
		bind;

	available = {};
	available.character = [{
		"name": "Character Info",
		"id": "character:info",
		"section": "character",
		"type": "keybind"
	}, {
		"name": "Character Attack",
		"id": "character:attack",
		"section": "character",
		"type": "keybind"
	}];
	available.knowledge = [];
	available.inventory = [];
	available.actionbar = [];
	available.system = [{
		"name": "Menu",
		"id": "system:menu",
		"section": "system",
		"type": "keybind"
	}, {
		"name": "Help",
		"id": "system:help",
		"section": "system",
		"type": "keybind"
	}];
	available.combat = [];
	available.master = [];

	rsSystem.addInitialization(function() {
		var sections = Object.keys(available),
			section,
			command,
			i,
			j;

		for(i=0; i<sections.length; i++) {
			section = available[sections[i]];
			for(j=0; j<section.length; j++) {
				command = section[j];
				index[command.id] = command;
				if(command.execute) {
					rsSystem.keyboard.$on(command.id, command.execute);
				}
			}
		}

		bind = true;
	});

	commandStructure.register = function(command) {
		index[command.id] = command;
		available[command.section || "system"].push(command);
		if(!command.type) {
			command.type = "keybind";
		}

		if(command.execute && bind) {
			rsSystem.keyboard.$on(command.id, command.execute);
		}
	};

	commandStructure.toggleTarget = function(target) {
		if(target) {
			target = typeof(target) === "string"?target:target.id;
			// Vue.set(targeted, target, !targeted[target]);
			targeted[target] = !targeted[target];
		}
	};

	commandStructure.isTargeted = function(target) {
		return targeted[target];
	};

	commandStructure.getTargets = function() {
		return Object.keys(targeted).filter(assist.isTargeted);
	};

	commandStructure.getSections = function() {
		return Object.keys(available);
	};

	commandStructure.getAvailable = function(section) {
		return available[section];
	};


	assist.isTargeted = function(target) {
		return targeted[target];
	};

	return commandStructure;
})();
