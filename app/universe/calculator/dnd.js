/**
 * 
 * @class CalculatorDnD
 * @extends Calculator
 * @constructor
 * @static
 */
module.exports = function(universe) {
	
	var debug = false;

	var rollMap = [
		["str", "strength"],
		["dex", "dexterity"],
		["con", "constitution"],
		["int", "intelligence"],
		["wis", "wisdom"],
		["cha", "charisma"]
	];
	
	var shortHand = {
		"str": "strength",
		"dex": "dexterity",
		"con": "constitution",
		"int": "intelligence",
		"wis": "wisdom",
		"cha": "charisma",
		"pro": "proficiency_rating"
	};
	
	
	var diceReductionRegEx = new RegExp("\\+?([0-9a-z\\.]+|\\([0-9+-\\/\\*\\(\\)a-z\\. ]+?\\))(d[0-9]+)", "g"),
		calculateSecurityRegEx = new RegExp("^([<>a-zA-Z0-9\\(\\)+-\\/\\* ]+|Math\\.[a-zA-Z]+)$"),
		variableExpression = new RegExp("([a-z_]+)(\\.?[a-z:_]+)*", "gi"),
		diceExpression = new RegExp("(\\([^\\)]+\\))?d([0-9]+)"),
		spaces = new RegExp(" ", "g"),
		zeros = new RegExp("(null|undefined)", "g"),
		maths = new RegExp("([^a-zA-Z_.])(min|max)\\(", "g");

	var calculate = function(original) {
		if(original && original[0] === "+") { // Other operators would expressly be an issue
			original = original.substring(1);
		}

		if(debug) {
			console.log(" > Seen: " + original);
		}
		var expression = original.replace(maths, "$1Math.$2(").replace(zeros, "0");
		if(debug) {
			console.log(" > Expanded: " + expression);
		}

		if(expression && expression.length < 150 && calculateSecurityRegEx.test(expression)) {
			// console.log("Valid Expression");
			try {
				if(debug) {
					console.log(" > Result: ", parseInt(Math.floor(eval(expression))));
				}
				return parseInt(Math.floor(eval(expression)));
			} catch(ignored) {
				// console.log("Bad Expression: ", ignored);
				return original;
			}
		} else {
			// console.log("Invalid Expression");
			return original;
		}
	};

	var diceOrder = [
		"d4",
		"d6",
		"d8",
		"d10",
		"d12",
		"d20",
		"d100"
	];
	
	var diceValue = {
		"d4": 4,
		"d6": 6,
		"d8": 8,
		"d10": 10,
		"d12": 12,
		"d20": 20,
		"d100": 100
	};
	

	/**
	 * 
	 * @method diceRoll
	 * @param {String} dice ie. d6 or d27319
	 * @return {Integer} Value determined for the die roll.
	 */
	var diceRoll = function(dice) {
		var roll = parseInt(parseInt(dice.substring(1)) * Math.random()) + 1;
		return roll;
	};
	
	/**
	 * Relies on Universe inheritance tracking to ensure required objects are
	 * loaded and computes values based on their _calculated properties.
	 * @method compute
	 * @param {String} expression [description]
	 * @param {RSObject} source     [description]
	 * @param {Array} [referenced] Stores the sources for variables that were
	 * 		calculated for update response purposes.
	 * @return {Number}
	 */
	this.compute = function(expression, source, referenced) {
		referenced = referenced || [];
		if(!expression) {
			return 0;
		} else if(typeof(expression) === "number") {
			return expression;
		}

		var processed = expression,
			variables,
			matched,
			value,
			path,
			x;
		
		if(debug) {
			console.log("Compute: ", expression);
		}
		if(source) {
			while(variables = variableExpression.exec(expression)) {
				if(debug) {
					console.log(" > Expression: ", expression, variables);
				}
				path = [].concat(variables);
				matched = path.shift();
				for(x=0; x<path.length; x++) {
					if(shortHand[path[x]]) {
						path[x] = shortHand[path[x]];
					} else if(!path[x]) {
						path.splice(x);
					}
				}
				value = source.calculatedValue(path, referenced);
				if(value !== undefined && value !== null) {
					// console.log(" > Computed Value[" + path.join() + "]: " + value);
					processed = processed.replace(matched, value);
				}
			}
		}

		if(processed !== expression) {
			// Rerun until we "stabilize" to detect arbitrary depth in referencing
			return this.compute(processed, source, referenced);
		} else {
			return calculate(processed);
		}
	};
	
	
	/**
	 * 
	 * @method process
	 * @param {String} expression
	 * @param {RSObject} [source]
	 * @return {Promise}
	 */
	this.process = function(expression, source) {
		return new Promise((done, fail) => {
			if(!expression) {
				done(0);
			} else if(typeof(expression) === "number") {
				done(expression);
			} else {
				var processed = expression,
					collating = [],
					variables,
					collate,
					buffer,
					error,
					x;
				
				collate = function(variables) {
					return new Promise((done, fail) => {
						source.promiseValue(variables.path)
						.then((value) => {
							if(debug) {
								console.log("Process Collation: ", variables, value);
							}
							processed = processed.replace(variables.matched, (value || 0));
							done();
						})
						.catch(fail);
					});
				};
					
				if(source) {
					if(debug) {
						console.log("Source: " + source.id);
					}
					while(variables = variableExpression.exec(expression)) {
						if(debug) {
							console.log("Expression: ", expression, variables);
						}
						variables = {
							"path": [].concat(variables),
							"matched": variables[0],
							"index": variables.index
						};
						variables.path.shift();
						for(x=0; x<variables.path.length; x++) {
							if(shortHand[variables.path[x]]) {
								variables.path[x] = shortHand[variables.path[x]];
							} else if(!variables.path[x]) {
								variables.path.splice(x);
							}
						}
						if(debug) {
							console.log("Variables: ", variables);
						}
						collating.push(collate(variables));
					}
				}
				
				Promise.all(collating)
				.then(function() {
					if(debug) {
						console.log("Calculate: ", processed);
					}
					done(calculate(processed));
				})
				.catch(fail);
			}
		});
	};

	/**
	 * Parses a string expression (e.g "con + 1d8") into an object for calculation or
	 * display.
	 *
	 * Complex parenthetical expressions are NOT supported as this operation does not
	 * perserve order and only supports single locations for dice. Thus the below is
	 * not a valid expression for this function:
	 * (1d6 + int)/2 + 1d6
	 * 
	 * @method parseDiceRoll
	 * @param {String} expression
	 * @return {Object} With the dice names as keys mapping to their indicated counts.
	 * 		The non-dice portion is returned under `remainder`.
	 */
	this.parseDiceRoll = function(expression) {
		var buffer = [],
			dice = {},
			x;
			
		expression = expression.replace(spaces, "");
		x = diceReductionRegEx.exec(expression);
		while(x !== null) {
			buffer.push(x[0]);
			dice[x[2]] = dice[x[2]]?dice[x[2]] + "+" + x[1]:x[1];
			x = diceReductionRegEx.exec(expression);
		}
		for(x=0; x<buffer.length; x++) {
			expression = expression.replace(buffer[x], "");
		}
		dice.remainder = expression;
		return dice;
	};
	
	/**
	 * 
	 * @method rawDiceRoll
	 * @param {String} expression
	 * @param {RSObject} [source]
	 * @return {Promise}
	 */
	this.rawDiceRoll = function(expression, source) {
		return new Promise((done, fail) => {
			var collating = [],
				result = {},
				collate,
				dice,
				add,
				x;
				
			collate = (d) => {
				return new Promise((done, fail) => {
					parseInt(this.process(dice[d]), source)
					.then((add) => {
						if(isNaN(add)) {
							add = "(" + dice[d] + ")" + d;
						} else {
							add = add + d;
						}
						if(expression) {
							expression += " + " + add;
						} else {
							expression = add;
						}
						done();
					})
					.catch(fail);
				});
			};
				
			dice = this.parseDiceRoll(expression);
			expression = this.process(dice.remainder, source);
			for(x=0; x<diceOrder.length; x++) {
				if(dice[diceOrder[x]]) {
					collating.push(collate(diceOrder[x]));
				}
			}
			
			Promise.all(collating)
			.then(function() {
				done(expression);
			})
			.catch(fail);
		});
	};

	/**
	 *
	 * @method reduceDiceRoll
	 * @param {String} expression
	 * @param {RSObject} [source] Drives raw arguments for stats such as "str" and "wis".
	 * @return {Promise}
	 */
	this.reduceDiceRoll = function(expression, source) {
		return new Promise((done, fail) => {
			var collating = [],
				dice,
				x;
			
			dice = this.parseDiceRoll(expression);
			for(x=0; x<diceOrder.length; x++) {
				if(dice[diceOrder[x]]) {
					collating.push(this.process(dice[diceOrder[x]], source));
				} else {
					collating.push(null);
				}
			}
			collating.push(this.process(dice.remainder, source));
			
			Promise.all(collating)
			.then(function(values) {
				var reduced = "";
				for(x=0; x<diceOrder.length; x++) {
					if(values[x]) {
						if(reduced) {
							if(typeof(values[x]) === "number") {
								reduced += " + " + values[x] + diceOrder[x];
							} else {
								reduced += " + (" + values[x] + ")" + diceOrder[x];
							}
						} else {
							if(typeof(values[x]) === "number") {
								reduced = values[x] + diceOrder[x];
							} else {
								reduced = "(" + values[x] + ")" + diceOrder[x];
							}
						}
					}
				}
				
				// Pick up remainder
				if(values[x]) {
					if(reduced) {
						reduced += " + " + values[x];
					} else {
						reduced = values[x];
					}
				}
				
				done(reduced);
			})
			.catch(fail);
		});
	};

	this.debug = function(state) {
		if(state === true || state === false) {
			debug = state;
		}
		return debug;
	};

	/**
	 *
	 * @method rollDice
	 * @param {String} expression
	 * @param {RSObject} [source] Drives raw arguments for stats such as "str" and "wis".
	 * @return {Promise}
	 */
	this.rollDice = function(expression, source) {
		return new Promise((done, fail) => {
			var roll,
				dice,
				d,
				x;
				
			// Collate Dice Counts
			roll = [];
			dice = this.parseDiceRoll(expression);
			for(d=0; d<diceOrder.length; d++) {
				roll.push(this.process(dice[diceOrder[d]], source));
			}
			roll.push(this.process(dice.remainder, source));
			
			// Roll counts
			Promise.all(roll)
			.then(function(values) {
				roll = 0;
				for(d=0; d<diceOrder.length; d++) {
					for(x=0; x<values[d] && !isNaN(values[d]); x++) {
						roll += parseInt(diceValue[diceOrder[d]] * Math.random()) + 1;
						// roll += diceRoll(diceOrder[d]);
					}
				}
				roll += values[d] || 0;
				done(roll);
			})
			.catch(fail);
		});
	};
};
