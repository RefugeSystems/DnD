/**
 * Watches the element for size changes (Such as flex adjustments or window resizing)
 * and sets the max height to the elements height with an overflow value.
 * 
 * Calls a passed functinon if one is provided.
 * @class lockto
 * @module Common
 * @submodule Directives
 * @deprecated Infinite loop may comeback to this
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("lockto", {
	"bind": function(el, binding) {
		// var fire = function() {
		// 	var height = el.clientHeight;
		// 	el.style = el.style.cssText + ";max-height: " + height + "px;";
		// 	if(typeof(binding.value) === "function") {
		// 		binding.value();
		// 	}
		// };
		// new ResizeObserver(fire).observe(el);
	}
});