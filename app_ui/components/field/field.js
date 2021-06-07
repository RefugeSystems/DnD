
/**
 *
 *
 * @class rsField
 * @constructor
 * @module Components
 */
(function() {
	var offset = (new Date()).getTimezoneOffset() * 60 * 1000,
		autocompleteLength = 5,
		bufferDelay = 250;

	var dateToString = function(time) {
		if(!time) {
			return "";
		}

		var date = new Date(),
			loading,
			result;

		date.setTime(time);
		result = date.getFullYear();

		loading = date.getMonth() + 1;
		if(loading<10) {
			result += "-0";
		} else {
			result += "-";
		}
		result += loading;

		loading = date.getDate();
		if(loading<10) {
			result += "-0";
		} else {
			result += "-";
		}
		result += loading;

		return result;
	};

	rsSystem.component("rsField", {
		"inherit": true,
		"mixins": [
		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			},
			"root": {
				"required": true,
				"type": Object
			},
			"field": {
				"required": true,
				"type": Object
			}
		},
		"computed": {
			"availableReferences": function() {
				var available = [],
					x;
				if(this.field && this.field.inheritable) {
					for(x=0; x<this.field.inheritable.length; x++) {
						available = available.concat(this.universe.listing[this.field.inheritable[x]]);
					}
				}
				return available;
			}
		},
		"data": function() {
			var x, y, data = {};
			Vue.set(this.field, "type", (this.field.type || "text").toLowerCase());
			if(this.field.unset === undefined) {
				this.field.unset = "Select...";
			}
			data.fid = Random.identifier("field");
			data.reference_value = "";
			data.focused = false;

			data.activeCompletion = null;
			data.completions = [];

			data.bufferChanging = false;
			data.bufferLoading = false;
			data.bufferTimeout = null;
			data.bufferMark = null;
			switch(this.field.type) {
				case "date":
					if(this.root[this.field.id]) {
						data.buffer = dateToString(this.root[this.field.id]);
					} else {
						data.buffer = "";
					}
					break;
				default:
					data.buffer = this.root[this.field.id];
			}
//			if(this.field.type === "textarea") {
//			} else {
//				data.buffer = "";
//			}

			if(this.field.filter) {
				data.filterKeys = Object.keys(this.field.filter);
			}

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
			if(this.field.source_index && this.field.source_index.listing) {
				this.field.source_index.listing.sort(this.sortData);
			}
			this.$watch("root." + this.field.id, function(newValue, oldValue) {
				if(newValue != this.buffer) {
					switch(this.field.type) {
						case "date":
							Vue.set(this, "buffer", dateToString(newValue));
							break;
						default:
							Vue.set(this, "buffer", newValue);
					}
				}
			});
		},
		"methods": {
			"isVisible": function() {
				if(!this.field.condition) {
					return true;
				}

				var keys = Object.keys(this.field.condition),
					test,
					x,
					v;

				for(x=0; x<keys.length; x++) {
					switch(this.field.condition[keys[x]].operation) {
						case "<":
							if(this.root[keys[x]] >= this.field.condition[keys[x]].value) {
								return false;
							}
							break;
						case "<=":
							if(this.root[keys[x]] > this.field.condition[keys[x]].value) {
								return false;
							}
							break;
						case ">":
							if(this.root[keys[x]] <= this.field.condition[keys[x]].value) {
								return false;
							}
							break;
						case ">=":
							if(this.root[keys[x]] < this.field.condition[keys[x]].value) {
								return false;
							}
							break;
						case "=":
							if(this.root[keys[x]] != this.field.condition[keys[x]].value) {
								return false;
							}
							break;
						case "exists":
							if(!this.root[keys[x]]) {
								return false;
							}
							break;
						case "!":
							if(this.root[keys[x]]) {
								return false;
							}
							break;
						case "test":
							return !!this.root[keys[x]] === this.field.condition[keys[x]].value;
						case "contains":
							if(this.field.condition[keys[x]].values) {
								for(v=0; v<this.field.condition[keys[x]].values.length; v++) {
									if(this.root[keys[x]].indexOf(this.field.condition[keys[x]].values[v]) === -1) {
										return false;
									}
								}
							} else if(this.field.condition[keys[x]].oneof) {
								test = true;
								for(v=0; test && v<this.field.condition[keys[x]].oneof.length; v++) {
									if(this.root[keys[x]] && this.root[keys[x]].indexOf(this.field.condition[keys[x]].oneof[v]) !== -1) {
										test = false;
									}
								}
								if(test) {
									return false;
								}
							} else {
								if(this.root[keys[x]].indexOf(this.field.condition[keys[x]].value) === -1) {
									return false;
								}
							}
							break;
						default:
							if(this.root[keys[x]] != this.field.condition[keys[x]]) {
								return false;
							}
					}
				}

				return true;
			},
			"deriveCompletions": function(event, reference) {
				console.log("Derive: ", event, reference);
			},
			"optionAvailable": function(option) {
				if(this.filterKeys) {
					for(var x=0; x<this.filterKeys.length; x++) {
						if(option[this.filterKeys[x]] != this.field.filter[this.filterKeys[x]]) {
							return false;
						}
					}
				}

				return true;
			},
			"getReferenceName": function(reference) {
				var object = this.universe.getObject(reference);
				if(object) {
					return object.name;
				}
				return "[ Unknown ]";
			},
			"addReference": function(reference) {
				if(!this.root[this.field.id]) {
					Vue.set(this.root, this.field.id, []);
				}
				if(this.field.autocomplete) {
					if(this.completions[this.activeCompletion]) {
						this.root[this.field.id].push(this.completions[this.activeCompletion][this.field.optionValue]);
						Vue.set(this, "reference_value", "");
						this.completions.splice(0);
						this.emitChanged();
					}
				} else if(reference) {
					if(!(this.root[this.field.id] instanceof Array)) {
						Vue.set(this.root, this.field.id, []);
					}
					this.root[this.field.id].push(reference);
					Vue.set(this, "reference_value", "");
					this.emitChanged();
				}
			},
			"selectCompletion": function(completion) {
				if(!this.root[this.field.id]) {
					Vue.set(this.root, this.field.id, []);
				}
				this.root[this.field.id].push(completion[this.field.optionValue]);
				Vue.set(this, "reference_value", "");
				this.completions.splice(0);
			},
			"editReference": function(index, reference) {
				Vue.set(this, "reference_value", reference);
				this.dismissReference(index);
				// Search at time as it may hide/show from conditions
				$(this.$el).find("#editreference").focus();
			},
			"dismissReference": function(index) {
				this.root[this.field.id].splice(index, 1);
				this.emitChanged();
			},
			"openReference": function(reference) {
				if(reference) {
					rsSystem.EventBus.$emit("display-info", reference);
				}
			},
			/**
			 *
			 * @param  {KeyboardEvent} event
			 * @return {Boolean} Indicating whether additional processing is needed.
			 */
			"adjustCompletions": function(event) {
				switch(event.key) {
					case "ArrowUp":
						if(this.activeCompletion > 0) {
							Vue.set(this, "activeCompletion", this.activeCompletion - 1);
						}
						return false;
					case "ArrowDown":
						if(this.activeCompletion < this.completions.length - 1) {
							Vue.set(this, "activeCompletion", this.activeCompletion + 1);
						}
						return false;
					case "Escape":
						Vue.set(this, "reference_value", "");
						Vue.set(this, "activeCompletion", 0);
						this.completions.splice(0);
						return false;
				}

				return true;
			},
			"validSelectionOption": function(value) {
				return !this.field.uniqueness || !this.root[this.field.id] || this.root[this.field.id].indexOf(value) === -1;
			},
			"deriveCompletions": function(reference, event) {
				if(!event || this.adjustCompletions(event)) {
					if(!reference) {
						this.completions.splice(0);
					} else {
						reference = reference.toLowerCase();
						var added = 0,
							buffer,
							x;

						this.completions.splice(0);
						if(this.field.source_index) {
							for(x=0; x<this.field.source_index.listing.length && added < autocompleteLength; x++) {
								if(this.field.source_index.listing[x].name && this.field.source_index.listing[x].name.toLowerCase().indexOf(reference) !== -1 && this.validSelectionOption(this.field.source_index.listing[x])) {
									this.completions.push(this.field.source_index.listing[x]);
									added++;
								}
							}
						}
						Vue.set(this, "activeCompletion", 0);
					}
				}
			},
			"blurring": function() {
				this.$emit("blur", this.field);
				Vue.set(this, "focused", false);
				if(!this.bufferLoading) {
					this.$emit("complete", this.field);
				}
			},
			"focusing": function() {
				this.$emit("focus", this.field);
				Vue.set(this, "focused", true);
			},
			"checkField": function() {
				if(!this.root[this.field.id]) {
					return false;
				} else if(this.field.min && (this.root[this.field.id] < this.field.min || this.root[this.field.id].length <this.field.min)) {
					return false;
				} else if(this.field.max && (this.root[this.field.id] >this.field.max || this.root[this.field.id].length >this.field.max)) {
					return false;
				} else if(this.field.validation.pattern && !this.field.validation.pattern.test(this.root[this.field.id])) {
					return false;
				} else if(this.field.validation.method && !this.field.validation.method(this.root[this.field.id])) {
					return false;
				} else {
					return true;
				}
			},
			"processDate": function() {
				Vue.set(this.root, this.field.id, new Date(this.buffer).getTime() + offset);
			},
			"bufferChangeProcess": function() {
				if(this.bufferMark < Date.now()) {
					Vue.set(this.root, this.field.id, this.buffer);
					Vue.set(this, "bufferLoading", false);
					this.emitChanged();
				} else {
					if(!this.bufferChanging) {
						Vue.set(this, "bufferChanging", true);
						this.$emit("changing");
					}
					setTimeout(() => {
						this.bufferChangeProcess();
					}, bufferDelay);
				}
			},
			"bufferChanged": function() {
				Vue.set(this, "bufferMark", Date.now() + bufferDelay);
				Vue.set(this, "bufferLoading", true);
				setTimeout(() => {
					this.bufferChangeProcess();
				}, bufferDelay);

			},
			"emitChanged": function() {
				this.$emit("changed", {
					"value": this.root[this.field.id],
					"property": this.field.id,
					"time": Date.now()
				});

				if(this.field.onchange) {
					this.field.onchange(this.root[this.field.id]);
				}

				if(!this.focused) {
					this.$emit("complete", this.field);
				}

				Vue.set(this, "bufferChanging", false);
			},
			"selectFile": function(event) {
				var input = $(this.$el).find("[id='" + this.fid + ":file']"),
					value,
					start,
					type,
					end;

				console.warn("File Search: ", input, event);
				if(input && input.length && input[0].files.length) {
					console.warn("Set Data");
					DataUtility.encodeFile(input[0].files[0])
					.then((result) => {
						value = result.data;
						start = value.indexOf(":");
						end = value.indexOf(";");
						type = value.substring(start + 1, end);
						Vue.set(this.root, "content_type", type);
						Vue.set(this.root, this.field.id, value);
					});
				}
			},
			"set": function(value) {
				Vue.set(this.root, this.field.id, value);
				this.emitChanged();
			},
			"compose": function(row, col) {
				Vue.set(this.tracking[this.r], this.c, false);
				Vue.set(this.tracking[this.r], this.c, false);
				Vue.set(this.tracking[row], col, true);
				Vue.set(this, "r", row);
				Vue.set(this, "c", col);
				return this.field.compose?this.field.compose(row, col):col + ":" + row;
			},
			"separate": function(value) {
				if(value) {
					var apart = value.split(":");
					return {
						"c": apart[0],
						"r": apart[1]
					};
				} else {
					return {};
				}
			},
			"sortData": function(a, b) {
				var aName,
					bName;

				if(a.ordering !== undefined && b.ordering !== undefined && a.ordering !== null && b.ordering !== null) {
					if(a.ordering < b.ordering) {
						return -1;
					} else if(a.ordering > b.ordering) {
						return 1;
					}
				}
				if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
					return -1;
				}
				if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
					return 1;
				}

				if(a.name !== undefined && b.name !== undefined && a.name !== null && b.name !== null) {
					aName = a.name.toLowerCase();
					bName = b.name.toLowerCase();
					if(aName < bName) {
						return -1;
					} else if(aName > bName) {
						return 1;
					}
				}
				if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
					return -1;
				}
				if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
					return 1;
				}

				if(a.id < b.id) {
					return -1;
				} else if(a.id > b.id) {
					return 1;
				}

				return 0;
			}
		},
		"template": Vue.templified("components/field.html")
	});
})();
