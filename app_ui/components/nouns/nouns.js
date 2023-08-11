
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
				var sources = [],
					source,
					buffer,
					i;
				if(this.storage && this.storage.classification && this.universe.listing[this.storage.classification]) {
					source = this.universe.listing[this.storage.classification];
					for(i=0; i<source.length; i++) {
						buffer = source[i];
						if(buffer && (buffer.is_template || buffer.is_copy || buffer.is_preview || buffer.is_template || buffer.parent || this.storage.includes._base)
								&& (!buffer.parent || this.storage.includes._parented)
								&& (!buffer.is_template || this.storage.includes.is_template)
								&& (!buffer.is_copy || this.storage.includes.is_copy)
								&& (!buffer.is_preview || this.storage.includes.is_preview)) {
							sources.push(buffer);
						}
					}
					sources.sort(rsSystem.utility.sortTrueData);
				}
				return sources;
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
							if(!field.attribute || !field.attribute.no_edit) {
								fields.push(field);
							}
						} else {
							// TODO: Improve tracking
							console.warn("Invalid field[" + definition.fields[i] + "] in class definition[" + this.storage.classification + "]");
						}
					}
					fields.sort(rsSystem.utility.sortByID);
				}

				return fields;
			},
			"nameGenerators": function() {
				// TODO:
			}
		},
		"watch": {
			"$route.params.classification": function(classing) {
				if(classing && this.storage.classification !== classing) {
					Vue.set(this.storage, "classification", classing);
					this.reclassing();
				}
			},
			"storage.fieldFilter": function() {
				if(this.fieldParts) {
					var parts = this.storage.fieldFilter.split(","),
						i;
					this.fieldParts.splice(0);
					for(i=0; i<parts.length; i++) {
						parts[i] = parts[i].trim();
						if(parts[i]) {
							this.fieldParts.push(parts[i].toLowerCase());
						}
					}
				}
			},
			"$route.params.id": function(id) {
				if(id) {
					this.reclassing();
				}
			}
		},
		"data": function() {
			var data = {},
				x;

			data.includes = [
				"_base",
				"_parented",
				"is_template",
				"is_copy",
				"is_preview"
			];
			data.includeIcons = {
				"_base": "fas fa-cube",
				"_parented": "fas fa-folder-tree",
				"is_template": "fas fa-file-import",
				"is_copy": "fas fa-copy",
				"is_preview": "fas fa-eye"
			};

			data.classification = this.$route.params.classification || this.universe.listing.classes[0].id;
			data.fieldParts = [];
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
		"mounted": function() {
			rsSystem.register(this);
			var source,
				keys,
				x;

			// if(typeof(this.storage.detail_data) === "object") {
			// 	keys = Object.keys(this.details);
			// 	for(x=0; x<keys.length; x++) {
			// 		Vue.delete(this.details, keys[x]);
			// 	}
			// 	keys = Object.keys(this.storage.detail_data);
			// 	for(x=0; x<keys.length; x++) {
			// 		Vue.set(this.details, keys[x], this.storage.detail_data[keys[x]]);
			// 	}
			// 	if(!this.storage.rawValue) {
			// 		Vue.set(this.storage, "rawValue", JSON.stringify(this.details, null, 4));
			// 	}
			// } else {
			// 	Vue.set(this.storage, "detail_data", {});
			// 	if(!this.storage.rawValue) {
			// 		Vue.set(this.storage, "rawValue", "{}");
			// 	}
			// }
			if(!this.storage.swap) {
				Vue.set(this.storage, "swap", {});
			}
			if(!this.storage.includes) {
				Vue.set(this.storage, "includes", {});
			}
			if(this.$route.params.classification) {
				Vue.set(this.storage, "classification", this.$route.params.classification);
			} else if(!this.storage.classification) {
				Vue.set(this.storage, "classification", this.universe.listing.classes[0].id);
			}
			if(this.storage.fieldFilter) {
				keys = this.storage.fieldFilter.split(",");
				for(x=0; x<keys.length; x++) {
					keys[x] = keys[x].trim();
					if(keys[x]) {
						this.fieldParts.push(keys[x].toLowerCase());
					}
				}
			}
			this.reclassing();
		},
		"methods": {
			"toggleInclude": function(include) {
				Vue.set(this.storage.includes, include, !this.storage.includes[include]);
			},
			"includeClasses": function(include) {
				var classes = this.includeIcons[include] || "fas fa-square";
				if(this.storage && this.storage.includes && this.storage.includes[include]) {
					classes += " enabled";
				} else {
					classes += " disabled";
				}
				return classes;
			},
			"usableSource": function(source) {
				return source.id.indexOf(":preview:") === -1;
			},
			"isVisible": function(field) {
				if(this.fieldParts.length === 0) {
					return true;
				}
				for(var i=0; i<this.fieldParts.length; i++) {
					if(field.id.indexOf(this.fieldParts[i]) !== -1) {
						return true;
					}
				}
				return false;
				// return !this.storage.fieldFilter || field.id.indexOf(this.storage.fieldFilter) !== -1;
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
						// setTimeout(function() {
						// 	rsSystem.EventBus.$emit("noun-sync");
						// },0);
					}
					Vue.set(this, "copy", null);
				}
			},
			"reclassing": function() {
				var source,
					i;

				if(!this.storage.swap[this.classification]) {
					Vue.set(this.storage.swap, this.classification, {});
				}
				if(!this.storage.swap[this.storage.classification]) {
					Vue.set(this.storage.swap, this.storage.classification, {});
				}

				if(this.$route.params.classification && this.$route.params.classification === this.storage.classification) {
					if(this.$route.params.id && (source = this.universe.index[this.$route.params.classification][this.$route.params.id]) && source._data) {
						Vue.set(this.details, "id", source.id || null);
						for(i=0; i<this.fields.length; i++) {
							if(source._data[this.fields[i].id] !== null && typeof(source._data[this.fields[i].id]) === "object") {
								Vue.set(this.details, this.fields[i].id, JSON.parse(JSON.stringify(source._data[this.fields[i].id])));
							} else {
								Vue.set(this.details, this.fields[i].id, source._data[this.fields[i].id] || null);
							}
						}
					} else {
						Vue.set(this.details, "id", null);
						for(i=0; i<this.fields.length; i++) {
							Vue.set(this.details, this.fields[i].id, null);
						}
					}
				} else {
					Vue.set(this.details, "id", this.storage.swap[this.storage.classification].id || null);
					for(i=0; i<this.fields.length; i++) {
						Vue.set(this.details, this.fields[i].id, this.storage.swap[this.storage.classification][this.fields[i].id] || null);
					}
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
				Vue.set(this.details, field.id, this.universe.time);
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
					if(this.details[this.fields[i].id] === undefined) {
						previewing[this.fields[i].id] = null;
					} else {
						previewing[this.fields[i].id] = this.details[this.fields[i].id];
					}
					// if(this.details[this.fields[i].id] !== undefined && this.details[this.fields[i].id] !== null) {
					// 	if(this.fields[i].type === "array" && this.details[this.fields[i].id].length === 0) {
					// 		previewing[this.fields[i].id] = null;
					// 	} else if(this.fields[i].type === "object") {
					// 		previewing[this.fields[i].id] = Object.assign({}, this.details[this.fields[i].id]);
					// 	} else {
					// 		previewing[this.fields[i].id] = this.details[this.fields[i].id];
					// 	}
					// } else {
					// 	previewing[this.fields[i].id] = null;
					// }
				}
				this.universe.send("preview:object", {
					"classification": this.storage.classification,
					"details": previewing
				});
				setTimeout(function() {
					rsSystem.EventBus.$emit("noun-sync");
				},0);
			},
			"sync": function(event) {
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
			"hasInheritance": function(field) {
				return field.inheritance && Object.keys(field.inheritance).length;
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

				// setTimeout(function() {
				// 	rsSystem.EventBus.$emit("noun-sync");
				// },0);
			},
			/**
			 * Save the current specifications to an object (either making new or updating based
			 * on ID and handled server side)
			 * @method modify
			 */
			"modify": function() {
				var saving = {},
					field,
					i;

				// Clean eroneous fields
				saving.id = this.details.id;
				for(i=0; i<this.fields.length; i++) {
					field = this.fields[i];
					switch(typeof(this.details[field.id])) {
						case "object":
							if(this.details[field.id] === null) {
								saving[field.id] = null;
							} else if(Object.keys(this.details[field.id]).length) {
								saving[field.id] = JSON.parse(JSON.stringify(this.details[field.id]));
							} else {
								saving[field.id] = null;
							}
							break;
						default:
							if(field.attribute && field.attribute.hashed && typeof(this.details[field.id]) === "string") {
								saving[field.id] = this.details[field.id].sha256();
							} else {
								saving[field.id] = this.details[field.id];
							}
					}
				}

				// console.log("Saving: ", saving);
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
				// console.log("Drop: " + this.details.id);
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
