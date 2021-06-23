
/**
 *
 *
 * @class rsTablePaging
 * @constructor
 * @module Components
 * @zindex 1
 * @param {Object} storage State storage for controling the table
 * @param {Array} source All records currently being accessed
 * @param {Array} filtered All records matching the current filtering applied to the table
 * @param {Array} corpus The currently visible records
 */

/**
 * 
 * @event info
 * @param {Object} record
 */
rsSystem.component("rsTablePaging", {
	"props": {
		"source": {
			"required": false,
			"type": Array
		},
		"corpus": {
			"required": false,
			"type": Array
		},
		"filtered": {
			"required": false,
			"type": Array
		},
		"storage": {
			"required": true,
			"type": Object
		},
		"lastPage": {
			"required": true,
			"type": Number
		}
	},
	"computed": {
		// "lastPage": function() {
		// 	// Handle aligned boundry
		// 	if(pages * this.storage.rows === this.filtered.length) {
		// 		pages -= 1;
		// 	}
		// 	return Math.floor(this.filtered.length/this.storage.rows);
		// }
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
			Vue.set(this.storage, "page", page);
		},
		"classPage": function(page) {
			if(page === this.storage.page) {
				return "current-page";
			} else if(page === 0) {
				return "first-page";
			} else if(page === this.lastPage) {
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
