/**
 * 
 * @class swipe
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("swipe", {
	"bind": function(el, binding) {
		if (typeof binding.value === "function") {
			var mc = new Hammer(el),
				options = {};
			
			if(binding.modifiers.left) {
				options.direction = Hammer.DIRECTION_LEFT;
			} else if(binding.modifiers.right) {
				options.direction = Hammer.DIRECTION_RIGHT;
			} else if(binding.modifiers.up) {
				options.direction = Hammer.DIRECTION_UP;
			} else if(binding.modifiers.down) {
				options.direction = Hammer.DIRECTION_DOWN;
			}
			
			mc.get("swipe").set(options);
			mc.on("swipe", binding.value);
		}
	}
});
