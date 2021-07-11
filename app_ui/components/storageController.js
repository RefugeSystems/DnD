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
		"storageContainer": {
			"type": Object
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
		if(this.storageContainer) {
			data.storage = this.storageContainer;
		} else {
			data.storage = this.loadStorage();
		}
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
			if(this.storageKey && !this.storageContainer) {
				var data = localStorage.getItem(this.storageKey);
				if(data) {
					return JSON.parse(data);
				} else {
					return defaults || this.defaultStorage || {};
				}
			}
		},
		"saveStorage": function() {
			if(this && this.storageKey && !this.storageContainer) {
				localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
			}
		},
		"copyText": function(text) {
			navigator.clipboard.writeText(text);
		},
		"editNoun": function(record) {
			if(this.player.gm) {
				if(this.profile.edit_new_window) {
					window.open("/#/control/" + record._class + "/" + record.id, "edit");
				} else {
					this.$router.push("/control/" + record._class + "/" + record.id);
				}
			}
		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		}
	}
});
