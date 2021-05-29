
/**
 *
 *
 * @class RSCorePage
 * @constructor
 * @module Components
 */
rsSystem.component("RSCorePage", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageManager
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
		"configuration": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		}
	},
	"watch": {
	},
	"methods": {
		"menuSpacing": function() {
			if(this.profile && this.profile.navigation_collapsed) {
				return "collapsed";
			} else {
				return "extended";
			}
		}
	}
});
