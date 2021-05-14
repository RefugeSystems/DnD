(function() {
	var skipped = /[^a-zA-Z0-9]/g,
		spacing = /[ _-]/g;

	/**
	 *
	 * @class Utility
	 * @constructor
	 * @static
	 */
	rsSystem.utility = {
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
		 * @method sortData
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortData": function(a, b) {
			var aName,
				bName;

			if(a.order !== undefined && b.order !== undefined && a.order !== null && b.order !== null) {
				if(a.order < b.order) {
					return -1;
				} else if(a.order > b.order) {
					return 1;
				}
			}
			if((a.order === undefined || a.order === null) && b.order !== undefined && b.order !== null) {
				return -1;
			}
			if((b.order === undefined || b.order === null) && a.order !== undefined && a.order !== null) {
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

			if(a.date || b.date) {
				if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
					return -1;
				}
				if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
					return 1;
				}

				if((a.date === undefined || a.date === null) && b.date !== undefined && b.date !== null) {
					return -1;
				}
				if((b.date === undefined || b.date === null) && a.date !== undefined && a.date !== null) {
					return 1;
				}

				if(a.date < b.date) {
					return -1;
				} else if(a.date > b.date) {
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
