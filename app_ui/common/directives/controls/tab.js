/**
 * 
 * @class tab
 * @module Common
 * @submodule Directives
 * @param {Function} handler The function to handle the pan event
 */
Vue.directive("tab", {
	"bind": function(el, binding) {
		var tab = function(event) {
			if(event.code === "Tab") {
				var hold = el.selectionStart;
				el.value = el.value.substring(0, hold) + "\t" + el.value.substring(el.selectionEnd);
				el.selectionStart = hold + 1;
				el.selectionEnd = hold + 1;
				event.preventDefault();
				return false;
			}
		};
		
		var skip = function(event) {
			if(event.code === "Tab") {
				event.preventDefault();
				return false;
			}
		};
		
		$(el).keypress(skip);
		$(el).keydown(skip);
		$(el).keyup(tab);
	}
});
