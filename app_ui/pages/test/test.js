
/**
 *
 *
 * @class RSTestPage
 * @constructor
 * @module Pages
 */
(function() {


	rsSystem.component("RSTestPage", {
		"inherit": true,
		"mixins": [
		],
		"props": {
		},
		"data": function() {
			var data = {};


			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
		},
		"methods": {
			"leftSwipe": function($event) {
				console.log("Left Swipe: ", $event);
			},
			"rightSwipe": function($event) {
				console.log("Right Swipe: ", $event);
			},
			"upSwipe": function($event) {
				console.log("Up Swipe: ", $event);
			},
			"downSwipe": function($event) {
				console.log("Down Swipe: ", $event);
			},
			"pinch": function($event) {
				console.log("Pinched: ", $event);
			}
		},
		"beforeDestroy": function() {

		},
		"template": Vue.templified("pages/test.html")
	});
})();
