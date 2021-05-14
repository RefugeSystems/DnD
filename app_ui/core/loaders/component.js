
rsSystem.components = rsSystem.components || {};
rsSystem.component_classifications = {};
rsSystem.component = function(name, definition, classification) {
	try {
		rsSystem.components[name] = Vue.component(name, definition);
	} catch(exception) {
		console.error("Failed to load Component[" + name + "]: ", definition, exception);
	}
};
