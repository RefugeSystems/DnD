/**
 *
 * @class String
 * @constructor
 */

/**
 *
 * @method capitalize
 * @return {String}
 */
String.prototype.capitalize = function() {
	if(this.length) {
		return this[0].toUpperCase() + this.substring(1);
	}
	return this;
};

/**
 *
 * @method pluralize
 * @param {Boolean} capitalize
 * @return {String}
 */
String.prototype.pluralize = function(capitalize) {
	var plural;

	switch(this[this.length-1]) {
		case "y":
			plural = this.substring(0, this.length-1) + "ies";
			break;
		case "s":
			plural = this;
			break;
		default:
			plural = this + "s";
	}

	if(capitalize) {
		return plural[0].toUpperCase() + plural.substring(1);
	} else {
		return plural;
	}
};


/**
 *
 * @class Array
 * @constructor
 */

/**
 * Add an item to an array if and only if that item is not currently in this array.
 * @method uniquely
 * @for Array
 * @param {Boolean | Number | String | Object} adding
 * @return {Boolean} Returns true if added, false otherwise.
 */
if(!Array.prototype.uniquely) {
	Array.prototype.uniquely = function(adding) {
		if(this.indexOf(adding) === -1) {
			this.push(adding);
			return true;
		}
		return false;
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
		var index = this.indexOf(removing);
		if(index === -1) {
			return false;
		}
		this.splice(index, 1);
		return true;
	};
}

/**
 * Handles determining if the indicated entry is within this array leveraging the "id"
 * property of objects but also checks for literals.
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
		compare = compare || function(a, b) {return (a.equal && a.equal(b)) || a === b;};

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
		compare = compare || function(a, b) {return (a.equal && a.equal(b)) || a === b;};

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
		compare = compare || function(a, b) {return (a.equal && a.equal(b)) || a === b;};

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
 *
 * @method hasCommon
 * @for Array
 * @param {Array} withArray
 * @return {Boolean} The intersection of this array with the source array
 */
if(!Array.prototype.hasCommon) {
	Array.prototype.hasCommon = function(withArray) {
		if(this.length && withArray && withArray.length) {
			var trace = {},
				i;
			for(i=0; i<this.length; i++) {
				if(this[i]) {
					trace[this[i].id || this[i]] = this[i];
				}
			}
			for(i=0; i<withArray.length; i++) {
				if(withArray[i] && trace[withArray[i].id || withArray[i]]) {
					return true;
				}
			}
		}

		return false;
	};
}

(function() {
	var sortBySorters = {};

	Array.prototype.sortBy = function(field) {
		if(!sortBySorters[field]) {
			sortBySorters[field] = function(a, b) {
				if(a[field] < b[field]) {
					return -1;
				} else if(a[field] > b[field]) {
					return 1;
				} else {
					return 0;
				}
			};
		}

		this.sort(sortBySorters[field]);
	};
})();

/**
 * 
 * @for CanvasRenderingContext2D
 * @method roundRect
 * @see https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
 * @author jhoff
 * @author Grumdrig
 * @param {Number} x
 * @param {Number} y
 * @param {Number} w
 * @param {Number} h
 * @param {Number} r
 */
if(!CanvasRenderingContext2D.prototype.roundRect) {
	CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
		if (w < 2 * r) {
			r = w / 2;
		}
		if (h < 2 * r) {
			r = h / 2;
		}
		this.beginPath();
		this.moveTo(x+r, y);
		this.arcTo(x+w, y,   x+w, y+h, r);
		this.arcTo(x+w, y+h, x,   y+h, r);
		this.arcTo(x,   y+h, x,   y,   r);
		this.arcTo(x,   y,   x+w, y,   r);
		this.closePath();
		return this;
	};
}


/**
 * 
 * @for CanvasRenderingContext2D
 * @method fillIcon
 * @see https://stackoverflow.com/questions/63601531/draw-font-awesome-icons-to-canvas-based-on-class-names
 * @author tdon
 * @param {String} class_string For example "fas fa-bell rs-red"
 * @param {Number} x
 * @param {Number} y
 */
 if(!CanvasRenderingContext2D.prototype.fillIcon) {
	CanvasRenderingContext2D.prototype.fillIcon = function (class_string, x, y) {
		const i = document.createElement("i");
		i.setAttribute("class", class_string);
		document.body.appendChild(i);

		// get the styles for the icon you just made
		const iStyles = window.getComputedStyle(i),
			iBeforeStyles = window.getComputedStyle(i, ":before"),

			fontFamily = iStyles.getPropertyValue("font-family"),
			fontWeight = iStyles.getPropertyValue("font-weight"),
			fontSize = "40px", // just to make things a little bigger...

			canvasFont = `${fontWeight} ${fontSize} ${fontFamily}`, // should be something like: '900 40px "Font Awesome 5 Pro"'
			icon = String.fromCodePoint(iBeforeStyles.getPropertyValue("content").codePointAt(1)); // codePointAt(1) because the first character is a double quote

		this.font = canvasFont;
		this.textBaseline = "middle";
		this.textAlign = "center";
		this.fillText(icon, x, y);
	};
}
