/**
 * Handles parsing a string into a search query and represents the query
 * to be performed. Field searchs can be modified manually via methods.
 * @class RSSearch
 * @constructor
 * @module Common
 * @param {String} query The search query to parse.
 * @param {Boolean} [and] Whether to use AND or OR for the search. Defaults to true.
 * @param {Object} [universe] Optional specification of the universe to search in.
 */
class RSSearch {
	constructor(query, and, universe) {
		this.universe = universe || rsSystem.universe;
		this.and = and === undefined?true:!!and;

		this.flag = null;
		this.fields = [];
		this.field = {};
		this.base = [];

		this.parse(query, this);
	}

	/**
	 * 
	 * @method setModeAnd
	 */
	setModeAnd() {
		this.flag = null;
		this.and = true;
	}

	/**
	 * 
	 * @method setModeOr
	 */
	setModeOr() {
		this.flag = null;
		this.and = false;
	}

	/**
	 * 
	 * @method clear
	 */
	clear() {
		this.flag = null;
		for(var i=0; i<this.fields.length; i++) {
			delete(this.field[this.fields[i]]);
		}
		this.fields.splice(0);
		this.base.splice(0);
	}

	/**
	 * 
	 * @method addQuery
	 * @param {String} query To add to the search.
	 * @returns {Object} The changes to the object.
	 */
	addQuery(query) {
		this.flag = null;
		return this.parse(query, this);
	}

	/**
	 * 
	 * @method removeQuery
	 * @param {String} query 
	 * @returns {Object} The changes to the object.
	 */
	removeQuery(query) {
		var delta = this.parse(query),
			i,
			j;

		this.flag = null;
		if(delta) {
			for(i=0; i<delta.base.length; i++) {
				this.removeQueryValue(delta.base[i]);
			}
			for(i=0; i<delta.fields.length; i++) {
				for(j=0; j<delta.field[delta.fields[i]].length; j++) {
					this.removeQueryValue(delta.field[delta.fields[i]][j], delta.fields[i]);
				}
			}
		}

		return delta;
	}

	/**
	 * 
	 * @method addQueryValue
	 * @param {*} value 
	 * @param {String} [field] Optional field under which to add the search value.
	 */
	addQueryValue(value, field) {
		this.flag = null;
		if(field) {
			if(!this.field[field]) {
				this.fields.push(field);
				this.field[field] = [];
			}
			this.field[field].push(value);
		} else {
			this.base.push(value);
		}
	}

	/**
	 * 
	 * @method removeQueryValue
	 * @param {*} value 
	 * @param {String} field Optional field under which to remove the search value.
	 */
	removeQueryValue(value, field) {
		var index;
		this.flag = null;
		if(field) {
			if(this.field[field]) {
				if((index = this.field[field].indexOf(value)) !== -1) {
					this.field[field].splice(index, 1);
				}
				if(this.field[field].length === 0) {
					this.fields.splice(this.fields.indexOf(field), 1);
					Vue.delete(this.field, field);
				}
			}
		} else {
			if((index = this.base.indexOf(value)) !== -1) {
				this.base.splice(index, 1);
			}
		}
	}

