/**
 * 
 * @class CalculatorDnD
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
	
	var diceReductionRegEx = /\+?([0-9a-z\.]+|\([0-9+-\/\*\(\)a-z\.]+)(d[0-9]+)/g;
	var calculateSecurityRegEx = /^[<>a-zA-Z0-9\(\)+-\/\*]*$/;

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
	
	var variableExpression = new RegExp("([a-z_]+)\\.?([a-z:_]+)?", "g"),
		diceExpression = new RegExp("(\([^\)]+\))?d([0-9]+)");

	var diceRoll = function(dice) {
		var roll = parseInt(parseInt(dice.substring(1)) * Math.random()) + 1;
		return roll;
	};
	
	/**
	 * 
	 * @method process
	 * @param {String} expression
	 * @param {RSObject} source
	 * @param {Function} callback
	 */
	this.process = function(expression, source, callback) {
		if(!source) {
			return expression;
		} else if(!expression || typeof(expression) === "number") {
			return expression;
		}

		var processed = expression,
			collating = 0,
			variables,
			buffer,
			error,
			x;
		
		var collate = function(variables) {
			// console.log("Collation: ", variables);
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
							callback(null, processed);
						}
					} catch(exception) {
						error = exception;
						callback(error);
					}
				}
			};
		};
			
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
	};

	/**
	 * Parses a string expression (e.g "con + 1d8") into an object for calculation or
	 * display.
	 * @method parseDiceRoll
	 * @param {String} expression
	 * @param {RSObject} [source] 
	 */
	this.parseDiceRoll = function(expression, source, target) {
		var x, sCasting, tCasting, regex, buffer = [], dice = {};
		if(!expression) {
			return dice;
		} else {
			expression = expression.toString();
		}

		if(source) {
			sCasting = source.castWith || "int";
			sCasting = sCasting.substring(0, 3);
		} else {
			sCasting = "int";
		}
		if(target) {
			tCasting = target.castWith || "int";
			tCasting = tCasting.substring(0, 3);
		} else {
			tCasting = "int";
		}

		if(target && target.castWith && expression.indexOf("target.cast") !== -1) {
			regex = new RegExp("target.cast", "g");
			expression = expression.replace(regex, tCasting);
		}

		if(source && source.castWith && expression.indexOf("cast") !== -1) {
			regex = new RegExp("cast", "g");
			expression = expression.replace(regex, sCasting);
		}

		if(target) {
			for(x=0; x<rollLevelMap.length; x++) {
				regex = new RegExp("target\\." + rollLevelMap[x][0], "g");
				expression = expression.replace(regex, target.level[rollLevelMap[x][1]] || 0);
			}
			for(x=0; x<rollMap.length; x++) {
				regex = new RegExp("target\\." + rollMap[x][0], "g");
				expression = expression.replace(regex, parseInt(Math.floor(((target.sheet?target.sheet:target)[rollMap[x][1]] || 0)/2) - 5));
			}
			for(x=0; x<rollDirectMap.length; x++) {
				regex = new RegExp("target\\." + rollDirectMap[x][0], "g");
				expression = expression.replace(regex, parseInt( (target.sheet?target.sheet:target)[rollDirectMap[x][1]] ) );
			}
		}
		if(source) {
			for(x=0; x<rollLevelMap.length; x++) {
				regex = new RegExp(rollLevelMap[x][0], "g");
				expression = expression.replace(regex, source.level[rollLevelMap[x][1]] || 0);
			}
			for(x=0; x<rollMap.length; x++) {
				regex = new RegExp(rollMap[x][0], "g");
				expression = expression.replace(regex, parseInt(Math.floor(((source.sheet?source.sheet:source)[rollMap[x][1]] || 0)/2) - 5));
			}
			for(x=0; x<rollDirectMap.length; x++) {
				regex = new RegExp(rollDirectMap[x][0], "g");
				expression = expression.replace(regex, parseInt( (source.sheet?source.sheet:source)[rollDirectMap[x][1]] ) );
			}
		}
		expression = expression.replace(/ /g, "");
		x = diceReductionRegEx.exec(expression);
		while(x !== null) {
			buffer.push(x[0]);
			dice[x[2]] = dice[x[2]]?dice[x[2]] + "+" + x[1]:x[1];
			x = diceReductionRegEx.exec(expression);
		}
		for(x=0; x<buffer.length; x++) {
			expression = expression.replace(buffer[x], "");
		}
		dice.null = expression;
		return dice;
	};

	var rawDiceRoll = function(expression, source, target, callback) {
		var x, dice, add;
		dice = parseDiceRoll(expression, source, target);
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

	var reduceDiceRoll = function(expression, source, target, callback) {
		var x, buffer, dice;
		dice = parseDiceRoll(expression, source, target);
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
		return expression;
	};

	var calculateDiceRoll = function(expression, source, target, callback) {
		var d, x, roll, dice;
		dice = parseDiceRoll(expression, source, target);
		roll = parseInt(calculate(dice.null)) || 0;
		for(d=0; d<diceOrder.length; d++) {
			dice[diceOrder[d]] = parseInt(calculate(dice[diceOrder[d]]));
			for(x=0; x<dice[diceOrder[d]] && !isNaN(dice[diceOrder[d]]); x++) {
				roll += diceRoll(diceOrder[d]);
			}
		}
		return parseInt(roll);
	};

	/**
	 * 
	 * @method rawDiceRoll
	 * @param {String} expression
	 * @param {RSObject} source
	 * @param {RSObject} target
	 * @param {Function} callback
	 */
	this.rawDiceRoll = rawDiceRoll;

	/**
	 *
	 * @method diceRoll
	 * @param {String} expression
	 * @param {Character | NPC | Monster} [source] Drives raw arguments for stats such as "str" and "wis".
	 * @param {Character | NPC | Monster} [target] Drives 'target; arguments for stats such as "target.str"
	 * 		and "target.wis".
	 */
	this.diceRoll = calculateDiceRoll;

	/**
	 *
	 * @method reduceDiceRoll
	 * @param {String} expression
	 * @param {Character | NPC | Monster} [source] Drives raw arguments for stats such as "str" and "wis".
	 * @param {Character | NPC | Monster} [target] Drives 'target; arguments for stats such as "target.str"
	 * 		and "target.wis".
	 */
	this.reduceDiceRoll = reduceDiceRoll;
};
