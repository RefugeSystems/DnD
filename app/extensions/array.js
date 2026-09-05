/**
 * When no compare function is specified for the extended array functions, this
 * method is used.
 * 
 * This method checks the initial object for an `equal` method for testing and
 * falls back on comparing the ID of both parameters should they exist.
 * @method DEFAULT_CompareFunction
 * @private
 * @static
 * @param a 
 * @param b 
 * @returns {Boolean}
 */
var DEFAULT_CompareFunction = function(a, b) {
	return a === b || (a.equal && a.equal(b)) || (a && b && a.id && b.id && a.id === b.id);
};

/**
 * Add an item to an array if and only if that item is not currently in this array.
 * @method uniquely
 * @for Array
 * @param {Boolean | Number | String | Object} adding
 * @return {Boolean} Returns true if added, false otherwise.
 */
if(!Array.prototype.uniquely) {
	Array.prototype.uniquely = function(adding) {
		for(var i=0; i<this.length; i++) {
			if(this[i] === adding || (this[i] && this[i].id && adding && adding.id && this[i].id === adding.id) || (this[i] && adding && (this[i].id === adding || adding.id === this[i]))) {
				return false;
			}
		}

		this.push(adding);
		return true;
	};
}

/**
 * Remove an item from an array if and only if that item is currently in this array.
 * @method purge
 * @for Array
 * @param {Boolean | Number | String | Object} removing
 * @return {Boolean} Returns true if removed, false otherwise.
 */
if(!Array.prototype.purge) {
	Array.prototype.purge = function(removing) {
		for(var i=0; i<this.length; i++) {
			if(this[i] === removing || (this[i] && this[i].id && removing && removing.id && this[i].id === removing.id) || (this[i] && removing && (this[i].id === removing || removing.id === this[i]))) {
				this.splice(i, 1);
				return true;
			}
		}

		return false;
	};
}

/**
 *
 * @method contains
 * @for Array
 * @param {Boolean | Number | String | Object} entry
 * @return {Boolean} Returns true if the indicated entry is in the array.
 */
if(!Array.prototype.contains) {
	Array.prototype.contains = function(entry) {
		for(var x=0; x<this.length; x++) {
			if(this[x] && (this[x] === entry.id || this[x].id === entry.id || this[x] === entry || this[x].id === entry)) {
				return true;
			}
		}

		return this.indexOf(entry) !== -1;
	};
}

/**
 * Computes a new array containing ONLY objects contained in both arrays, while attempting to
 * avoid repeats of an object. The comparison is done using one of 3 methods in order:
 *
 * + Using the optional compare function
 * + Using the "equal" function if available on the object
 * + Finally a "===" comparison is used if the above are unavailable
 *
 * Each array is left unmodified and a new array is created.
 *
 * However, the objects in the new array are a reference to the objects in this
 * array.
 * @method intersection
 * @for Array
 * @param {Array} intersecting
 * @param {Function} [compare] A function that takes 2 arguments and returns true if they
 * 		are the same object, false otherwise.
 * @param {Array} [...further] Additional arrays with which to calculate the intersection.
 * @return {Array} The intersection of this array with the source array
 */
if(!Array.prototype.intersection) {
	Array.prototype.intersection = function(intersecting, compare) {
		var p, t, i, add, intersection = [];
		compare = compare || DEFAULT_CompareFunction;

		var process = [intersecting];
		/* Add arbitrary additional arguments to process list if provided */
		for(p=2; p<arguments.length; p++) {
			process.push(arguments[p]);
		}

		for(p=0; p<process.length; p++) {
			for(i=0; i<process[p].length; i++) {
				add = true;
				for(t=0; add && t<this.length; t++) {
					if(compare(this[t], process[p][i])) {
						intersection.uniquely(this[t]);
						add = false;
					}
				}
			}
		}

		return intersection;
	};
}

/**
 * Computes a new array containing only objects in this array that are _not_ in the diff array.
 *
 * ````javascript
 * var x = [new P(1,2), new P(3,4), new P(1,4)];
 * var y = [new P(7,1), new P(3,4), new P(1,4), new P(6,7)];
 * console.log(x.difference(y)); // --> P(1,2)
 * console.log(y.difference(x)); // --> P(7,1), P(6,7)
 * ````
 *
 * The comparison is done using one of 3 methods in order:
 *
 * + Using the optional compare function
 * + Using the "equal" function if available on the object
 * + Finally a "===" comparison is used if the above are unavailable
 *
 * Each array is left unmodified and a new array is created.
 *
 * Note that this is process intensive as every element in this array is compared to every element
 * if the diff array
 * @method difference
 * @for Array
 * @param {Array} diff
 * @param {Function} [compare] A function that takes 2 arguments and returns true if they
 * 		are the same object, false otherwise.
 * @return {Array} The intersection of this array with the source array
 */
if(!Array.prototype.difference) {
	Array.prototype.difference = function(diff, compare) {
		var t, i, add, difference = [];
		compare = compare || DEFAULT_CompareFunction;

		for(t=0; t<this.length; t++) {
			add = true;
			for(i=0; add && i<diff.length; i++) {
				if(compare(this[t], diff[i])) {
					add = false;
				}
			}
			if(add) {
				difference.uniquely(this[t]);
			}
		}

		return difference;
	};
}

