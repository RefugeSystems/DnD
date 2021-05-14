/**
 * 
 * @class filedrop
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the file event
 */
Vue.directive("filedrop", {
	"bind": function(el, binding) {
		if(typeof(binding.value) === "function") {
			var test = function(event) {
				event.preventDefault();
				console.warn("Drag: ", event);
				return false;
			};
			
			el.addEventListener("dragenter", function(event) {
				// Display Drop Overlay
				el.classList.add("overlay");
			});
			el.addEventListener("dragleave", function(event) {
				// Remove Drop Overlay
				el.classList.remove("overlay");
			});
			el.addEventListener("drop", function(event) {
				el.classList.remove("overlay");
				event.stopPropagation();
				event.preventDefault();
				
				binding.value(event.dataTransfer);
				
				return false;
			});
		}
	}
});
