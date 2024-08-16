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
			rsSystem.EventBus.$emit("execution:targets:toggled", target);
			rsSystem.EventBus.$emit("targets:changed");
			if(targeted[target]) {
				rsSystem.EventBus.$emit("execution:targets:selected", target);
			} else {
				rsSystem.EventBus.$emit("execution:targets:unselected", target);
			}
		}
	};

	commandStructure.unselectTarget = function(target) {
		if(target) {
			target = typeof(target) === "string"?target:target.id;
			// Vue.set(targeted, target, !targeted[target]);
			if(targeted[target]) {
				targeted[target] = false;
				rsSystem.EventBus.$emit("execution:targets:unselected", target);
				rsSystem.EventBus.$emit("targets:changed");
			}
		}
	};

	commandStructure.selectTarget = function(target) {
		if(target) {
			target = typeof(target) === "string"?target:target.id;
			// Vue.set(targeted, target, !targeted[target]);
			if(!targeted[target]) {
				targeted[target] = true;
				rsSystem.EventBus.$emit("execution:targets:selected", target);
				rsSystem.EventBus.$emit("targets:changed");
			}
		}
	};

	commandStructure.isTargeted = function(target) {
		return targeted[target];
	};

	commandStructure.getTargets = function() {
		return Object.keys(targeted).filter(assist.isTargeted);
	};

	commandStructure.clearTargets = function() {
		var keys = Object.keys(targeted),
			i;
		for(i=0; i<keys.length; i++) {
			targeted[keys[i]] = false;
		}
		rsSystem.EventBus.$emit("execution:targets:cleared");
		rsSystem.EventBus.$emit("targets:changed");
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
