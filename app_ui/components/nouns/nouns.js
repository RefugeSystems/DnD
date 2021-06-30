
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
					this.universe.listing[this.storage.classification].sort(rsSystem.utility.sortTrueData);
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
					fields.sort(rsSystem.utility.sortByID);
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
			if(!this.storage.classification_ids) {
				Vue.set(this.storage, "classification_ids", {});
			}
			if(!this.storage.swap) {
				Vue.set(this.storage, "swap", {});
			}
			if(this.$route.params.classification) {
				Vue.set(this.storage, "classification", this.$route.params.classification);
			} else if(!this.storage.classification) {
				Vue.set(this.storage, "classification", this.universe.listing.classes[0].id);
			}
			this.reclassing();
		},
		"methods": {
			"usableSource": function(source) {
				return source.id.indexOf(":preview:") === -1;
			},
			"nameSource": function(source) {
				var name = source.is_copy?"[C] ":"";
				if(source.name) {
					if(source._data && source._data.name) {
						if(source._data.name === source.name) {
							name += source.name || source.id;
						} else {
							name += source._data.name + " (" + source.name + ")";
						}
					} else {
						name += source.name + " (" + source.id + ")";
					}
				} else {
					name += source.id;
				}
				return name;
			},
			"copySource": function(source) {
				var x;

				if(source) {
					source = this.universe.index[this.storage.classification][source];
					if(source) {
						source = JSON.parse(JSON.stringify(source));
						if(source._data) {
							Vue.set(this.details, "id", source._data.id);
							for(x=0; x<this.fields.length; x++) {
								if(source._data[this.fields[x].id] === null || source._data[this.fields[x].id] === undefined) {
									Vue.delete(this.details, this.fields[x].id);
								} else {
									Vue.set(this.details, this.fields[x].id, source._data[this.fields[x].id]);
								}
							}
						} else {
							Vue.set(this.details, "id", source.id);
							for(x=0; x<this.fields.length; x++) {
								if(source[this.fields[x].id] === null || source[this.fields[x].id] === undefined) {
									Vue.delete(this.details, this.fields[x].id);
								} else {
									Vue.set(this.details, this.fields[x].id, source[this.fields[x].id]);
								}
							}
						}
						this.previewObject();
					}
					Vue.set(this, "copy", null);
				}
			},
			"reclassing": function() {
				// Vue.set(this.details, "id", this.storage.classification_ids[this.storage.classification] || "");
				var keys,
					i;

				if(!this.storage.swap[this.classification]) {
					Vue.set(this.storage.swap, this.classification, {});
				}
				if(!this.storage.swap[this.storage.classification]) {
					Vue.set(this.storage.swap, this.storage.classification, {});
				}

				// Update Current Class Swap
				keys = Object.keys(this.storage.swap[this.classification]);
				for(i=0; i<keys.length; i++) {
					Vue.set(this.storage.swap[this.classification], keys[i], null);
				}

				keys = Object.keys(this.details);
				for(i=0; i<keys.length; i++) {
					Vue.set(this.storage.swap[this.classification], keys[i], this.details[keys[i]]);
					Vue.set(this.details, keys[i], null);
				}
				
				keys = Object.keys(this.storage.swap[this.storage.classification]);
				for(i=0; i<keys.length; i++) {
					Vue.set(this.details, keys[i], this.storage.swap[this.storage.classification][keys[i]]);
				}

				Vue.set(this, "classification", this.storage.classification);
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
			"setTimeToNow": function(field) {
				Vue.set(this.object, field.id, this.universe.time);
			},
			"fileAttach": function(event) {
				console.log("Drop: ", event);
			},
			"completed": function(event) {
				// console.log("Complete: ", event);
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
					if(this.details[this.fields[i].id] !== undefined && this.details[this.fields[i].id] !== null) {
						if(this.fields[i].type === "array" && this.details[this.fields[i].id].length === 0) {
							previewing[this.fields[i].id] = null;
						} else if(this.fields[i].type === "object") {
							previewing[this.fields[i].id] = Object.assign({}, this.details[this.fields[i].id]);
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
				Vue.set(this.storage.classification_ids, this.storage.classification, this.details.id);
				this.previewObject();
				this.$emit("sync", event);
			},
			"adjust": function(event) {
				// console.log("Blured: ", event);
			},
			"noData": function(field) {
				Vue.set(this.details, field.id, null);
			},
			"clearField": function(field) {
				switch(field.type) {
					case "array":
						Vue.set(this.details, field.id, []);
						break;
					case "object":
						Vue.set(this.details, field.id, {});
						break;
					default:
						Vue.delete(this.details, field.id);
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
					Vue.set(this.details, keys[i], null);
				}

				this.previewObject();

				for(i=0; i<keys.length; i++) {
					Vue.delete(this.details, keys[i]);
				}
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
					switch(typeof(this.details[this.fields[i].id])) {
						case "object":
							saving[this.fields[i].id] = JSON.parse(JSON.stringify(this.details[this.fields[i].id]));
							break;
						default:
							saving[this.fields[i].id] = this.details[this.fields[i].id];
					}
				}

				console.log("Saving: ", saving);
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
