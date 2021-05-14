/**
 *
 * @class StorageManager
 * @constructor
 * @param {String} [storageKey] The default storage-key to use with localStorage for save and recall
 */
rsSystem.component("StorageManager", {
	"inherit": true,
	"mixins": [

	],
	"props": [
		"storageKey"
	],
	"mounted": function() {

	},
	"methods": {
		"loadStorage": function(key, defaults) {
			key = key || this.storageKeyID || this.storageKey || "storageComponent";
			var data = localStorage.getItem(key);
			if(data) {
//				console.log("Load[" + key + "]: ", data);
				return JSON.parse(data);
			} else {
//				console.log("Load[" + key + "]: Defaulted");
				return defaults;
			}
		},
		"saveStorage": function(key, object) {
			key = key || this.storageKeyID || this.storageKey;
			if(!key || !object) {
				throw new Error("Missing arguments");
			}
//			console.log("Save[" + key + "]: ", object);
			localStorage.setItem(key, JSON.stringify(object));
		}
	}
});
