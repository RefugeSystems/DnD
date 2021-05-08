/**
 * 
 * @class CalculatorDnD_callbacks
 * @extends Calculator
 * @constructor
 * @static
 */
module.exports = function(universe) {

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
		"cha": "charisma"
	};
	
	
	var diceReductionRegEx = new RegExp("\\+?([0-9a-z\\.]+|\\([0-9+-\\/\\*\\(\\)a-z\\.]+)(d[0-9]+)", "g"),
		calculateSecurityRegEx = new RegExp("^[<>a-zA-Z0-9\\(\\)+-\\/\\* ]*$"),
		variableExpression = new RegExp("([a-z_]+)\\.?([a-z:_]+)?", "g"),
		diceExpression = new RegExp("(\\([^\\)]+\\))?d([0-9]+)"),
		spaces = new RegExp(" ", "g");

	var calculate = function(expression) {
		if(expression && expression[0] === "+") { // Other operators would expressly be an issue
			expression = expression.substring(1);
		}

		if(expression && expression.length < 150 && calculateSecurityRegEx.test(expression)) {
			try {
				return parseInt(Math.floor(eval(expression)));
			} catch(ignored) {
				return expression;
			}
		} else {
			return expression;
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
	 * 
	 * @method process
	 * @param {String} expression
	 * @param {RSObject} [source]
	 * @param {Function} callback
	 */
	this.process = function(expression, source, callback) {
		if(!expression) {
			callback(null, null);
		} else if(typeof(expression) === "number") {
			callback(null, expression);
		}

		var processed = expression,
			collating = 0,
			variables,
			buffer,
			error,
			x,
			
			collate,
			finish;
		
		collate = function(variables) {
			return function(err, value) {
				if(err) {
					error = err;
					callback(err);
				} else {
					try {
						// console.log("Processing: ", variables, " - ", err, value, processed);
						processed = processed.replace(variables.matched, (value || 0));
						// console.log("Processed: ", processed);
						if(!error && --collating === 0) {
							// console.log("Processed: ", processed);
							finish();
						}
					} catch(exception) {
						error = exception;
						callback(error);
					}
				}
			};
		};
		
		finish = function() {
			callback(null, calculate(processed));
		};
			
		if(source) {
			while(variables = variableExpression.exec(expression)) {
				// console.log("Expression: ", expression, variables);
				collating++;
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
				// console.log("Variables: ", variables);
				source.getValue(variables.path, collate(variables));
			}
			
			if(collating === 0) {
				finish();
			}
		} else {
			finish();
		}
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
	 * @param {RSObject} source
	 * @param {Function} callback
	 */
	this.rawDiceRoll = function(expression, source, callback) {
		var dice,
			add,
			x;
			
		dice = this.parseDiceRoll(expression, source);
		expression = calculate(dice.null);
		for(x=0; x<diceOrder.length; x++) {
			if(dice[diceOrder[x]]) {
				add = parseInt(calculate(dice[diceOrder[x]]));
				if(isNaN(add)) {
					add = "(" + dice[diceOrder[x]] + ")" + diceOrder[x];
				} else {
					add = add + diceOrder[x];
				}
				if(expression) {
					expression += " + " + add;
				} else {
					expression = add;
				}
			}
		}
		return expression;
	};

	/**
	 *
	 * @method reduceDiceRoll
	 * @param {String} expression
	 * @param {RSObject} [source] Drives raw arguments for stats such as "str" and "wis".
	 * @param {Function} callback
	 */
	this.reduceDiceRoll = function(expression, source, target, callback) {
		var x, buffer, dice;
		dice = this.parseDiceRoll(expression, source, target);
		expression = calculate(dice.null);
		for(x=0; x<diceOrder.length; x++) {
			if(dice[diceOrder[x]]) {
				if(expression) {
					expression += " + " + (isNaN(buffer = parseInt(calculate(dice[diceOrder[x]])))?dice[diceOrder[x]]:buffer) + diceOrder[x];
				} else {
					expression = (isNaN(buffer = parseInt(calculate(dice[diceOrder[x]])))?dice[diceOrder[x]]:buffer) + diceOrder[x];
				}
			}
		}
		callback(null, expression);
	};

	/**
	 *
	 * @method diceRoll
	 * @param {String} expression
	 * @param {Character | NPC | Monster} [source] Drives raw arguments for stats such as "str" and "wis".
	 * @param {Function} callback
	 */
	this.diceRoll = function(expression, source, callback) {
		var d, x, roll, dice;
		dice = this.parseDiceRoll(expression, source);
		roll = parseInt(calculate(dice.null)) || 0;
		for(d=0; d<diceOrder.length; d++) {
			dice[diceOrder[d]] = parseInt(calculate(dice[diceOrder[d]]));
			for(x=0; x<dice[diceOrder[d]] && !isNaN(dice[diceOrder[d]]); x++) {
				roll += diceRoll(diceOrder[d]);
			}
		}
		return parseInt(roll);
	};
};
