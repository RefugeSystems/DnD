/**
 * Designed for input elements, delays the value set.
 * 
 * The expression used must be a direct reference to a value inside the
 * component as the expression is used to set the value in this binding's
 * context for ease of use. Using variables for reference in the expression
 * isn't supported; ie. v-delayed='root[myKey.field]' will not work.
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

		el.classList.add("delayed-input");
		el.value = binding.value;
		process = function() {
			if(Date.now() > update) {
				el.classList.remove("buffering");
				Vue.set(root, field, el.value.toLowerCase());
				timeout = null;
			} else {
				timeout = setTimeout(process, delay);
			}
		};

		el.onkeydown = function() {
			update = Date.now();
			if(timeout === null) {
				timeout = setTimeout(process, delay);
				el.classList.add("buffering");
			}
		};
	}
});
