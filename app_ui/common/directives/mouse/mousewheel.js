/**
 * 
 * @class wheel
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the mouse wheel event
 */
Vue.directive("wheel", {
	"bind": function(el, binding) {
		// console.log("Wheel Binding: ", binding);
		if (typeof(binding.value) === "function") {
			if(binding.modifiers.passive) {

				
				el.addEventListener("mousewheel", binding.value, {"passive": true});
			} else {


				el.addEventListener("mousewheel", binding.value);
			}
		}
	}
});
