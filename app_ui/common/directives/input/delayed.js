/**
 * Designed for input elements, delays the value set.
 * 
 * The expression used must be a direct reference to a value inside the
 * component as the expression is used to set the value in this binding's
 * context for ease of use. Using variables for reference in the expression
 * isn't supported; ie. v-delayed='root[myKey.field]' will not work.
 * 
 * To facilitate feedback during the delay, a class of "buffering" is added
 * to the element.
 * @class delayed
 * @module Common
 * @submodule Directives
 * @param {Number} [delay] Setting the new value. Defaults to 500ms.
 */
Vue.directive("delayed", {
	"bind": function(el, binding, vnode) {
		var delay = parseInt(binding.arg) || 500,
			path = binding.expression.split("."),
			root = vnode.context,
			field = path.pop(),
			timeout = null,
			update = 0,
			process,
			i;

		for(i=0; i<path.length; i++) {
			root = root[path[i]];
		}

		vnode.context.$watch(binding.expression, function(newValue) {
			if(!timeout && el.value !== newValue) {
				el.value = newValue;
			} else {
				// console.warn("New Value blocked for changes: ", this);
				// Fires naturally on update as the set value attempts to come back
			}
		});

		el.classList.add("delayed-input");
		el.value = binding.value;
		process = function() {
			if(Date.now() > update) {
				el.classList.remove("buffering");
				if(binding.modifiers.lower) {
					Vue.set(root, field, el.value.toLowerCase());
				} else {
					Vue.set(root, field, el.value);
				}
				timeout = null;
			} else {
				timeout = setTimeout(process, delay);
			}
		};

		el.onkeydown = function(event) {
			if(event.code === "Enter") {
				if(timeout) {
					clearTimeout(timeout);
					update = 0;
					process();
				}
			} else {
				update = Date.now() + delay;
				if(timeout === null) {
					timeout = setTimeout(process, delay);
					el.classList.add("buffering");
				}
			}
		};
	}
});