	/**
	 * 
	 * @method isFound
	 * @param {RSObject} object The object to check.
	 * @returns {Boolean} Indicates whether the object matches the search.
	 */
	isFound(object) {
		var lowered,
			fields,
			search,
			field,
			term,
			res,
			num,
			i,
			j,
			k;

		if(!this.universe.isValid(object)) {
			return false;
		}

		if(this.base.length === 0 && this.fields.length === 0) {
			return true;
		}

		lowered = {};
		fields = [];
		for(i=0; i<this.fields.length; i++) {
			fields.push(this.universe.index.fields[this.fields[i]]);
		}

		for(i=0; i<this.base.length; i++) {
			res = object._search.indexOf(this.base[i]);
			if(res === -1 && this.and) {
				return false;
			} else if(res !== -1 && !this.and) {
				return true;
			}
		}

		for(i=0; i<fields.length; i++) {
			field = fields[i];
			if(field) {
				if(this.field[field.id] && this.field[field.id].length) {
					if((object[field.id] !== null && object[field.id] !== undefined) || (field.type === "boolean")) {
						if(field.inheritable && field.type !== "array" && field.type !== "object" && field.type !== "object:dice" && field.type !== "object:calculated") {
							search = this.universe.get(object[field.id]);
							if(rsSystem.utility.isValid(search)) {
								for(j=0; j<this.field[field.id].length; j++) {
									term = this.field[field.id][j];
									res = search._search.indexOf(term);
									if(res === -1 && this.and) {
										return false;
									} else if(res !== -1 && !this.and) {
										return true;
									}
								}
							}
						} else {
							for(j=0; j<this.field[field.id].length; j++) {
								term = this.field[field.id][j];
								if((term !== undefined && term !== null && term !== "")) {
									// switch(typeof(object[field.id])) {
									switch(field.type) {
										case "calculated":
										case "integer":
										case "number":
										case "date":
										case "time":
											if(!lowered[field.id]) {
												lowered[field.id] = (object[field.id]).toString();
											}
											num = parseInt(term.substring(1));
											switch(term[0]) {
												case "<":
													if(object[field.id] >= num && this.and) {
														return false;
													} else if(object[field.id] <= num && !this.and) {
														return true;
													}
													break;
												case ">":
													if(object[field.id] <= num && this.and) {
														return false;
													} else if(object[field.id] >= num && !this.and) {
														return true;
													}
													break;
												case "=":
													if(object[field.id] !== num && this.and) {
														return false;
													} else if(object[field.id] === num && !this.and) {
														return true;
													}
													break;
												default:
													res = lowered[field.id].indexOf(term);
													if(res === -1 && this.and) {
														return false;
													} else if(res !== -1 && !this.and) {
														return true;
													}
													break;
											}
											break;
										case "markdown":
										case "string":
										case "icon":
											if(!lowered[field.id]) {
												lowered[field.id] = object[field.id].toLowerCase();
											}
											res = lowered[field.id].indexOf(term);
											if(res === -1 && this.and) {
												return false;
											} else if(res !== -1 && !this.and) {
												return true;
											}
											break;
										case "boolean":
											if(!lowered[field.id]) {
												lowered[field.id] = !!object[field.id];
											}
											term = this.parseBoolean(term);
											if(term === null) {
												// Help the user catch typos
												this.flag = "unsearchable";
												return false;
											} if(term !== lowered[field.id] && this.and) {
												return false;
											} else if(term === lowered[field.id] && !this.and) {
												return true;
											}
											break;
										case "object:calculated":
										case "object:dice":
										case "object":
											res = JSON.stringify(object[field.id]).toLowerCase().indexOf(term);
											if(res === -1 && this.and) {
												return false;
											} else if(res !== -1 && !this.and) {
												return true;
											}
											/*
											if(object[field.id] instanceof Array) {
												res = object[field.id].indexOf(term);
												if(res === -1) {
													for(k=0; k<object[field.id].length && res === -1; k++) {
														if(typeof(object[field.id][k]) === "string") {
															res = object[field.id][k].toLowerCase().indexOf(term);
														}
													}
												}
												if(res === -1 && this.and) {
													return false;
												} else if(res !== -1 && !this.and) {
													return true;
												}
											} else {
												// Not currently searchable for cleanliness reasons
												this.flag = "unsearchable";
											}
											*/
											break;
										case "array":
											if(object[field.id] instanceof Array) {
												res = object[field.id].indexOf(term);
												if(res === -1) {
													for(k=0; k<object[field.id].length && res === -1; k++) {
														if(typeof(object[field.id][k]) === "string") {
															res = object[field.id][k].toLowerCase().indexOf(term);
														}
													}
												}
												if(res === -1 && this.and) {
													return false;
												} else if(res !== -1 && !this.and) {
													return true;
												}
											} else {
												res = JSON.stringify(object[field.id]).toLowerCase().indexOf(term);
												if(res === -1 && this.and) {
													return false;
												} else if(res !== -1 && !this.and) {
													return true;
												}
											}
											break;
										default:
											if(this.and && object[field.id] != term) {
												return false;
											} else if(!this.and && object[field.id] == term) {
												return true;
											}
											break;
									}
								}
							}
						}
					} else if(this.and) {
						return false;
					}
				} else if(this.and) {
					return false;
				}
			} else {
				this.flag = "unsearchable";
				return false;
			}
		}

		return this.and;
	}

	/**
	 * Parses the query into a search object.
	 * @method parse
	 * @param {String} query The search query to parse.
	 * @param {Object} append The search object to append to.
	 * @return {Object} The changes to the object.
	 */
	parse(query, append) {
		this.flag = null;
		var quoted = false,
			delta = {},
			field,
			last,
			part,
			term,
			add,
			i;
			
		if(!query) {
			return null;
		}

		query = query.toLowerCase();
		delta.fields = [];
		delta.field = {};
		delta.base = [];
		add = function() {
			if(field) {
				if(append) {
					if(!append.field[field]) {
						append.field[field] = [];
						append.fields.push(field);
					}
					append.field[field].push(term);
				}
				if(!delta.field[field]) {
					delta.field[field] = [];
					delta.fields.push(field);
				}
				delta.field[field].push(term);
				field = null;
			} else {
				delta.base.push(term);
				if(append) {
					append.base.push(term);
				}
			}
			term = "";
		};
		
		term = "";
		for(i=0; i<query.length; i++) {
			last = part;
			part = query[i];
			if(quoted) {
				if(part === "\"" && last !== "\\") {
					add();
				} else if(part !== "\\") {
					term += part;
				}
			} else {
				if(last === "\\") {
					term += part;
				} else {
					switch(part) {
						case ":":
							field = term;
							term = "";
							break;
						case "\"":
							quoted = true;
							term = "";
							break;
						case "\\":
							break;
						case " ":
							add();
							break;
						default:
							term += part;
							break;
					}
				}
			}
		}

		if(term) {
			add();
		}

		return delta;
	}

	/**
	 * Used to translate user entered term to a boolean for comparisons in the isFound method.
	 * 
	 * Not that the term would already be in lower case from this and thus case is not
	 * addressed here.
	 * @method parseBoolean
	 * @param {String} term 
	 * @returns {Boolean}
	 */
	parseBoolean(term) {
		if(term === "true" || term === "yes" || term === "1" || term === "on" || term === "enabled" || term === "active" || term === "positive") {
			return true;
		} else if(term === "false" || term === "no" || term === "0" || term === "off" || term === "disabled" || term === "inactive" || term === "negative") {
			return false;
		}
		return null;
	}

	/**
	 * Returns the search query as a string.
	 * @method toString
	 * @return {String} The search query.
	 */
	toString() {
		var fields = Object.keys(this.field),
			query = this.base.join(" "),
			field,
			i;

		for(i=0; i<fields.length; i++) {
			field = fields[i];
			query += " " + field + ":\"" + this.field[field].join("\" " +  field + ":\"") + "\"";
		}

		return query.trim();
	}
}

if(typeof module !== "undefined") {
	module.exports = RSSearch;
}
