
/**
 * 
 * 
 * @class rsTextBlock
 * @constructor
 * @module Components
 * @params {Universe} universe
 * @params {RSObject} [record]
 * @params {Object} [profile]
 * @params {String} text
 */
rsSystem.component("rsTextBlock", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSShowdown
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"text": {
			"default": "",
			"type": String
		},
		"profile": {
			"type": Object,
			"default": function() {
				return rsSystem.universe.profile;
			}
		},
		"record": {
			"type": Object
		}
	},
	"computed": {
		/**
		 * Rendered text
		 * @property displayed
		 * @type String
		 */
		"displayed": function() {
			return this.rsshowdown(this.text, this.record, this.profile?this.profile.inline_javascript:false);
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
	"template": Vue.templified("components/display/text.html")
});
