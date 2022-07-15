/**
 * 
 * @class linkable
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the file event
 */
Vue.directive("linkable", {
	"bind": function(el, binding) {
		el.setAttribute("draggable", "true");
		el.addEventListener("dragover", function(event) {
			event.preventDefault();
		});
		el.addEventListener("drag", function(event) {
			if(typeof(binding.value) === "function") {
				rsSystem.dragndrop.general.drag(binding.value());
			} else {
				rsSystem.dragndrop.general.drag(binding.value);
			}
			event.preventDefault();
		});
	}
});

Vue.directive("receivable", {
	"bind": function(el, binding) {
		el.addEventListener("drop", function(event) {
			if(typeof(binding.value) === "function") {
				binding.value(rsSystem.dragndrop.general.drop(), event);
			} else {
				console.warn("v-receivable received a non-function: ", el, binding);
			}
		});
	}
});
