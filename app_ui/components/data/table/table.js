
/**
 * 
 * 
 * @class rsTable
 * @constructor
 * @module Components
 * @zindex 1
 * @param {Universe} universe
 * @param {Array} source
 * @param {Object} [headings] Array of field names to use for display. Defaults to icon, name, acquired.
 * @param {String} [control] Naming the Component to use for controls. Defaults ot the generla table control
 * 		for filtering and selection.
 * @param {String} [paging] Naming the Component to use for paging. Defaults ot the generla table control
 * 		for listing and selecting pages.
 * @param {Object} [formatter] Maps field IDs to functions that handle formatting data.
 * @param {Object} [actions] Maps field IDs to functions that handle actions for selecting rows in that column.
 * @param {Object} [sorts] Maps field IDs to functions that handle sorting data for that field.
 * @param {Object} [hidden] Maps field IDs to booleans to hide the heading for that field
 * @param {Object} [size] Short hand for header selection based on field display sizing.
 */
rsSystem.component("rsTable", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"source": {
			"required": true,
			"type": Array
		},
		"control": {
			"default": "rsTableControls",
			"type": String
		},
		"paging": {
			"default": "rsTablePaging",
			"type": String
		},
		"title": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"formatter": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"actions": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"sorts": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"additionalHeaders": {
			"type": Array
		},
		"controls": {
			"type": Array
		},
		"selections": {
			"type": Array
		},
		"label": {
			"type": String
		},
		"size": {
			"type": Number
		},
		"headings": {
			"type": Array
		},
		"profile": {
			"type": Object
		},
		"hidden": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"computed": {
		"headers": function() {
			var headers = [],
				classing,
				field,
				i;

			if(this.storage && this.storage.headings && this.storage.headings.length) {
				for(i=0; i<this.storage.headings.length; i++) {
					field = this.universe.index.fields[this.storage.headings[i]];
					if(field && !field.disabled) {
						headers.push(field);
					}
				}
			} else if(this.headings && this.headings.length) {
				for(i=0; i<this.headings.length; i++) {
					field = this.universe.index.fields[this.headings[i]];
					if(field && !field.disabled) {
						headers.push(field);
					}
				}
			} else if(this.size && this.corpus.length && (classing = this.corpus[0]._class) && this.universe.index.managers[classing]) {
				for(i=0; i< this.universe.index.managers[classing].fields.length; i++) {
					field = this.universe.index.fields[this.universe.index.managers[classing].fields[i]];
					if(field && !field.disabled) {
						headers.push(field);
					}
				}
			} else {
				headers.push(this.universe.index.fields.icon);
				headers.push(this.universe.index.fields.name);
				headers.push(this.universe.index.fields.date);
			}

			return headers;
		},
		"filtered": function() {
			var filtered = [],
				counts = {},
				filter,
				i;

			if(this.storage && this.storage.filter) {
				filter = this.storage.filter.toLowerCase();
			} else {
				filter = "";
			}

			// The list must be populated to build repeat counts, thus the raw list can not be returned
			// if(!filter) {
			// 	// Return quickly in the case of large datasets
			// 	this.source.sort(this.sortRows);
			// 	return this.source;
			// }

			for(i=0; i<this.source.length; i++) {
				if(!counts[this.source[i].id]) {
					if(filter) {
						if(filter === ":selected") {
							if(this.storage.selected && this.storage.selected[this.source[i].id]) {
								filtered.push(this.source[i]);
								counts[this.source[i].id] = 1;
							}
						} else {
							if(this.source[i]._search !== undefined && this.source[i]._search !== null) {
								if(this.source[i]._search.indexOf(filter) !== -1) {
									filtered.push(this.source[i]);
									counts[this.source[i].id] = 1;
								}
							} else if(this.source[i].name && this.source[i].name.toLowerCase().indexOf(filter) !== -1) {
								filtered.push(this.source[i]);
								counts[this.source[i].id] = 1;
							}
						}
					} else {
						filtered.push(this.source[i]);
						counts[this.source[i].id] = 1;
					}
				} else {
					counts[this.source[i].id]++;
				}
			}

			Vue.set(this, "idCount", counts);
			if(this.storage.key) {
				filtered.sort(this.sortRows);
			}

			return filtered;
		},
		"lastPage": function() {
			var rows = this.storage.rows || 20,
				pages;

			pages = Math.floor(this.filtered.length/rows);

			// Handle aligned boundry
			if(pages * rows === this.filtered.length) {
				pages -= 1;
			}

			return pages;
		},
		"corpus": function() {
			var rows = this.storage.rows || 20,
				page = this.storage.page || 0,
				corpus = [],
				record,
				slice,
				child,
				i,
				j;

			if(isNaN(page)) {
				page = 0;
			} else if(page > this.lastPage) {
				page = this.lastPage;
			} else if(page < 0) {
				page = 0;
			}

			if(page !== this.storage.page) {
				Vue.set(this.storage, "page", page);
			}
			
			slice = this.filtered.slice(rows * page, rows * page + rows);
			for(i=0; i<slice.length; i++) {
				record = slice[i];
				corpus.push(record);
				if(this.storage.selected && this.storage.selected[record.id] && this.idCount[record.id] > 1) {
					for(j=1; j<this.idCount[record.id]; j++) {
						child = {};
						child.name = record.name;
						child.parent = record.id;
						child.select = j + 1;
						corpus.push(child);
					}
					if(this.storage.selected[record.id] > this.idCount[record.id]) {
						Vue.set(this.storage.selected, record.id, this.idCount[record.id]);
					}
				}
			}

			return corpus;
		}
	},
	"watch": {

	},
	"data": function() {
		var data = {};
		data.idCount = {};
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		Vue.set(this.storage, "defaultHeaders", this.headings);
		if(typeof(this.storage.page) !== "number") {
			Vue.set(this.storage, "page", 0);
		}
		if(!this.storage.selected) {
			Vue.set(this.storage, "selected", {});
		}
		if(!this.storage.order) {
			Vue.set(this.storage, "reverse", -1);
			Vue.set(this.storage, "order", 1);
		}
		if(isNaN(this.storage.page)) {
			Vue.set(this.storage, "page", 0);
		}
		if(this.storage.page >= Math.floor(this.corpus.length/this.storage.rows)) {
			Vue.set(this.storage, "page", 0);
		}
		if(!this.storage.headings) {
			Vue.set(this.storage, "headings", this.headings);
		}
	},
	"methods": {
		"sortRows": function(a, b) {
			var va = a[this.storage.key || "id"],
				vb = b[this.storage.key || "id"];

			if(this.sorts[this.storage.key]) {
				if(this.sorts[this.storage.key](va, vb) < 0) {
					return this.storage.reverse;
				} else if(this.sorts[this.storage.key](va, vb) > 0) {
					return this.storage.order;
				}
				return 0;
			}

			if(va === undefined) {
				va = null;
			}
			if(vb === undefined) {
				vb = null;
			}
			
			if(va === null && vb !== null) {
				return this.storage.order;
			} else if(va !== null && vb === null) {
				return this.storage.reverse;
			} else if(va < vb) {
				return this.storage.reverse;
			} else if(va > vb) {
				return this.storage.order;
			}

			return 0;
		},
		"headerAction": function(header) {
			if(!header.attribute || !header.attribute.no_sort || this.sorts[header.id]) {
				if(this.storage.key === header.id) {
					if(this.storage.order === 1) {
						Vue.set(this.storage, "reverse", 1);
						Vue.set(this.storage, "order", -1);
					} else {
						Vue.set(this.storage, "reverse", -1);
						Vue.set(this.storage, "order", 1);
					}
				} else {
					Vue.set(this.storage, "key", header.id);
				}
			}
		},
		"formatObjectHeader": function(object) {
			var x, keys, html;
			keys = Object.keys(object);
			html = "<ul>";
			for(x=0; x<keys.length; x++) {
				html += "<li><span class='property'>" + keys[x] + "</span>: <span class='value'>" + object[keys[x]] + "</span></li>"; 
			}
			html += "<ul>";
		},
		"getValue": function(field, value) {
			if(field.inheritable) {
				var referenced = this.universe.getObject(value);
				if(referenced && !referenced.disabled && !referenced.is_preview) {
					return referenced.name || referenced.id;
				}
			}
			return value;
		},
		/**
		 * 
		 * @method select
		 * @param {Object} record 
		 * @param {Object} header 
		 */
		/**
		 * 
		 * @event selected
		 * @param {Object} record
		 */
		/**
		 * 
		 * @event deselected
		 * @param {Object} record
		 */
		"select": function(record, header) {
			if(typeof(this.actions[header.id]) === "function") {
				this.actions[header.id](record, header);
			} else if(!this.storage.selection) {
				if(this.storage.selected[record.id]) {
					Vue.delete(this.storage.selected, record.id);
					this.$emit("deselected", record, header);
				} else {
					Vue.set(this.storage.selected, record.id, 1);
					this.$emit("selected", record, header);
				}
			}
		},
		"selectChild": function(record) {
			if(this.storage.selected[record.parent] === record.select) {
				Vue.set(this.storage.selected, record.parent, 1);
			} else {
				Vue.set(this.storage.selected, record.parent, record.select);
			}
			this.$emit("selected", record);
		},
		"repeatSelect": function(event) {
			this.$emit("selected", event);
		},
		"repeatDeselect": function(event) {
			this.$emit("deselected", event);
		}
	},
	"beforeDestroy": function() {

	},
	"template": Vue.templified("components/data/table.html")
});
