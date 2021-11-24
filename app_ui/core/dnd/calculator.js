
/**
 * Simplified calculator for reducing basic expressions on the UI
 * @class Calculator
 * @namespace rsSystem.dnd
 * @constructor
 * @static
 */
(function() {
	rsSystem.dnd = rsSystem.dnd || {};
	rsSystem.dnd.Calculator = {};

	var diceReductionRegEx = new RegExp("\\+?(-?[0-9a-z\\.]+|\\([0-9+-\\/\\*\\(\\)a-z\\. ]+?\\))(d[0-9]+|%)", "g"),
		calculateSecurityRegEx = new RegExp("^([<>a-zA-Z0-9\\(\\)+-\\/\\* ]+|Math\\.[a-zA-Z]+)$"),
		variableExpression = new RegExp("([a-z_]+)(\\.?[a-z:_]+)*", "gi"),
		diceExpression = new RegExp("(\\([^\\)]+\\))?d([0-9]+)"),
		spaces = new RegExp(" ", "g"),
		dots = new RegExp("\\.", "g"),
		zeros = new RegExp("(null|undefined)", "g"),
		maths = new RegExp("([^a-zA-Z_.])?(abs|log|min|max|pow|exp|ceil|floor|random|round|sqrt|sin|cos|tan)\\(", "g"),
		doubled = new RegExp("Math.Math.", "g"); // TODO: Ajust maths regex to accoutn for this AS WELL AS starting a line, which seems to be the issue with the leading "." check

	var debug = false,
		maxDepth = 6,
		calculatedValue,
		shortHand,
		diceOrder,
		diceValue,
		rollMap;

	rollMap = [
		["str", "strength"],
		["dex", "dexterity"],
		["con", "constitution"],
		["int", "intelligence"],
		["wis", "wisdom"],
		["cha", "charisma"]
	];
	
	shortHand = {
		"str": "strength",
		"dex": "dexterity",
		"con": "constitution",
		"int": "intelligence",
		"wis": "wisdom",
		"cha": "charisma",
		"class_level": "archetype_level",
		"proficiency": "proficiency_rating",
		"pro": "proficiency_rating"
	};

	maxDepth = 6;

	diceOrder = [
		"d4",
		"d6",
		"d8",
		"d10",
		"d12",
		"d20",
		"d100"
	];
	
	diceValue = {
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
	 * @method calculatedValue
	 * @param {Object} object
	 * @param {String} name 
	 * @param {Integer} [index] 
	 * @param {Array} [referenced] 
	 * @returns {Integer}
	 */
	 calculatedValue = rsSystem.dnd.calculatedValue = function(object, name, index, referenced) {
		var follow;

		if(typeof(name) === "string") {
			name = name.split(".");
		}
		if(index instanceof Array) {
			referenced = index;
			index = 0;
		} else if(index === undefined || index === null) {
			index = 0;
		}
		
		if(name[index] === "this") {
			return calculatedValue(object, name, index + 1, referenced);
		} else if(index + 1 === name.length) {
			if(referenced) {
				referenced.push(object.id);
			}
			return object[name[index]];
		} else if(typeof(object[name[index]]) === "object" && index + 2 === name.length) {
			if(referenced) {
				referenced.push(object.id);
			}
			if(object[name[index]]) {
				return object[name[index]][name[index + 1]];
			} else {
				return 0;
			}
		} else if(object[name[index]]) {
			// TODO: Refactor to be cleaner or move into a new class where universe is tracked
			follow = rsSystem.universe.getObject(object[name[index]]);
			if(follow) {
				return calculatedValue(follow, name, index + 1, referenced);
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	};

	rsSystem.dnd.Calculator.debug = rsSystem.dnd.debug = function(state) {
		if(state === undefined) {
			return debug;
		} else {
			debug = !!state;
		}
	};


	/**
	 * 
	 * @method getRollResult
	 * @param {Roll} roll 
	 * @param {RSObject} [source]
	 * @return {Integer}
	 */
	rsSystem.dnd.Calculator.getRollResult = rsSystem.dnd.getRollResult = function(roll, source) {
		var result = 0,
			formula,
			percent,
			rolls,
			dice,
			res,
			i,
			j;
		
		if(typeof(roll) === "string") {
			roll = new Roll(roll);
		}

		formula = rsSystem.dnd.parseDiceRoll(rsSystem.dnd.reducedDiceRoll(roll.formula, source));
		dice = Object.keys(formula);
		for(i=0; i<dice.length; i++) {
			rolls = rsSystem.dnd.compute(formula[dice[i]]);
			if(dice[i][0] === "d") {
				if(!roll.dice_rolls[dice[i]]) {
					Vue.set(roll.dice_rolls, dice[i], []);
				}
				for(j=0; j<rolls; j++) {
					res = rsSystem.dnd.diceRoll(dice[i]);
					roll.dice_rolls[dice[i]].push(res);
					result += res;
				}
			}
		}
		if(formula.remainder) {
			result += rsSystem.dnd.compute(formula.remainder);
		}
		if(formula["%"]) {
			percent = rsSystem.dnd.compute(formula["%"]);
			result += Math.floor(result * (percent/100));
		}

		Vue.set(roll, "result", result);
		return roll;
	};

	/**
	 * 
	 * @method diceRoll
	 * @param {String} dice ie. d6 or d27319
	 * @return {Integer} Value determined for the die roll.
	 */
	var diceRoll = rsSystem.dnd.Calculator.diceRoll = rsSystem.dnd.diceRoll = function(dice) {
		return Math.floor(parseInt(dice.substring(1)) * Math.random()) + 1;
	};

	/**
	 * @method calculate
	 * @param {String} original 
	 * @returns {Number}
	 */
	var calculate = rsSystem.dnd.Calculator.calculate = rsSystem.dnd.calculate = function(original) {
		if(original && original[0] === "+") { // Other operators would expressly be an issue
			original = original.substring(1);
		}

		if(debug) {
			console.log(" > Seen: " + original);
		}
		var expression = original.replace(maths, "$1Math.$2(").replace(zeros, "0").replace(doubled, "Math.");
		if(debug) {
			console.log(" > Expanded: " + expression);
		}

		if(expression && expression.length < 150 && calculateSecurityRegEx.test(expression)) {
			// console.log("Valid Expression");
			try {
				if(debug) {
					console.log(" > Result: ", Math.floor(eval(expression)));
				}
				return Math.floor(eval(expression));
			} catch(ignored) {
				// console.log("Bad Expression: ", ignored);
				return original;
			}
		} else {
			// console.log("Invalid Expression");
			return original;
		}
	};

	/**
	 * 
	 * @method compute
	 * @param {String} expression 
	 * @param {Object} [source] 
	 * @param {Array} [referenced] 
	 * @param {Integer} [depth] 
	 * @returns 
	 */
	var compute = rsSystem.dnd.Calculator.compute = rsSystem.dnd.compute = function(expression, source, referenced, depth = 0) {
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
			while((variables = variableExpression.exec(expression))) {
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
					if(path[x]) {
						path[x] = path[x].replace(dots, "");
					}
				}
				if(debug) {
					console.log(" > Path: ", path);
				}
				value = calculatedValue(source, path, referenced);
				if(value !== undefined && value !== null) {
					// console.log(" > Computed Value[" + path.join() + "]: " + value);
					processed = processed.replace(matched, value);
				}
			}
		}

		// return calculate(processed);
		if(source && processed !== expression && depth < maxDepth) {
			// Rerun until we "stabilize" to detect arbitrary depth in referencing
			// console.trace("Depth: " + depth);
			if(depth > 2) {
				console.log(" [" + source.id + "]: " + processed + " <--> " + expression);
			}
			return compute(processed, source, referenced, depth + 1);
		} else {
			if(depth > 2) {
				console.log("Good");
			}
			return calculate(processed);
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
	 var parseDiceRoll = rsSystem.dnd.Calculator.parseDiceRoll = rsSystem.dnd.parseDiceRoll = function(expression) {
		var buffer = [],
			dice = {},
			x;
			
		if(expression) {
			if(typeof(expression) === "number") {
				return {
					"remainder": expression
				};
			}
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
		}

		return dice;
	};

	/**
	 * 
	 * @method reducedDiceRoll
	 * @param {String} expression 
	 * @param {Object} [source] 
	 * @returns 
	 */
	var reducedDiceRoll = rsSystem.dnd.Calculator.reducedDiceRoll = rsSystem.dnd.reducedDiceRoll = function(expression, source) {
		var reduced = "",
			value,
			dice,
			x;

		dice = parseDiceRoll(expression);
		if(debug) {
			console.log("Computing: ", dice);
		}
		for(x=0; x<diceOrder.length; x++) {
			value = compute(dice[diceOrder[x]], source);
			if(value) {
				if(debug) {
					console.log(" > Dice[" + diceOrder[x] + "]: ", value);
				}
				if(reduced) {
					if(typeof(value) === "number") {
						reduced += " + " + value + diceOrder[x];
					} else {
						reduced += " + (" + value + ")" + diceOrder[x];
					}
				} else {
					if(typeof(value) === "number") {
						reduced = value + diceOrder[x];
					} else {
						reduced = "(" + value + ")" + diceOrder[x];
					}
				}
			}
		}
		value = compute(dice.remainder, source);
		if(debug) {
			console.log(" > Dice[remainder]: " + reduced, value);
		}
		if(value) {
			if(reduced) {
				reduced += " + " + value;
			} else {
				reduced = value;
			}
		}
		value = compute(dice["%"], source);
		if(debug) {
			console.log(" > Dice[percent]: " + reduced, value);
		}
		if(value) {
			if(reduced) {
				reduced += " + " + value + "%";
			} else {
				reduced = value + "%";
			}
		}
		if(debug) {
			console.log(" = Final: " + reduced);
		}


		return reduced;
	};
})();
