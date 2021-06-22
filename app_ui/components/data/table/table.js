
/**
 * 
 * 
 * @class rsTable
 * @constructor
 * @module Components
 * @zindex 1
 */
rsSystem.component("rsTable", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSCore
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
		"formatter": {
			"type": Object
		},
		"actions": {
			"type": Object
		},
		"sorts": {
			"type": Object
		},
		"size": {
			"type": Integer
		},
		"headings": {
			"type": Array
		},
		"hidden": {
			"type": Object
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
		}
	},
	"computed": {
		"corpus": function() {
			var corpus = [],
				filter = (this.storage.filter || "").toLowerCase(),
				rows = this.storage.rows || 20,
				page = this.storage.page || 0,
				i;

			for(i=0; i<this.source.length; i++) {
				if(this.source[0]._search !== undefined && source[0]._search !== null) {
					if(this.source[0]._search.indexOf(filter) !== -1) {
						corpus.push(this.source[0]);
					}
				} else if(this.source[0].name && this.source[0].name.toLowerCase().indexOf(filter) !== -1) {
					corpus.push(this.source[0]);
				}
			}

			if(this.storage.key) {
				this.corpus.sort(this.sortRows);
			}

			return corpus.splice(page * rows, rows);
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
	},
	"methods": {
		"sortRows": function(a, b) {
			var va = a[this.storage.key || "id"],
				vb = b[this.storage.key || "id"];

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

			return 0
		},
		"headerAction": function(header) {
			console.log("Header Action: ", header);
			if(!header.attribute || !header.attribute.no_sort) {
				if(this.storage.key === header.id) {
					if(this.storage.order === 1) {
						Vue.set(this.storage, "reverse", 1);
						Vue.set(this.storage, "order", -1);
					} else {
						Vue.set(this.storage, "reverse", -1);
						Vue.set(this.storage, "order", 1);
					}
				} else {
					Vue.set(this.storage, "key", header.field);
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
		"select": function(record, header) {
			console.log("Table Selection: ", record, header);
			if(typeof(this.actions[header.id]) === "function") {
				this.actions[header.id](record, header);
			} else if(!this.storage.selection) {
				if(this.storage.selected[record.id]) {
					Vue.set(this.storage.selected, record.id, false);
					this.$emit("deselected", record, header);
				} else {
					Vue.set(this.storage.selected, record.id, true);
					this.$emit("selected", record, header);
				}
			}
		}
	},
	"beforeDestroy": function() {

	},
	"template": Vue.templified("components/data/table.html")
});
