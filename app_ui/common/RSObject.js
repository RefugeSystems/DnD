/**
 *
 * @class RSObject
 * @extends EventEmitter
 * @constructor
 * @module Common
 * @param {Object} details Source information to initialize the object
 * 		received from the Universe.
 */
class RSObject extends EventEmitter {
	constructor(details, universe) {
		super();
		this.universe = universe;
		this._replacedReferences = {};
		this._sourceData = _p(details);
		this._statContributions = {};
		this._relatedErrors = {};
		this._coreData = {};
		this._registered = {};
		this._knownKeys = [];
		this._formulas = {};
		this._owner = null;
		this._loading = {};
		this._known = {};
		this._mods = [];
		this._shadow = JSON.parse(JSON.stringify(details));
		this._actionsRecent = [];
		this._actionsLimit = 5;
		this._listeningParentCycle = 0;
		this._listeningParent = () => {
			var now = Date.now();
			if(this.universe.initialized && this._listeningParentCycle < now) {
				this._listeningParentCycle = now + 1000;
				this.recalculateProperties();
			}
			if(rsSystem.debug && this._listeningParentCycle >= now) {
				console.log("Recycling: ", this);
			}
		};

		this._registered._marked = Date.now();
		var keys = Object.keys(details),
			x;

		for(x=0; x<keys.length; x++) {
			this._coreData[keys[x]] = details[keys[x]];
			this[keys[x]] = details[keys[x]];
		}

		this._coreData.description = details.description;
		this._coreData.name = details.name;
		this._modifiers = [];
		this.id = details.id;
	}

	recalculateProperties() {
		console.log("Recalculate");
		this._search = this.id;
		if(this.description) {
			this._search += " | " + this.description;
		}
		if(this.points) {
			this._search += " | points:" + this.points;
		}
	}

	receiveState(state) {
		console.log("State");
		var change = {},
			keys,
			x;

		keys = Object.keys(state);
		for(x=0; x<keys.length; x++) {
			if(keys[x][0] !== "_" && keys[x][0] !== "+" && keys[x][0] !== "-" && keys[x][0] !== "$") {
				if(this[keys[x]] !== state[keys[x]]) {
					this[keys[x]] = state[keys[x]];
					change[keys[x]] = state[keys[x]];
				}
			}
		}

		this.$emit("modified", change);
	}

	receiveUpdate(change) {
		console.log("Update");
		var keys,
			x;

		if(change["+delta"]) {
			keys = Object.keys(change["+delta"]);
			for(x=0; x<keys.length; x++) {
				this[keys[x]] = this.processAsAdditive(this[keys[x]], change["+delta"][keys[x]]);
			}
		}

		if(change["-delta"]) {
			keys = Object.keys(change["-delta"]);
			for(x=0; x<keys.length; x++) {
				this[keys[x]] = this.processAsSubtractive(this[keys[x]], change["-delta"][keys[x]]);
			}
		}

		keys = Object.keys(change);
		for(x=0; x<keys.length; x++) {
			if(keys[x][0] !== "_" && keys[x][0] !== "+" && keys[x][0] !== "-" && keys[x][0] !== "$") {
				this[keys[x]] = change[keys[x]];
			}
		}

		this.$emit("modified", change);
	}

	/**
	 *
	 * @method commit
	 * @param {Object} change
	 */
	commitUpdate(change, add, sub) {
		console.log("Commit");
		change = change || {};
		change._class = this._class;
		change.id = this.id;

		if(add) {
			change["+delta"] = add;
		}
		if(sub) {
			change["-delta"] = sub;
		}

		this.universe.send("modify:noun", {"id": this.id, "classed": this._class, "change": change});
	}

	/**
	 *
	 * @method toJSON
	 * @return {Object}
	 */
	toJSON() {
		console.log("JSON");
		var keys = Object.keys(this._coreData),
			json = {},
			value,
			x;

		for(x=0; x<keys.length; x++) {
			// Fields matching ^[_\$\#] are for data handling and should not be considered in stringification and other conversions
			// Universe field is reserved property and shouldn't come out either
			if(keys[x] && keys[x] !== "universe" && keys[x][0] !== "_" && keys[x][0] !== "$" && keys[x][0] !== "#") {
				value = this[keys[x]];
				switch(typeof(value)) {
					case "number":
					case "string":
					case "boolean":
					case "boolean":
						json[keys[x]] = value;
						break;
					case "object":
						// RSObjects should be flat but arrays are valid
						if(value instanceof Array) {
							json[keys[x]] = value;
						}
						break;
					case "function":
						// Ignored
				}
			}
		}

		json._class = this._class;
		json._type = this._class || this._type;

		return json;
	}

	performActionEvent(event) {
		this._actionsRecent.push(event);
		if(this._actionsLimit < this._actionsRecent.length) {
			this._actionsRecent.splice(this._actionsLimit);
		}

		// TODO: Flush out actions

		this.$emit("acted:" + event.type, this);
	}

	/**
	 *
	 * @method processAsAdditive
	 * @param {Number | Array} a Value from the referenced record
	 * @param {Number | Array | Object} b Value coming in on which to update
	 * @return {Number | Array} The resulting value from the subtraction process.
	 */
	processAsAdditive(a, b) {
		if(!a) {
			if(typeof(b) === "number") {
				return parseFloat(b.toFixed(2));
			}
			return b;
		}

		if(typeof(a) === "number") {
			return parseFloat((a + (b || 0)).toFixed(2));
		} else if(a instanceof Array) {
			if(b instanceof Array) {
				a.push.apply(a, b);
			} else {
				a.push(b);
			}
			return a;
		} else if(typeof(a) === "string") {
			return a + b;
		}
	}

	/**
	 *
	 * @method processAsSubtractive
	 * @param {Number | Array} a Value from the referenced record
	 * @param {Number | Array | Object} b Value coming in on which to update
	 * @return {Number | Array} The resulting value from the subtraction process.
	 */
	processAsSubtractive(a, b) {
		var index,
			x;

		if(typeof(a) === "number") {
			return parseFloat((a - b).toFixed(2));
		} else if(a instanceof Array) {
			if(b instanceof Array) {
				for(x=0; x<b.length; x++) {
					index = a.indexOf(b[x]);
					if(index !== -1) {
						a.splice(index, 1);
					}
				}
			} else {
				index = a.indexOf(b);
				if(index !== -1) {
					a.splice(index, 1);
				}
			}
			return a;
		} else if(typeof(a) === "string" && typeof(b) === "string") {
			index = a.indexOf(b);
			if(index !== -1) {
				a = a.substring(0, index) + a.substring(index + b.length);
			}
			return a;
		} else if(!a && typeof(b) === "number") {
			return -1 * parseFloat(b.toFixed(2));
		}
	}


	retrieveData() {
		if(!this._loading.data) {
			this._loading.data = setTimeout(() => {
				if(this._loading.data) {
					console.warn("Data load for object[" + this.id + "] timed out");
					delete(this._loading.data);
				}
			}, RSObject.loadTimeout);
			this.universe.send("data:retrieve", {
				"_class": this._class,
				"id": this.id
			});
		}
	}

	isOwner(id) {
		if(this._owner) {
			return !!this._owner[id];
		} else if(this.owners) {
			return this.owners.indexOf(id) !== -1;
		}
		return false;
	}

	isEqual(compare) {
		if(!compare) {
			return false;
		}

		return this.id === compare.id;
	}
}

RSObject.loadTimeout = 5000;
