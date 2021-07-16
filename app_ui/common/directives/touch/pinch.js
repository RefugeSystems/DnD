/**
 * 
 * @class pinch
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("pinch", {
	"bind": function(el, binding) {
		if (typeof binding.value === "function") {
			var mc = new Hammer.Manager(el),
				pinch = new Hammer.Pinch(),
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
			
			// pinch.set(options);
			mc.add([pinch]);
			if(binding.modifiers.in) {
				mc.on("pinchin", function(event) {
					// event.stopPropagation();
					// event.preventDefault();
					if(binding.modifiers.prevent) {
						event.preventDefault();
					} else if(binding.modifiers.stop) {
						event.stopPropagation();
					}
					binding.value(event);
				});
			}
			if(binding.modifiers.out) {
				mc.on("pinchout", function(event) {
					// event.stopPropagation();
					// event.preventDefault();
					if(binding.modifiers.prevent) {
						event.preventDefault();
					} else if(binding.modifiers.stop) {
						event.stopPropagation();
					}
					binding.value(event);
				});
			}
		}
	}
});
