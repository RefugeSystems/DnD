/**
 * 
 * @class wheel
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the mouse wheel event
 */
Vue.directive("wheel", {
	"bind": function(el, binding) {
		if (typeof(binding.value) === "function") {
			el.addEventListener("mousewheel", binding.value);
		}
	}
});
