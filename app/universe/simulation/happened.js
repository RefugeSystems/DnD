/**
 * 
 * 
 * @class Happened
 * @static
 * @param {Universe} universe
 */

class Happened {


}

function example() {
	var text = "/** hi\n * Test\n */function response(universe) { universe.example(4, 4); console.log('HI'); eval(\"console.log('Path: ' + global.location.path)\");}";
	(function() {
		var document = "none",
			window = "none",
			require = "none",
			location = "none",
			global = {},
			universe = {},
			result;
		universe.example = function(a, b) {
			console.log("Mul: " + (a*b));
		};
		result = eval(text);
		console.log("Res: ", result);
		// response(universe);
	})();
}
        

module.exports = Happened;