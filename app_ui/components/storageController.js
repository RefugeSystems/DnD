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
		"showCharges": function(object) {
			return typeof(object.charges_max) === "number" || typeof(object.charges_max) === "string";
		},
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
		"editNoun": function(event, record) {
			var player = this.player;

			if(event instanceof MouseEvent) {
				if(!record) {
					for(var i=0; i<event.path.length; i++) {
						if(event.path[i] && event.path[i] && event.path[i].attributes && (record = event.path[i].getAttribute("data-id"))) {
							record = this.universe.getObject(record);
							if(record) {
								event.stopPropagation();
								event.preventDefault();
								break;
							}
						}
					}
				}
				if(record) {
					if(!player) {
						player = this.universe.index.player[this.universe.connection.session.player];
					}
					if(player) {
						if(event.altKey) {
							this.info(record);
						} else if(player.gm) {
							if(event.ctrlKey) {
								navigator.clipboard.writeText(record.id);
							} else {
								if(this.profile && this.profile.edit_new_window) {
									window.open(location.pathname + "#/control/" + record._class + "/" + record.id, "edit");
								} else {
									this.$router.push("/control/" + record._class + "/" + record.id);
								}
							}
						}
					} else {
						console.warn("Edit Noun Failed: Player not found");
					}
				} else {
					console.warn("Edit Noun Failed: No Record Found: ", event, record);
				}
			} else {
				console.warn("Edit Noun Failed: Requires MouseEvent as first parameter");
			}
		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		}
	}
});
