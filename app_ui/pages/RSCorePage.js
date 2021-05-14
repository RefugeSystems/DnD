
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
		"user": {
			"required": true,
			"type": Object
		}
	},
	"computed": {

	},
	"watch": {
	},
	"methods": {
	}
});
