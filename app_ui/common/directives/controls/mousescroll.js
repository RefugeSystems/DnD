/**
 * 
 * @class mousescroll
 * @module Common
 * @submodule Directives
 */
(function() {
	var bindings = {};

	Vue.directive("mousescroll", {
		"bind": function(el, binding) {
			if(rsSystem.universe.profile.disable_mousescroll) {
				return null;
			}
			
			var id = Random.string(32),
				bound = {};

			el.setAttribute("data-mousescroll", id);
			bindings[id] = bound;
			bound.id = id;

			bound.element = el;
			bound.isDown = false;
			bound.startX;
			bound.startY;
			bound.scrollLeft;
			bound.scrollTop;

			// console.log("Mousescroll Directive[" + id + "]:\n", binding);

			bound.move = function(e) {
				// console.log(" - Mousescroll Directive[" + bound.id + "] Movement Check! - " + bound.isDown, bound);
				if(bound.isDown) {
					// console.log(" - Mousescroll Directive[" + bound.id + "] Movement");
					e.preventDefault();
					var x = e.pageX - bound.element.offsetLeft;
					var y = e.pageY - bound.element.offsetTop;
					var walkX = (x - bound.startX) * 1; // Change this number to adjust the scroll speed
					var walkY = (y - bound.startY) * 1; // Change this number to adjust the scroll speed
					bound.element.scrollLeft = bound.scrollLeft - walkX;
					bound.element.scrollTop = bound.scrollTop - walkY;
				}
			};

			bound.down = function(e) {
				// console.log(" - Mousescroll Directive[" + bound.id + "] Down:\n", bound, "\n    > Event:\n", e);
				bound.isDown = true;
				bound.startX = e.pageX - bound.element.offsetLeft;
				bound.startY = e.pageY - bound.element.offsetTop;
				bound.scrollLeft = bound.element.scrollLeft;
				bound.scrollTop = bound.element.scrollTop;
				bound.element.style.cursor = "grabbing";
			};

			bound.leave = function(e) {
				// console.log(" - Mousescroll Directive[" + bound.id + "] Leave:\n", bound, "\n    > Event:\n", e);
				bound.isDown = false;
				bound.element.style.cursor = "grab";
			};

			bound.up = function(e) {
				// console.log(" - Mousescroll Directive[" + bound.id + "] Up:\n", bound, "\n    > Event:\n", e);
				bound.isDown = false;
				bound.element.style.cursor = "grab";
			};

			bound.element.addEventListener("mouseleave", bound.leave);
			bound.element.addEventListener("mousedown", bound.down);
			bound.element.addEventListener("mouseup", bound.up);
			document.addEventListener("mousemove", bound.move);
		},
		"unbind": function(el) {
			var bound = bindings[el.getAttribute("data-mousescroll")];
			console.log(" - Mousescroll Directive Unbinding: ", bound, "\nA: ", el);
			bound.element.removeEventListener("mouseleave", bound.leave);
			bound.element.removeEventListener("mousedown", bound.down);
			bound.element.removeEventListener("mouseup", bound.up);
			document.removeEventListener("mousemove", bound.move);
			delete(bindings[bound.id]);
		}
	});
})();
