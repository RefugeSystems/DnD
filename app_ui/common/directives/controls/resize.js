/**
 * Watches the element for size changes (Such as flex adjustments or window resizing)
 * and invokes the called function with the event on such changes.
 * @class resize
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("resize", {
	"bind": function(el, binding) {
		if(typeof(binding.value) === "function") {
			var fire = function() {
				binding.value();
			};

			new ResizeObserver(fire).observe(el);
		}
	}
});
