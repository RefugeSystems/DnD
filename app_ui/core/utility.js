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
			location.reload(true);
			/* TODO: Implement Server side cache clearing response or signal to the ServiceWorker */
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
