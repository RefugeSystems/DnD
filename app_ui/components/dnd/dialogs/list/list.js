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
 * @param {Object} [details.clear] Reset the search string
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
			var listing = {},
				section,
				extras,
				counts,
				entry,
				sync,
				i,
				j;

			console.log("List Filter: " + this.storage.filter);
			this.search.clear();
			if(this.storage) {
				this.search.addQuery(this.storage.filter);
			}

			sync = [];
			for(i=0; i<this.sections.length; i++) {
				section = this.sections[i];
				listing[section] = [];
				if(!this.multiples[section]) {
					Vue.set(this.multiples, section, {});
				}
				sync.splice(0);
				counts = {};
				extras = 0;
				for(j=0; j<this.details.data[section].length; j++) {
					entry = this.details.data[section][j];
					// if(entry && !entry.disabled && !entry.concealed && (!this.storage || !this.storage.filter || (entry._search && entry._search.indexOf(this.storage.filter) !== -1))) {
					if(this.search.isFound(entry)) {
						if(!counts[entry.id]) {
							counts[entry.id] = 1;
							sync.push(entry.id);
							if(!this.details.limit || listing[section].length < this.details.limit) {
								listing[section].push(entry);
							} else {
								extras += 1;
							}
						} else {
							counts[entry.id]++;
						}
					}
					Vue.set(this.extras, section, extras);
				}
				for(j=0; j<sync.length; j++) {
					Vue.set(this.multiples[section], sync[j], counts[sync[j]]);
				}
			}
			
			return listing;
		}
	},
	"data": function () {
		var data = {};

		data.cards = this.details.cards;
		data.search = new RSSearch();
		data.multiples = {};
		data.extras = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		if(this.details.clear) {
			Vue.set(this.storage, "filter", "");
		}
	},
	"methods": {
		"toggleEmpty": function() {
			Vue.set(this.storage, "showEmpty", !this.storage.showEmpty);
		},
		"entryClassing": function(section, entry) {
			var classes = "";

			if(typeof(this.details.classing) === "function") {
				classes += this.details.classing(section, entry);
			}
			if(entry.is_npc) {
				classes += " is_npc";
			}
			if(entry.is_hostile) {
				classes += " is_hostile";
			}
			if(entry.is_chest) {
				classes += " is_chest";
			}
			if(entry.is_shop) {
				classes += " is_shop";
			}
			if(entry.is_locked) {
				classes += " is_locked";
			}

			return classes;
		},
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