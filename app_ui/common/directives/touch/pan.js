/**
 * 
 * @class pan
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("pan", {
	"bind": function(el, binding) {
		if (typeof(binding.value) === "function") {
			var mc = new Hammer(el);
			mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });
			mc.on("pan", binding.value);
		}
	}
});
