/**
 *
 *
 * @class dndDialogList
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {UIProfile} profile
 * @param {Object} details
 * @param {Object} [details.title] If omitted no title is displayed.
 * @param {Object} [details.sections] If omitted, inferred from the `details.data` object.
 * @param {Object} [details.activate] If specified, this is called to process clicks to the list
 * 		item. Otherwise it is passed to info.
 * @param {Object} details.cards
 * @param {Object} details.data
 */
rsSystem.component("dndDialogList", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DialogController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"sections": function() {
			var sections = [],
				keys = this.details.sections || Object.keys(this.details.data),
				i;

			for(i=0; i<keys.length; i++) {
				if(this.details.data[keys[i]] && this.details.data[keys[i]].length) {
					sections.push(keys[i]);
				}
			}

			return sections;
		},
		"controls": function(){
			return this.details.controls;
		},
		"listing": function() {
			var listing = [],
				extras,
				entry,
				i,
				j;

			for(i=0; i<this.sections.length; i++) {
				listing[this.sections[i]] = [];
				extras = 0;
				for(j=0; j<this.details.data[this.sections[i]].length; j++) {
					entry = this.details.data[this.sections[i]][j];
					if(entry && !entry.disabled && !entry.concealed && (!this.storage || !this.storage.filter || (entry._search && entry._search.indexOf(this.storage.filter) !== -1))) {
						if(!this.details.limit || listing[this.sections[i]].length < this.details.limit) {
							listing[this.sections[i]].push(entry);
						} else {
							extras += 1;
						}
					}
					Vue.set(this.extras, this.sections[i], extras);
				}
			}
			
			return listing;
		}
	},
	"data": function () {
		var data = {};

		data.cards = this.details.cards;
		data.extras = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"toLink": function() {
			if(this.details.link) {
				rsSystem.toPath(this.details.link);
				this.closeDialog();
			}
		},
		"activate": function(section, record) {
			if(this.details.activate) {
				this.details.activate(section, record);
			} else {
				this.info(record);
			}
		},
		"updateFilter": function(filter) {
			Vue.set(this.storage, "filter", filter);
		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/dnd/dialogs/list.html")
});