/**
 * 
 * @class save
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("save", {
	"bind": function(el, binding) {
		if(typeof(binding.value) === "function") {
			var save = function(event) {
				if(event.ctrlKey && event.code === "KeyS") {
//					console.warn("Saving");
					binding.value();
					event.preventDefault();
					return false;
				}
			};
			
			var skip = function(event) {
				if(event.ctrlKey && event.code === "KeyS") {
//					console.warn("Skipped");
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
