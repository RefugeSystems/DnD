/**
 * 
 * @class focus
 * @module Common
 * @submodule Directives
 */
Vue.directive("focus", {
	"bind": function(el, binding) {
		setTimeout(function() {
			el.focus();
		}, 10);
	}
});
