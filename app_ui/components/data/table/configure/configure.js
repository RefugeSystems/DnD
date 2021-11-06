
/**
 * 
 * Generally meant as a dialog component but configured to accept data as 
 * parameters as well.
 * @class rsTableConfigure
 * @constructor
 * @module Components
 * @zindex 1
 * @param {Object} sourceData
 * @param {Object} details The currently visible records
 * @param {Array} additionalHeaders All records currently being accessed
 * @param {Array} storageData
 */
rsSystem.component("rsTableConfigure", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"details": {
			"type": Object
		},
		"additionalHeaders": {
			"type": Array
		},
		"sourceData": {
			"type": Array
		},
		"storageData": {
			"type": Object
		}
	},
	"computed": {
		"present": function() {
			var present = {},
				i;

			for(i=0; i<this.storage.headings.length; i++) {
				present[this.storage.headings[i]] = true;
			}

			return present;
		},
		"headers": function() {
			var headers = [],
				classes = {},
				fields = {},
				classification,
				field,
				i,
				j;

			for(i=0; i<this.records.length; i++) {
				if(this.records[i]) {
					classes[this.records[i]._class] = true;
				}
			}
			classes = Object.keys(classes);
			for(i=0; i<classes.length; i++) {
				classification = this.universe.index.classes[classes[i]];
				if(classification) {
					for(j=0; j<classification.fields.length; j++) {
						fields[classification.fields[j]] = true;
					}
				}
			}
			fields = Object.keys(fields);
			for(i=0; i<fields.length; i++) {
				field = this.universe.index.fields[fields[i]];
				if(field && (!field.attribute.master_only || this.player.gm) && !field.attribute.server_only) {
					headers.push(field);
				}
			}
			if(this.additional) {
				for(i=0; i<this.additional.length; i++) {
					field = this.universe.index.fields[this.additional[i]];
					if(field && (!field.attribute.master_only || this.player.gm) && !field.attribute.server_only) {
						headers.push(field);
					}
				}
			}
			headers.sort(rsSystem.utility.sortByName);
			return headers;
		},
		"records": function() {
			return this.details.source || this.sourceData || [];
		},
		"storage": function() {
			return this.details.storage || this.storageData;
		},
		"additional": function() {
			return this.details.additional || this.additionalHeaders;
		}
	},
	"watch": {
		"storage.headings": {
			"deep": true,
			"handler": function() {
				for(var i=0; i<this.storage.headings.length; i++) {
					Vue.set(this.ordering, this.storage.headings[i], i);
				}
			}
		}
	},
	"data": function() {
		var data = {};
		data.ordering = {};
		data.newHeader = "";
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		for(var i=0; i<this.storage.headings.length; i++) {
			Vue.set(this.ordering, this.storage.headings[i], i);
		}
	},
	"methods": {
		"toggleDownload": function() {
			Vue.set(this.storage, "download_available", !this.storage.download_available);
		},
		"resetHeaders": function() {
			this.storage.headings.splice(0);
			this.storage.headings.push.apply(this.storage.headings, this.storage.defaultHeaders || ["name"]);
		},
		"getFieldName": function(id) {
			if(this.universe.index.fields[id]) {
				return this.universe.index.fields[id].name;
			}
			console.warn("Unable to name Field for Header: ", id);
			return "[Unknown]";
		},
		"addHeader": function(id) {
			if(id) {
				if(this.universe.index.fields[id]) {
					Vue.set(this.ordering, id, this.headers.length);
					this.storage.headings.push(id);
				} else {
					console.warn("Unknown Field for Header: ", id);
				}
				Vue.set(this, "newHeader", "");
			}
		},
		"reorder": function(header, from, to) {
			this.storage.headings.splice(from, 1);
			this.storage.headings.splice(to, 0, header);
		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": "fields:" + (record.id || record)
			});
		},
		"remove": function(index) {
			this.storage.headings.splice(index, 1);
		}
	},
	"beforeDestroy": function() {

	},
	"template": Vue.templified("components/data/table/configure.html")
});
