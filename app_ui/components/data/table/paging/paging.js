
/**
 *
 *
 * @class rsTablePaging
 * @constructor
 * @module Components
 * @zindex 1
 */
rsSystem.component("rsTablePaging", {
	"props": {
		"corpus": {
			"required": false,
			"type": Array
		},
		"state": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"pages": function() {

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
		"toPage": function(page) {
			Vue.set(this.state.paging, "current", page);
		},
		"classPage": function(page) {
			if(page === this.state.paging.current) {
				return "current-page";
			} else if(page === 0) {
				return "first-page";
			} else if(page === this.state.paging.count - 1) {
				return "last-page";
			} else {
				return "general-page";
			}
		}
	},
	"beforeDestroy": function() {

	},
	"template": Vue.templified("components/data/table/paging.html")
});
