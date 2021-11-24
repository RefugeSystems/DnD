(function() {
	var skipped = /[^a-zA-Z0-9]/g,
		spacing = /[ _-]/g;

	/**
	 *
	 * @class Utility
	 * @namespace rsSystem
	 * @constructor
	 * @static
	 */
	rsSystem.utility = {
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		},
		/**
		 *
		 * @method idFromName
		 * @param {String} name
		 * @return {String}
		 */
		"idFromName": function(name) {
			if(name) {
				return name.toLowerCase().replace(spacing, ":").replace(skipped, "");
			}
			return "";
		},
		/**
		 *
		 * @method uniqueByID
		 * @param {Array} corpus The array to clean.
		 * @return {Array} The passed array that is now cleaned.
		 */
		"uniqueByID": function(corpus) {
			if(!corpus) {
				return corpus;
			}

			var track = {},
				x;

			for(x=corpus.length-1; 0<=x; x--) {
				if(track[corpus[x].id]) {
					corpus.splice(x, 1);
				} else {
					track[corpus[x].id] = true;
				}
			}

			return corpus;
		},
		/**
		 * 
		 * @method forceReload
		 */
		"forceReload": function() {
			navigator.serviceWorker.controller.postMessage({
				"action": "update"
			});
			location.reload();
		},
		"isOwner": function(record, player) {
			player = this.player || player;

			if(player && player.master) {
				return true;
			}

			if(record.is_public) {
				return true;
			} else if(record.is_private) {
				return false;
			} else if(player && record.owner === player.id) {
				return true;
			} else if(record.owners && player && record.owners.indexOf(player.id) !== -1) {
				return true;
			} else if(!record.owner && (!record.owners || record.owners.length === 0)) {
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Check if an object is disabled or obscured.
		 * @method isValid
		 * @param {RSObject} object 
		 * @returns {Boolean}
		 */
		"isValid": function(object) {
			return object && !object.is_preview && !object.disabled && !object.is_disabled && !object.obscured && !object.is_obscured && !object.template && !object.is_template && !object.inactive && !object.is_inactive;
		},
		/**
		 * 
		 * @method hasCommonKey
		 * @param {Object} object 
		 * @param {Array} array 
		 * @return {Boolean} True if the object contains a key that matches a value in the array.
		 */
		"hasCommonKey": function(object, array) {
			if(!object || !array) {
				return false;
			}

			for(var i=0; i<array.length; i++) {
				if(object[array[i]]) {
					return true;
				}
			}
			
			return false;
		},
		/**
		 * 
		 * @method hasDamage
		 * @param {RSObject} object 
		 * @return {Boolean}
		 */
		"hasDamage": function(object) {
			return object && rsSystem.utility.isNotEmpty(object.damage);
		},
		/**
		 * Test if an object contains no properties.
		 * @method isEmpty
		 * @param {Object} object 
		 * @return {Boolean} Returns true if the object is falsey or has no children
		 */
		"isEmpty": function(object) {
			if(!object) {
				return true;
			}
			for(var i in object) {
				return false;
			}
			return true;
		},
		/**
		 * Test if an object contains properties.
		 * @method isNotEmpty
		 * @param {Object} object 
		 * @return {Boolean} Returns has children
		 */
		"isNotEmpty": function(object) {
			if(!object) {
				return false;
			}
			for(var i in object) {
				return true;
			}
			return false;
		},
		/**
		 * 
		 * TODO: This, in theory, should be removed and leverage the server obscuring data instead, however
		 * 		this is proving expensive
		 * @method getName
		 * @param {RSObject} entity 
		 * @param {RSObject} object 
		 * @return {String} The name of the object according to the passed entity
		 */
		"getName":function(entity, object) {
			if(object.must_know) {
				if(entity) {
					if(isNaN(object.must_know)) {
						if(entity.knowledge_matrix[object.must_know] && entity.knowledge_matrix[object.must_know].length !== 0) {
							return object.name;
						}
					} else if(entity.knowledge_matrix[object.id] && object.must_know <= entity.knowledge_matrix[object.id].length) {
						return object.name;
					}
				}
				if(object.concealment && object.concealment.name) {
					return object.concealment.name;
				}
				return "Unknown";
			} else {
				return object.name;
			}
		},
		/**
		 * TODO: Expand to handle more specific cases
		 * TODO: This, in theory, should be removed and leverage the server obscuring data instead, however
		 * 		this is proving expensive
		 * @method getKnownProperty
		 * @param {RSObject} entity 
		 * @param {RSObject} object 
		 * @param {String} property 
		 * @return {String} The name of the object according to the passed entity
		 */
		"getKnownProperty":function(entity, object, property) {
			if(object.must_know) {
				if(isNaN(object.must_know)) {
					if(entity.knowledge_matrix[object.must_know] && entity.knowledge_matrix[object.must_know].length !== 0) {
						return object[property];
					}
				} else if(entity.knowledge_matrix[object.id] && object.must_know <= entity.knowledge_matrix[object.id].length) {
					return object[property];
				}
				if(object.concealment && object.concealment[property]) {
					return object.concealment[property];
				}
				return "Unknown";
			} else {
				return object[property];
			}
		},
		/**
		 * 
		 * @method showInfo
		 * @deprecated Use embeded `info` method from storage component. View/Base/Target break up has been replaced by object references.
		 * @param {Object} view 
		 * @param {Object} base 
		 * @param {Object} target 
		 */
		"showInfo": function(view, base, target) {
			if(view && view.id && rsSystem.utility.isOwner(view)) {
				rsSystem.EventBus.$emit("display-info", {
					"target": target,
					"record": view,
					"base": base
				});
			}
		},
		/**
		 *
		 * @method sortByID
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByID": function(a, b) {
			if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
				return 1;
			} else if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
				return -1;
			}
			if(a.ordering !== undefined && b.ordering !== undefined && a.ordering !== null && b.ordering !== null) {
				if(a.ordering < b.ordering) {
					return -1;
				} else if(a.ordering > b.ordering) {
					return 1;
				}
			}

			if(a.id < b.id) {
				return -1;
			} else if(a.id > b.id) {
				return 1;
			}
			console.error("Matching IDs Found? ", a, b);
			return 0;
		},
		/**
		 *
		 * @method sortByInitiative
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByInitiative": function(a, b) {
			if((a.initiative === undefined || a.initiative === null) && b.initiative !== undefined && b.initiative !== null) {
				return 1;
			} else if((b.initiative === undefined || b.initiative === null) && a.initiative !== undefined && a.initiative !== null) {
				return -1;
			}
			if(a.initiative !== undefined && b.initiative !== undefined && a.initiative !== null && b.initiative !== null) {
				if(a.initiative < b.initiative) {
					return 1;
				} else if(a.initiative > b.initiative) {
					return -1;
				}
			}

			if(a.name < b.name) {
				return -1;
			} else if(a.name > b.name) {
				return 1;
			}
			
			return 0;
		},
		/**
		 *
		 * @method sortByTime
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByTime": function(a, b) {
			if((a.time === undefined || a.time === null) && b.time !== undefined && b.time !== null) {
				return -1;
			} else if((b.time === undefined || b.time === null) && a.time !== undefined && a.time !== null) {
				return 1;
			}
			if(a.time !== undefined && b.time !== undefined && a.time !== null && b.time !== null) {
				if(a.time < b.time) {
					return -1;
				} else if(a.time > b.time) {
					return 1;
				}
			}

			if(a.name < b.name) {
				return 1;
			} else if(a.name > b.name) {
				return -1;
			}
			
			return 0;
		},
		/**
		 *
		 * @method sortByInitiative
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByName": function(a, b) {
			if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
				return 1;
			} else if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
				return -1;
			} else if(a.name < b.name) {
				return -1;
			} else if(a.name > b.name) {
				return 1;
			}
			return 0;
		},
		/**
		 *
		 * @method sortTrueData
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortTrueData": function(a, b) {
			var aName,
				bName;

			if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
				return 1;
			} else if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
				return -1;
			}
			if(a.ordering !== undefined && b.ordering !== undefined && a.ordering !== null && b.ordering !== null) {
				if(a.ordering < b.ordering) {
					return -1;
				} else if(a.ordering > b.ordering) {
					return 1;
				}
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

			if(a.updated || b.updated) {
				if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
					return -1;
				}
				if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
					return 1;
				}

				if((a.updated === undefined || a.updated === null) && b.updated !== undefined && b.updated !== null) {
					return -1;
				}
				if((b.updated === undefined || b.updated === null) && a.updated !== undefined && a.updated !== null) {
					return 1;
				}

				if(a.updated < b.updated) {
					return -1;
				} else if(a.updated > b.updated) {
					return 1;
				}
			}

			if(a.id < b.id) {
				return -1;
			} else if(a.id > b.id) {
				return 1;
			}

			return 0;
		},
		/**
		 *
		 * @method sortData
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortData": function(a, b) {
			var aName,
				bName;

			if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
				return 1;
			} else if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
				return -1;
			}
			if(a.ordering !== undefined && b.ordering !== undefined && a.ordering !== null && b.ordering !== null) {
				if(a.ordering < b.ordering) {
					return -1;
				} else if(a.ordering > b.ordering) {
					return 1;
				}
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

			if(a.updated || b.updated) {
				if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
					return -1;
				}
				if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
					return 1;
				}

				if((a.updated === undefined || a.updated === null) && b.updated !== undefined && b.updated !== null) {
					return -1;
				}
				if((b.updated === undefined || b.updated === null) && a.updated !== undefined && a.updated !== null) {
					return 1;
				}

				if(a.updated < b.updated) {
					return -1;
				} else if(a.updated > b.updated) {
					return 1;
				}
			}

			if(a.id < b.id) {
				return -1;
			} else if(a.id > b.id) {
				return 1;
			}

			return 0;
		}
	};
})();
