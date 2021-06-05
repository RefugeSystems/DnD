
rsSystem.components = rsSystem.components || {};
rsSystem.component_classifications = {};
rsSystem.component = function(name, definition, classification) {
	if(rsSystem.components[name]) {
		console.warn("Component Already Registered? ", name, definition);
	}
	try {
		rsSystem.components[name] = Vue.component(name, definition);
	} catch(exception) {
		console.error("Failed to load Component[" + name + "]: ", definition, exception);
	}
};
