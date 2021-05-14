/**
 *
 * @class StorageManager
 * @constructor
 * @param {String} id
 * @param {Component} component
 */
var StorageManager = function(id) {
	var manager = this,
		storage;

	storage = localStorage.getItem(id);
	if(storage) {
		try {
			storage = JSON.parse(storage);
		} catch (exception) {
			localStorage.setItem(id + "_errored", storage);
			storage = {};
		}
	} else {
		storage = {};
	}

	manager.registerComponent = function(component) {
		component.storage = {
			"deep": true,
			"handler": function(newValue) {
				manager.updateStorage(JSON.stringify(newValue));
			}
		};
	};

	manager.updateStorage = function() {
		localStorage.setItem(id, JSON.stringify(storage));
	};
};
