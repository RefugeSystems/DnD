
/**
 * 
 * 
 * @class rsTableControls
 * @constructor
 * @module Components
 * @zindex 1
 */
rsSystem.component("rsTableControls", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"corpus": {
			"required": false,
			"type": Array
		},
		"storage": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"pages": function() {

		},
		"hasSelection": function() {
			return Object.keys(this.storage.selected).length;
		}
	},
	"watch": {

	},
	"data": function() {
		var data = {};
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"clearSelection": function() {

		},
		"allSelection": function() {

		},
		"infoSelection": function(record) {
			this.$emit("info", record);
		}
	},
	"beforeDestroy": function() {

	},
	"template": Vue.templified("components/data/table/controls.html")
});
