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
			"required": true,
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
		console.log("Loading Controller[" + this.storageKey + "]: ", this);
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
		console.log("Mounted Controller[" + this.storageKey + "]: ", this.storage);
	},
	"methods": {
		"loadStorage": function(defaults) {
			var data = localStorage.getItem(this.storageKey);
			if(data) {
//				console.log("Load[" + key + "]: ", data);
				return JSON.parse(data);
			} else {
//				console.log("Load[" + key + "]: Defaulted");
				return defaults || this.defaultStorage;
			}
		},
		"saveStorage": function() {
//			console.log("Save[" + key + "]: ", this.storage);
			localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
		}
	}
});
