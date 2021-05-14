/**
 * 
 * @class enter
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("enter", {
	"bind": function(el, binding) {
		if(typeof(binding.value) === "function") {
			var save = function(event) {
				if(event.code === "Enter") {
					binding.value();
					event.preventDefault();
					return false;
				}
			};
			
			var skip = function(event) {
				if(event.code === "Enter") {
					event.preventDefault();
					return false;
				}
			};
			
			$(el).keypress(skip);
			$(el).keydown(skip);
			$(el).keyup(save);
		}
	}
});
