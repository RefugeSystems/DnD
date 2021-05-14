
/**
 *
 *
 * @class RSNetworking
 * @constructor
 * @module Pages
 */
(function() {
	var loginSKey = "_rs_connectComponentKey";

	rsSystem.component("RSNetworking", {
		"inherit": true,
		"mixins": [

		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			},
			"player": {
				"required": true,
				"type": Object
			},
			"user": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};


			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
		},
		"methods": {

		},
		"beforeDestroy": function() {

		},
		"template": Vue.templified("pages/networking.html")
	});
})();
