
/**
 *
 * TODO: Collate editing fields and subscribe in someway to ensure save captures
 * 		buffering fields.
 * @class rsNoun
 * @constructor
 * @module Components
 */
(function() {
	rsSystem.component("rsNouns", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageController
		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			},
			"player": {
				"required": true,
				"type": Object
			},
			"configuration": {
				"type": Object,
				"default": function() {
					return {};
				}
			},
			"profile": {
				"type": Object,
				"default": function() {
					return {};
				}
			}
		},
		"computed": {
			"classes": function() {
				return this.universe.listing.classes.sort(rsSystem.utility.sortData);
			},
			"sources": function() {
				if(this.storage && this.storage.classification && this.universe.listing[this.storage.classification]) {
					this.universe.listing[this.storage.classification].sort(rsSystem.utility.sortData);
					return this.universe.listing[this.storage.classification];
				}
				return [];
			},
			"fields": function() {
				var fields = [],
					definition,
					field,
					i;

				if(this.storage && this.storage.classification && (definition = this.universe.index.classes[this.storage.classification])) {
					for(i=0; i<definition.fields.length; i++) {
						field = this.universe.index.fields[definition.fields[i]];
						if(field) {
							fields.push(field);
						} else {
							// TODO: Improved tracking
							console.warn("Invalid field[" + definition.fields[i] + "] in class definition[" + this.storage.classification + "]");
						}
					}
					fields.sort(rsSystem.utility.sortData);
				}

				return fields;
			},
			"nameGenerators": function() {

			}
		},
		"data": function() {
			var data = {},
				x;

			data.classification = this.$route.params.classification || this.universe.listing.classes[0].id;
			data.rawValue = "";
			data.details = {};
			data.copy = null;
			data.idfield = {
				"id": "id",
				"name": "ID",
				"description": "Primary ID string",
				"type": "string",
				"attribute": {}
			};

			return data;
		},
		"watch": {
			"details": {
				"deep": true,
				"handler": function(newValue) {
					Vue.set(this.storage, "detail_data", JSON.stringify(newValue));
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			if(!this.storage.rawValue) {
				Vue.set(this.storage, "rawValue", "{}");
			}
			if(this.storage.detail_data) {
				try {
					var parse = JSON.parse(this.storage.detail_data),
						keys,
						x;

					keys = Object.keys(this.details);
					for(x=0; x<keys.length; x++) {
						Vue.delete(this.details, keys[x]);
					}
					keys = Object.keys(parse);
					for(x=0; x<keys.length; x++) {
						Vue.set(this.details, keys[x], parse[keys[x]]);
					}
				} catch(e) {
					Vue.delete(this.storage, "detail_data");
				}
			}
			if(this.$route.params.classification) {
				Vue.set(this.storage, "classification", this.$route.params.classification);
			} else if(!this.storage.classification) {
				Vue.set(this.storage, "classification", this.universe.listing.classes[0].id);
			}
			this.reclassing();
		},
		"methods": {
			"copySource": function(source) {
				if(source) {
					source = this.universe.index[this.storage.classification][source];
					if(source && source._data) {
						Vue.set(this.details, "id", source._data.id);
						for(var x=0; x<this.fields.length; x++) {
							if(source._data[this.fields[x].id] === null || source._data[this.fields[x].id] === undefined) {
								Vue.delete(this.details, this.fields[x].id);
							} else {
								Vue.set(this.details, this.fields[x].id, source._data[this.fields[x].id]);
							}
						}
						this.previewObject();
					}
					Vue.set(this, "copy", null);
				}
			},
			"reclassing": function() {
				this.$emit("classification", this.storage.classification);
				this.previewObject();
			},
			"selectImage": function(event) {
				var input = $(this.$el).find("#attacher"),
					value,
					keys,
					x;

				if(this.storage.classification === "image" && input && input.length && input[0].files.length) {
					value = {};
					this.encodeFile(input[0].files[0])
					.then((result) => {
						value.data = result.data;
						result.name = result.name.substring(0, result.name.lastIndexOf("."));
						value.id = "image:" + result.name.replace(/\./g, ":");
						value.name = result.name;
						Vue.set(this, "rawValue", JSON.stringify(value, null, 4));
						input[0].value = null;
					});
				}
			},

			"fileAttach": function(event) {
				console.log("Drop: ", event);
			},
			"completed": function(event) {
				console.log("Complete: ", event);
			},
			"toObject": function() {
				var object = {},
					i;

				// Clean eroneous fields
				object.id = this.details.id;
				for(i=0; i<this.fields.length; i++) {
					if(this.details[this.fields[i].id] !== undefined) {
						object[this.fields[i].id] = this.details[this.fields[i].id];
					} else {
						object[this.fields[i].id] = null;
					}
				}

				return object;
			},
			"previewObject": function() {
				var previewing = {},
					i;

				// Clean eroneous fields
				previewing.id = this.details.id;
				for(i=0; i<this.fields.length; i++) {
					if(this.details[this.fields[i].id] !== undefined) {
						if(this.fields[i].type === "array" && this.details[this.fields[i].id].length === 0) {
							previewing[this.fields[i].id] = null;
						} else if(this.fields[i].type === "object") {
							// Reform object
						} else {
							previewing[this.fields[i].id] = this.details[this.fields[i].id];
						}
					} else {
						previewing[this.fields[i].id] = null;
					}
				}
				this.universe.send("preview:object", {
					"classification": this.storage.classification,
					"details": previewing
				});
			},
			"sync": function(event) {
				this.previewObject();
			},
			"adjust": function(event) {
				console.log("Blured: ", event);
			},
			"clearField": function(field) {
				switch(field.type) {
					case "array":
						Vue.set(this.details, field, []);
						break;
					case "object":
						Vue.set(this.details, field, {});
						break;
					default:
						Vue.delete(this.details, field);
						break;
				}
			},
			"displayCopyFromParent": function(field) {
				// TODO
				return false;
			},
			"copyParent": function(field) {
				// TODO
			},
			
			"toggleEditMode": function() {
				if(this.storage.advanced_editor) {
					// Parse Back to Details
					try {
						var details = JSON.parse(this.storage.rawValue),
							keys,
							i;
						
						keys = Object.keys(this.details);
						for(i=0; i<keys.length; i++) {
							Vue.delete(this.details, keys[i]);
						}
						
						keys = Object.keys(details);
						for(i=0; i<keys.length; i++) {
							Vue.set(this.details, keys[i], details[keys[i]]);
						}
					} catch(e) {
						console.error("Failed to parse rawValue: ", e);
						return null;
					}
				} else {
					// Stringify
					Vue.set(this.storage, "rawValue", JSON.stringify(this.details, null, 4));
				}
				Vue.set(this.storage, "advanced_editor", !this.storage.advanced_editor);
			},
			/**
			 * Clear all the current field values to prepare to enter new information
			 * @method newObject
			 */
			"newObject": function() {
				var keys = Object.keys(this.details),
					i;

				for(i=0; i<keys.length; i++) {
					Vue.delete(this.details, keys[i]);
				}

				this.previewObject();
			},
			/**
			 * Save the current specifications to an object (either making new or updating based
			 * on ID and handled server side)
			 * @method modify
			 */
			"modify": function() {
				var saving = {},
					i;

				// Clean eroneous fields
				saving.id = this.details.id;
				for(i=0; i<this.fields.length; i++) {
					saving[this.fields[i].id] = this.details[this.fields[i].id];
				}

				this.universe.send("create:object", {
					"classification": this.storage.classification,
					"details": saving
				});
			},
			/**
			 * 
			 * @method dropObject
			 */
			"dropObject": function() {
				console.log("Drop: " + this.details.id);
				this.universe.send("delete:object", {
					"classification": this.storage.classification,
					"id": this.details.id
				});
			}
		},
		"beforeDestroy": function() {
			/*
			this.universe.$off("universe:modified", this.universeUpdate);
			if(this.currentIndex) {
				this.currentIndex.$off("indexed", this.buildAvailableCopies);
			}
			*/
		},
		"template": Vue.templified("components/nouns.html")
	});
})();
