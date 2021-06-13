
/**
 *
 *
 * @class rsAutocomplete
 * @constructor
 * @module Components
 * @param {Object} root The object to which the value should be modeled back
 * @param {Array} corpus The array of Strings on which autocompletion shouold recommend
 * @param {String} key The key for
 */
(function() {
	var storageKey = "_rs_autocompleteComponentKey";

	rsSystem.component("rsAutocomplete", {
		"inherit": true,
		"mixins": [

		],
		"props": {
			"value": {
				"required": true
			},
			"corpus": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};

			data.modeling = this.value;
			data.activeCompletion = null;
			data.reference_value = "";
			data.completions = [];

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
		},
		"watch": {
			"modeling": function(ol, nv) {
				console.log("Auto: " + ol + " -> " + nv);
			}
		},
		"methods": {
			"inputReceived": function() {
				this.$emit("input", this.modeling);
			}
		},
		"template": Vue.templified("components/data/field/autocomplete.html")
	});
})();
