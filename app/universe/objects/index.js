/**
 * Handles Object cross talk and updates.
 * @class RSObjectReferrer
 * @constructor
 */

var RSObject = require("../../storage/rsobject"),
	ChangeEvent = require("./change_event"),
	DBLoader = require("./dbloader"),
	fs = require("fs"),
	Anomaly,

	classList = fs.readdirSync("./app/universe/objects/classes"),
	constructors = {},
	x;
	
constructors._general = RSObject;
for(x=0; x<classList.length; x++) {
	constructors[classList[x]] = require("./classes/" + classList[x]);
}

module.exports = function(universe) {
	this.id = "universe:objects";
	Anomaly = universe.Anomaly;
	var database = null,
		inheritance = {},
		manager = {};
	
	this.initialize = function(startup) {
		return new Promise(function(done, fail) {
			var initializing = [],
				mngr,
				x;
				
			for(x=0; x<universe.classes.length; x++) {
				if(!constructors[universe.classes[x]]) {
					constructors[universe.classes[x]] = RSObject;
				}
			}
			
			// TODO: Add logic for database type consideration?
			database = new startup.RSDatabase(universe.configuration.database);
			database.initialize(constructors)
			.then(() => {
				return DBLoader.initialize(universe, database);
			}) .then(() => {
				for(x=0; x<universe.classes.length; x++) {
					manager[universe.classes[x]] = database.getClassManager(universe.classes[x]);
				}
				done(manager);
			}).catch((err) => {
				var anomaly = new Anomaly("fault:universe:initialization", "Failed to initialize the Universe", 60, startup, err, this);
				universe.emit("error", anomaly);
				fail(anomaly);
			});
		});
	};
	
	/**
	 * 
	 * @method trackInheritance
	 * @param  {RSObject} source 
	 * @param  {RSObject} effected 
	 */
	this.trackInheritance = function(source, effected) {
		
	};

	/**
	 * 
	 * @method untrackInheritance
	 * @param  {RSObject} source 
	 * @param  {RSObject} effected 
	 */
	this.untrackInheritance = function(source, effected) {
		
	};

	/**
	 * 
	 * @method pushChanged
	 * @param {String} id 
	 */
	this.pushChanged = function(id, callback) {
		var changing = new ChangeEvent(id, callback);
		trackChanging(id, changing);
	};
	
	/**
	 * 
	 * @method trackChanging
	 * @private
	 * @param {Object} changing Used for trackign what objects have
	 * 		been changed as a crude loop prevention
	 */
	var trackChanging = function(changing) {
		
	};
	
	return this;
};
