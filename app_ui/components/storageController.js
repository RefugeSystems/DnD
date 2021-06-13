/**
 *
 * @class StorageController
 * @constructor
 * @param {String} storageKey The storage-key to use with localStorage for save and recall
 */
rsSystem.component("StorageController", {
	"inherit": true,
	"mixins": [

	],
	"props": {
		"storageKey": {
			"type": String
		},
		"defaultStorage": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"data": function() {
		// console.log("Loading Controller[" + this.storageKey + "]: ", this);
		var data = {};
		data.storage = this.loadStorage();
		return data;
	},
	"watch": {
		"storage": {
			"deep": true,
			"handler": function() {
				this.saveStorage();
			}
		}
	},
	"mounted": function() {
		// console.log("Mounted Controller[" + this.storageKey + "]: ", this.storage);
	},
	"methods": {
		"loadStorage": function(defaults) {
			if(this.storageKey) {
				var data = localStorage.getItem(this.storageKey);
				if(data) {
					return JSON.parse(data);
				} else {
					return defaults || this.defaultStorage;
				}
			}
		},
		"saveStorage": function() {
			if(this.storageKey) {
				localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
			}
		}
	}
});
