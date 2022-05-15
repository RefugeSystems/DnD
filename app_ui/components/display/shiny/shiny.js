
/**
 *
 *
 * @class rsShinyButton
 * @constructor
 * @module Components
 * @param {Boolean} active
 * @param {String} shine Describes how the "shine" effect is rendered. Choices: siren, cascade
 * @param {String} color
 */
rsSystem.component("rsShinyButton", {
	"inherit": true,
	"mixins": [],
	"props": {
		"active": {
			"type": Boolean
		},
		"shine": {
			"type": String
		},
		"color": {
			"type": String
		}
	},
	"computed": {
		"classes": function() {
			var classes = "";

			if(this.active) {
				classes += this.color + "-fan-fare";
			}

			switch(this.shine) {
				case "siren":
					classes += " siren";
					break;
				case "cascade":
					classes += " cascade";
					break;
				default:
					classes += " siren";
			}

			return classes;
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
		"pressed": function(event) {
			this.$emit("click", event);
		}
	},
	"beforeDestroy": function() {
		
	},
	"template": Vue.templified("components/display/shiny.html")
});