/**
 * Computes a new array of the objects contained in both arrays . The comparison is done
 * using one of 3 methods in order:
 *
 * + Using the optional compare function
 * + Using the "equal" function if available on the object
 * + Finally a "===" comparison is used if the above are unavailable
 *
 * Each array is left unmodified and a new array is created.
 *
 * Note that this is a process intensive unification as it uses the comparison operation
 * to ensure each object is unique in the resultant array
 * @method union
 * @for Array
 * @param {Array} unioning
 * @param {Function} [compare] A function that takes 2 arguments and returns true if they
 * 		are the same object, false otherwise.
 * @param {Array} [...further] Additional arrays with which to calculate a union.
 * @return {Array} The intersection of this array with the source array
 */
if(!Array.prototype.union) {
	Array.prototype.union = function(unioning, compare) {
		var p, t, r, add, result = [];
		compare = compare || DEFAULT_CompareFunction;

		var process = [this, unioning];
		/* Add arbitrary additional arguments to process list if provided */
		for(p=2; p<arguments.length; p++) {
			process.push(arguments[p]);
		}

		for(p=0; p<process.length; p++) {
			for(t=0; t<process[p].length; t++) {
				add = true;
				for(r=0; add && r<result.length; r++) {
					if(compare(process[p][t], result[r])) {
						add = false;
					}
				}
				if(add) {
					result.push(process[p][t]);
				}
			}
		}

		return result;
	};
}

/**
 * Uses an optional compare function to determine the sorting for the incoming value into
 * the array and then inserts it into the array at the appropriate location. If no compare
 * function is provided; If the value is a number or string, it will be sorted in ascending
 * order. If the value is an object, it will be sorted by the "time" property if it exists,
 * otherwise by "id".
 * 
 * The compare function needs to only compare 2 values, the insertion sort handles determining
 * what key values to pull from objects and otherwise handling mixed value types.
 * 
 * Additionally, this method only sorts at insertion, the rest of the array is considered to
 * already be sorted by the needed key as desired.
 * @method insert
 * @mutable
 * @chainable
 * @for Array
 * @param {Boolean | Number | String | Object} insert
 * @param {Function} [compare] A function that takes 2 arguments and returns -1, 0, or 1.
 * @return {Array} This array with the value inserted at the appropriate location
 */
if(!Array.prototype.insert) {
	Array.prototype.insert = function(insert, compare, getKey) {
		var stepLimit = 100,
			minV,
			midV,
			maxV,
			minI,
			midI,
			maxI,
			a,
			b,
			c,
			v;

		if(!compare) {
			compare = Array.prototype._insertCompare;
		}
		if(!getKey) {
			getKey = Array.prototype._insertGetKey;
		}

		v = getKey(insert);

		if(this.length) {
			maxI = this.length-1;
			midI = Math.floor(this.length/2);
			minI = 0;
			maxV = getKey(this[maxI]);
			midV = getKey(this[midI]);
			minV = getKey(this[minI]);
			while(1 < maxI - minI && 0 < stepLimit--) {
				a = compare(v, minV);
				b = compare(v, midV);
				c = compare(v, maxV);
				if(a === 0 || a === -1) {
					// Less than or equal to the min, insert at the beginning
					this.splice(minI, 0, insert);
					return this;
				} else if(b === 0) {
					// Magically equal to the middle so insert next to it
					this.splice(midI, 0, insert);
					return this;
				} else if(c === 0 || c === 1) {
					// We're more than the max, so insert after it
					this.splice(maxI + 1, 0, insert);
					return this;
				} else if(a === 1 && b === -1) {
					// We're in the first half, update and prepare to retest
					maxI = midI;
					midI = Math.floor((minI + maxI)/2);
					maxV = getKey(this[maxI]);
					midV = getKey(this[midI]);
				} else if(b === 1 && c === -1) {
					// We're in the second half, update and prepare to retest
					minI = midI;
					midI = Math.floor((minI + maxI)/2);
					minV = getKey(this[minI]);
					midV = getKey(this[midI]);
				} else {
					// This should never happen, but if it does, just push to the end
					console.warn("Array.insert: Unable to determine insertion point for value, pushing to end of array", insert);
					this.push(insert);
					return this;
				}
			}
			if(minI - maxI <= 1) {
				console.log("Insertion Point[" + stepLimit + "]: ", minI, midI, maxI, minV, midV, maxV);
				this.splice(minI === maxI ? minI : maxI, 0, insert);
			}
		} else {
			this.push(insert);
		}

		if(stepLimit <= 0) {
			console.error("Array.insert: Step limit exceeded, unable to determine insertion point for value", insert);
		}

		return this;
	};

	Array.prototype._insertCompare = function(a, b) {
		if(a === b) {
			return 0;
		} else if(a < b) {
			return -1;
		} else {
			return 1;
		}
	};

	Array.prototype._insertGetKey = function(obj) {
		if(typeof(obj) === "string") {
			return obj.toLowerCase();
		} else if(typeof(obj) === "number") {
			return obj;
		} else if(typeof(obj) === "object") {
			if(obj.time) {
				return obj.time;
			} else {
				return obj.id;
			}
		}
	};
}
