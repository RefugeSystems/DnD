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
				bound = {},
				check;

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
			check = function(event) {
				if(binding.modifiers.stop) {
					event.stopPropagation();
					event.preventDefault();
				}
			};

			bound.move = function(e) {
				// console.log(" - Mousescroll Directive[" + bound.id + "] Movement Check! - " + bound.isDown, bound);
				if(bound.isDown) {
					// console.log(" - Mousescroll Directive[" + bound.id + "] Movement");
					e.preventDefault();
					var x = e.pageX - bound.element.offsetLeft,
						y = e.pageY - bound.element.offsetTop,
						walkX = (x - bound.startX) * 1, // Change this number to adjust the scroll speed
						walkY = (y - bound.startY) * 1, // Change this number to adjust the scroll speed
						dispatch;

					if(binding.modifiers.reverse) {
						walkX = -1 * (walkX || 0);
						walkY = -1 * (walkY || 0);
					}

					if(binding.modifiers.horizontal) {
						if(walkX) {
							bound.element.scrollLeft = bound.scrollLeft - walkX;
						}
						if(walkY) {
							// start new mouse event for vertical scroll
							dispatch = new MouseEvent("mousescroll-vertical", {
								"bubbles": true,
								"cancelable": true,
								"deltaY": walkY
							});
						}
					} else if(binding.modifiers.vertical) {
						if(walkX) {
							// start new mouse event for horizontal scroll
							dispatch = new MouseEvent("mousescroll-horizontal", {
								"bubbles": true,
								"cancelable": true,
								"deltaX": walkX
							});
						}
						if(walkY) {
							bound.element.scrollTop = bound.scrollTop - walkY;
						}
					} else {
						bound.element.scrollLeft = bound.scrollLeft - walkX;
						bound.element.scrollTop = bound.scrollTop - walkY;
					}
				}
			};

			bound.horizontal = function(e) {
				// console.log("Horizontal Scroll: ", e.deltaX);
				bound.element.scrollLeft = bound.scrollLeft - e.deltaX;
			};

			bound.vertical = function(e) {
				// console.log("Vertical Scroll: ", e.deltaY);
				bound.element.scrollTop = bound.scrollTop - e.deltaY;
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

			bound.element.addEventListener("mousescroll-horiztonal", bound.horizontal);
			bound.element.addEventListener("mousescroll-vertical", bound.vertical);
			bound.element.addEventListener("mouseleave", bound.leave);
			bound.element.addEventListener("mousedown", bound.down);
			bound.element.addEventListener("mouseup", bound.up);
			document.addEventListener("mousemove", bound.move);
		},
		"unbind": function(el) {
			var bound = bindings[el.getAttribute("data-mousescroll")];
			// console.log(" - Mousescroll Directive Unbinding: ", bound, "\nA: ", el);
			bound.element.removeEventListener("mousescroll-horiztonal", bound.horizontal);
			bound.element.removeEventListener("mousescroll-vertical", bound.vertical);
			bound.element.removeEventListener("mouseleave", bound.leave);
			bound.element.removeEventListener("mousedown", bound.down);
			bound.element.removeEventListener("mouseup", bound.up);
			document.removeEventListener("mousemove", bound.move);
			delete(bindings[bound.id]);
		}
	});
})();
