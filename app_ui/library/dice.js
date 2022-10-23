/**
 *
 *
 *
 */
const Dice = (function() {

	var diceReductionRegEx = /\+?([0-9a-z\.]+|\([0-9+-\/\*\(\)a-z\.]+)(d[0-9]+|dj[abcdps]|ability|proficiency|boost|difficulty|challenge|setback|hit|evade|a|b|c|d|p|s|f|h|e)[ \+\/-]/g,
		calculateSecurityRegEx = /^[<>0-9\(\)+-\/\*]*$/,
		dndStatCurve = true,
		spaces = / /g,
		space = " ",
		tX;

	var rollMap = [ // TODO: Consider expansion to all skill names from skill object listing?
		["str", "strength"],
		["dex", "dexterity"],
		["con", "constitution"],
		["int", "intelligence"],
		["wis", "wisdom"],
		["cha", "charisma"]
	];

	var dndRollMap = [ // TODO: Consider expansion to all skill names from skill object listing?
   		["str", "strength"],
		["dex", "dexterity"],
		["con", "constitution"],
		["int", "intelligence"],
		["wis", "wisdom"],
		["cha", "charisma"]
	];
	var swrpgRollMap = [ // TODO: Consider expansion to all skill names from skill object listing?
      	["bra", "brawn"],
   		["agi", "agility"],
   		["int", "intellect"],
   		["cun", "cunning"],
   		["wil", "willpower"],
   		["pre", "pressence"]
   	];

	var rollLevelMap = [ // TODO Consider against other classes or simplify expression? This is in theory a deprecated representation
		["level","self"],
		["barbarian","class:barbarian"],
		["bard","class:bard"],
		["cleric","class:cleric"],
		["rogue","class:rogue"],
		["ranger","class:ranger"],
		["paladin", "class:paladin"],
		["sorcerer", "class:sorcerer"],
		["monk", "class:monk"],
		["druid", "class:druid"],
		["warlock", "class:warlock"],
		["fighter", "class:fighter"],
		["wizard","class:wizard"]
	];
	var rollDirectMap = [
		["pro", "proficiency"], // TODO: Consider DnD proficiency against SWRPG proficiency dice
		["movement", "movement"],
		["health", "health"],
		["HP", "health"],
		["maxHealth", "maxHealth"],
		["maxHP", "maxHealth"],
		["armor", "armor"],
		["ac", "armor"],
		["brawn"],
		["agility"],
		["intellect"],
		["cunning"],
		["willpower"],
		["pressence"]
	];

	var calculate = function(expression) {
		if(Dice.debug) {
			console.log("Dice Calculate: " + expression);
		}
		if(expression && expression[0] === "+") { // Other operators would expressly be an issue
			expression = expression.substring(1);
		}

		if(expression && expression.length < 150 && calculateSecurityRegEx.test(expression.trim())) {
			try {
				if(Dice.debug) {
					console.log("Dice Evaluating: " + expression);
				}
				return Math.floor(eval(expression));
			} catch(ignored) {
				return expression;
			}
		} else {
			return expression;
		}
	};

	var diceSummed = [
		"d4",
		"d6",
		"d8",
		"d10",
		"d12",
		"d20",
		"d100"
	];

	var diceSummedCheck = {};
	for(tX=0; tX<diceSummed.length; tX++) {
		diceSummedCheck[diceSummed[tX]] = true;
	}

	var diceOrder = [
		"d4",
		"d6",
		"d8",
		"d10",
		"d12",
		"d20",
		"d100",
		"ability",
		"dja",
		"a",
		"boost",
		"djb",
		"b",
		"challenge",
		"djc",
		"c",
		"difficulty",
		"djd",
		"d",
		"proficiency",
		"djp",
		"p",
		"setback",
		"djs",
		"s",
		"force",
		"djf",
		"f",
		"hit",
		"h",
		"evade",
		"e"
	];

	var diceMap = {
		"ability": "a",
		"dja": "a",
		"a": "a",
		"boost": "b",
		"djb": "b",
		"b": "b",
		"challenge": "c",
		"djc": "c",
		"c": "c",
		"difficulty": "d",
		"djd": "d",
		"d": "d",
		"proficiency": "p",
		"djp": "p",
		"p": "p",
		"setback": "s",
		"djs": "s",
		"s": "s",
		"force": "f",
		"djf": "f",
		"f": "f",
		"hit": "h",
		"h": "h",
		"evade": "e",
		"e": "e",
		"d100": "d100",
		"d20": "d20",
		"d12": "d12",
		"d10": "d10",
		"d8": "d8",
		"d6": "d6",
		"d4": "d4"
	};

	var diceRoll = function(dice) {
		var roll = parseInt(parseInt(dice.substring(1)) * Math.random()) + 1;
		return roll;
	};

	/**
	 * Parses a string expression (e.g "con + 1d8") into an object for calculation or
	 * display.
	 * @method parseDiceRoll
	 * @private
	 * @param {String} expression
	 * @param {AQCharacter} [source] Drives raw arguments for stats such as "str" and "wis".
	 * @param {AQCharacter} [target] Drives 'target; arguments for stats such as "target.str"
	 * 		and "target.wis".
	 */
	var parseDiceRoll = function(expression, source, target) {
		var x, sCasting, tCasting, regex, buffer = [], dice = {}, roll = {};
		if(!expression) {
			return roll;
		} else if(typeof(expression) !== "string") {
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

		// TODO: Improve property mapping
		if(target) {
			for(x=0; x<rollMap.length; x++) {
				regex = new RegExp("target\\." + rollMap[x][0], "g");
				if(dndStatCurve) {
					expression = expression.replace(regex, parseInt(Math.floor((target[rollMap[x][1]] || 0)/2) - 5));
				} else {
					expression = expression.replace(regex, parseInt(target[rollMap[x][1]] || 0));
				}
			}
			for(x=0; x<rollDirectMap.length; x++) {
				regex = new RegExp("target\\." + rollDirectMap[x][0], "g");
				expression = expression.replace(regex, parseInt(target[rollDirectMap[x][1] || rollDirectMap[x][0]] || 0));
			}
		}
		if(source) {
			for(x=0; x<rollMap.length; x++) {
				regex = new RegExp(rollMap[x][0], "g");
				if(dndStatCurve) {
					expression = expression.replace(regex, parseInt(Math.floor((source[rollMap[x][1]] || 0)/2) - 5));
				} else {
					expression = expression.replace(regex, parseInt(source[rollMap[x][1]] || 0));
				}
			}
			for(x=0; x<rollDirectMap.length; x++) {
				regex = new RegExp(rollDirectMap[x][0], "g");
				expression = expression.replace(regex, parseInt(source[rollDirectMap[x][1] || rollDirectMap[x][0]] || 0));
			}
		}
		expression = expression.replace(spaces, "") + space;
		x = diceReductionRegEx.exec(expression);
		while(x !== null) {
			buffer.push(x[0]);
			dice[diceMap[x[2]]] = dice[diceMap[x[2]]]?dice[diceMap[x[2]]] + "+" + x[1]:x[1];
			x = diceReductionRegEx.exec(expression);
		}
		if(Dice.debug) {
			console.log("Dice Clean Expression: " + expression, buffer);
		}
		for(x=0; x<buffer.length; x++) {
			expression = expression.replace(buffer[x], "");
		}
		roll.null = expression;
//		console.log("Dice Expression: " + JSON.stringify(dice, null, 4));
		for(x=0; x<diceOrder.length; x++) {
			if(dice[diceOrder[x]]) {
				roll[diceOrder[x]] = calculate(dice[diceOrder[x]]);
			}
		}
		return roll;
	};

	var rawDiceRoll = function(expression, source, target) {
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

	var reduceDiceRoll = function(expression, source, target) {
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

	var calculateDiceRoll = function(expression, source, target) {
		var result = {},
			dice,
			d,
			x;

		if(typeof(expression) === "string") {
			dice = parseDiceRoll(expression, source, target);
		} else if(typeof(expression) === "object") {
			dice = expression;
		}
		result.sum = parseInt(calculate(dice.null)) || 0;
//		console.error(dice);
//		console.warn(result);
		for(d=0; d<diceOrder.length; d++) {
			dice[diceOrder[d]] = parseInt(calculate(dice[diceOrder[d]]));
//			console.log("Dice Count[" + diceOrder[d] + "]: " + dice[diceOrder[d]]);
			for(x=0; x<dice[diceOrder[d]] && !isNaN(dice[diceOrder[d]]); x++) {
//				console.log("Roll Dice[" + diceOrder[d] + "]: " + x + "/" + dice[diceOrder[d]]);
				if(diceSummedCheck[diceOrder[d]]) {
					result.sum += diceRoll(diceOrder[d]);
				} else {
					switch(diceOrder[d]) {
						case "ability":
						case "dja":
						case "a":
							rollStarWarsDice("ability", result);
							break;
						case "boost":
						case "djb":
						case "b":
							rollStarWarsDice("boost", result);
							break;
						case "proficiency":
						case "djp":
						case "p":
							rollStarWarsDice("proficiency", result);
							break;
						case "difficulty":
						case "djd":
						case "d":
							rollStarWarsDice("difficulty", result);
							break;
						case "challenge":
						case "djc":
						case "c":
							rollStarWarsDice("challenge", result);
							break;
						case "setback":
						case "djs":
						case "s":
							rollStarWarsDice("setback", result);
							break;
						case "force":
						case "djf":
						case "f":
							rollStarWarsDice("force", result);
							break;
						default:
							console.warn("Unknown Dice: " + diceOrder[d]);
					}
				}
			}
		}

		return result;
	};

	var starWarsMap = {
		"ability": {
			"dice": "d8",
			"1": {
				"advantage": 0,
				"success": 0
			},
			"2": {
				"advantage": 0,
				"success": 1
			},
			"3": {
				"advantage": 0,
				"success": 1
			},
			"4": {
				"advantage": 0,
				"success": 2
			},
			"5": {
				"advantage": 1,
				"success": 0
			},
			"6": {
				"advantage": 1,
				"success": 0
			},
			"7": {
				"advantage": 1,
				"success": 1
			},
			"8": {
				"advantage": 2,
				"success": 0
			}
		},
		"boost":  {
			"dice": "d6",
			"1": {
				"advantage": 0,
				"success": 0
			},
			"2": {
				"advantage": 0,
				"success": 1
			},
			"3": {
				"advantage": 2,
				"success": 0
			},
			"4": {
				"advantage": 1,
				"success": 0
			},
			"5": {
				"advantage": 1,
				"success": 1
			},
			"6": {
				"advantage": 0,
				"success": 0
			}
		},
		"proficiency":  {
			"dice": "d12",
			"1": {
				"advantage": 0,
				"success": 0
			},
			"2": {
				"advantage": 0,
				"success": 1
			},
			"3": {
				"advantage": 0,
				"success": 1
			},
			"4": {
				"advantage": 0,
				"success": 2
			},
			"5": {
				"advantage": 0,
				"success": 2
			},
			"6": {
				"advantage": 1,
				"success": 0
			},
			"7": {
				"advantage": 1,
				"success": 1
			},
			"8": {
				"advantage": 1,
				"success": 1
			},
			"9": {
				"advantage": 1,
				"success": 1
			},
			"10": {
				"advantage": 2,
				"success": 0
			},
			"11": {
				"advantage": 2,
				"success": 0
			},
			"12": {
				"advantage": 0,
				"success": 0,
				"triumph": 1
			}
		},
		"difficulty":  {
			"dice": "d8",
			"1": {
				"failure": 0,
				"threat": 0
			},
			"2": {
				"success": -1,
				"failure": 1,
				"threat": 0
			},
			"3": {
				"success": -2,
				"failure": 2,
				"threat": 0
			},
			"4": {
				"failure": 0,
				"advantage": -1,
				"threat": 1
			},
			"5": {
				"failure": 0,
				"advantage": -1,
				"threat": 1
			},
			"6": {
				"failure": 0,
				"advantage": -1,
				"threat": 1
			},
			"7": {
				"failure": 0,
				"advantage": -2,
				"threat": 2
			},
			"8": {
				"success": -1,
				"advantage": -1,
				"failure": 1,
				"threat": 1
			}
		},
		"setback":  {
			"dice": "d6",
			"1": {
				"failure": 0,
				"threat": 0
			},
			"2": {
				"failure": 0,
				"threat": 0
			},
			"3": {
				"success": -1,
				"failure": 1,
				"threat": 0
			},
			"4": {
				"success": -1,
				"failure": 1,
				"threat": 0
			},
			"5": {
				"advantage": -1,
				"failure": 0,
				"threat": 1
			},
			"6": {
				"advantage": -1,
				"failure": 0,
				"threat": 1
			}
		},
		"challenge":  {
			"dice": "d12",
			"1": {
				"failure": 0,
				"threat": 0
			},
			"2": {
				"success": -1,
				"failure": 1,
				"threat": 0
			},
			"3": {
				"success": -1,
				"failure": 1,
				"threat": 0
			},
			"4": {
				"success": -2,
				"failure": 2,
				"threat": 0
			},
			"5": {
				"success": -2,
				"failure": 2,
				"threat": 0
			},
			"6": {
				"failure": 0,
				"advantage": -1,
				"threat": 1
			},
			"7": {
				"failure": 0,
				"advantage": -1,
				"threat": 1
			},
			"8": {
				"success": -1,
				"advantage": -1,
				"threat": 1,
				"failure": 1
			},
			"9": {
				"success": -1,
				"advantage": -1,
				"threat": 1,
				"failure": 1
			},
			"10": {
				"failure": 0,
				"advantage": -2,
				"threat": 2
			},
			"11": {
				"advantage": -2,
				"failure": 0,
				"threat": 2
			},
			"12": {
				"triumph": -1,
				"failure": 0,
				"despair": 1,
				"threat": 0
			}
		},
		"force": {
			"dice": "d12",
			"1": {
				"light": -1,
				"dark": 1
			},
			"2": {
				"light": -1,
				"dark": 1
			},
			"3": {
				"light": -1,
				"dark": 1
			},
			"4": {
				"light": -1,
				"dark": 1
			},
			"5": {
				"light": -1,
				"dark": 1
			},
			"6": {
				"light": -1,
				"dark": 1
			},
			"7": {
				"light": -2,
				"dark": 2
			},
			"8": {
				"light": 1
			},
			"9": {
				"light": 1
			},
			"10": {
				"light": 2
			},
			"11": {
				"light": 2
			},
			"12": {
				"light": 2
			}
		}
	};

	var rollStarWarsDice = function(roll, result) {
		var roll = starWarsMap[roll],
			keys,
			x;

		if(roll) {
			roll = roll[diceRoll(roll.dice)];
			if(roll) {
				keys = Object.keys(roll);
				for(x=0; x<keys.length; x++) {
					if(!result[keys[x]]) {
						result[keys[x]] = 0;
					}
					result[keys[x]] += roll[keys[x]];
				}
			}
		}

		return result;
	};

	return {

		"calculateDiceRoll": calculateDiceRoll,


		"parseDiceRoll": parseDiceRoll,


		"reduceDiceRoll": reduceDiceRoll,


		"rawDiceRoll": rawDiceRoll,

		"setDnD": function() {
			rollMap = dndRollMap;
			dndStatCurve = true;
		},

		"setSWRPG": function() {
			rollMap = swrpgRollMap;
			dndStatCurve = false;
		}
	};
})();
