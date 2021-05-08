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
		reference = {},
		manager = {};
	
	this.getDatabase = function() {
		return database;
	};
	
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
				
				universe.on("shutdown", () => {
					database.close();
				});
				
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
	 * @method listFields
	 * @return {Array | String}
	 */
	this.listFields = function() {
		var keys = Object.keys(database.field),
			fields = [],
			x;
		
		for(x=0; x<keys.length; x++) {
			fields.push(database.field[keys[x]]);
		}
		
		return fields;
	};
	
	/**
	 * @method modifyField
	 * @param {Object} specification 
	 * @return {Promise} 
	 */
	this.modifyField = function(specification) {
		return new Promise(function(done, fail) {
			if(specification && specification.id) {
				database.updateField(specification.id, specification)
				.then(done)
				.catch(fail);
			} else {
				fail(new Error("Field specification empty or missing ID"));
			}
		});
	};
	
	/**
	 * 
	 * @method getReference
	 * @return {Object}
	 */
	this.getInheritance = function() {
		return JSON.parse(JSON.stringify(inheritance));
	};
	
	/**
	 * 
	 * @method getReference
	 * @return {Object}
	 */
	this.getReference = function() {
		return JSON.parse(JSON.stringify(reference));
	};
	
	/**
	 * Ensures that any required object is loaded if needed. Additionally emits warnings for
	 * missing dependencies.
	 * @method trackInheritance
	 * @param {RSObject} consumer The object using the values.
	 * @param {Array | String} source_fields Naming the fields on the consumer from which the
	 * 		ID values are to be pulled.
	 * @return {Promise}
	 */
	this.trackInheritance = function(consumer, source_fields) {
		return new Promise((done, fail) => {
			var promised = [];
				
			console.log("Tracking")
			
			traceDependency(inheritance, consumer, source_fields, promised);
			
			console.log("Tracked")
			Promise.all(promised)
			.then((loaded) => {
				console.log("Tracking is Linking")
				for(x=0; x<loaded.length; x++) {
					promised = [];
					if(loaded[x]) {
						promised.push(loaded[x].linkFieldValues());
					}
				}
				console.log("Tracking Linked")
				return Promise.all(promised);
			})
			.then((linked) => {
				for(x=0; x<linked.length; x++) {
					if(linked[x]) {
						linked[x].calculateFieldValues();
					}
				}
				for(x=0; x<linked.length; x++) {
					if(linked[x]) {
						linked[x].updateFieldValues();
					}
				}
			})
			.then(done)
			.catch(fail);
		});
	};
	
	/**
	 *
	 * @method trackReference
	 * @param {RSObject} consumer The object using the values.
	 * @param {Array | String} source_fields Naming the fields on the consumer from which the
	 * 		ID values are to be pulled.
	 * @return {Promise}
	 */
	this.trackReference = function(consumer, source_fields) {
		return traceDependency(reference, consumer, source_fields);
	};
	
	/**
	 *
	 * @method traceDependency
	 * @param {Object} trace Object that handles storing the values representing the connections
	 * @param {RSObject} consumer The object using the values.
	 * @param {Array | String} source_fields Naming the fields on the consumer from which the
	 * 		ID values are to be pulled.
	 * @param {Array | Promise} [loading] The holds the promises of loading objects. If omitted,
	 * 		objects that aren't already loaded instead emit a warning.
	 * @return {Promise}
	 */
	var traceDependency = function(trace, consumer, source_fields, loading) {
		var classification,
			loading,
			details,
			inherit,
			v,
			x;
			
		console.log("Tracking")
		
		inherit = function(value) {
			classification = universe.getClassFromID(value);
			if(classification && manager[classification]) {
				loading = trace[value];
				
				if(!loading) {
					loading = trace[value] = {};
				}
				if(loading[consumer.id]) {
					loading[consumer.id]++;
				} else {
					loading[consumer.id] = 1;
				}
				
				// Ensure the consumed objects are loaded
				if(manager[classification].object[value] === false) {
					// Exists but not loaded
					if(loading) {
						loading.push(manager[classification].load(universe, value));
					} else {
						details = {};
						details.classification = classification;
						details.consumer = consumer;
						details.fields = source_fields;
						details.id = value;
						universe.emit("error", new universe.Anomaly("universe:trace:track", "Object not loaded", 40, details, null, this));
					}
				} else if(manager[classification].object[value] === undefined) {
					// Doesn't exist
					details = {};
					details.classification = classification;
					details.consumer = consumer;
					details.field = source_fields[x];
					details.value = value;
					universe.emit("error", new universe.Anomaly("universe:trace:track", "No such object", 50, details, null, this));
				}  else {
					// Already loaded
				}
			} else {
				details = {};
				details.classification = classification;
				details.consumer = consumer;
				details.fields = source_fields;
				universe.emit("error", new universe.Anomaly("universe:trace:track", "No such class", 50, details, null, this));
			}
		};
		
		for(x=0; x<source_fields.length; x++) {
			if(consumer[source_fields[x]]) {
				if(consumer[source_fields[x]] instanceof Array) {
					for(v=0; v<consumer[source_fields[x]].length; v++) {
						inherit(consumer[source_fields[x]][v]);
					}
				} else {
					inherit(consumer[source_fields[x]]);
				}
			}
		}
		
		return loading;
	};

	/**
	 * 
	 * @method untrackInheritance
	 * @param {String} consumer 
	 * @param {Array | String} consumed 
	 */
	this.untrackInheritance = function(consumer, consumed) {
 		// TODO: This returns a promise for a future case of unloading objects that are no longer needed.
 		// 		This may never come to pass or be better suited to a garbage collection like scan. However
 		// 		a scan should still trigger from here (ie. Every 100th untrack collect and dismiss or make
 		// 		memory allocation considerations).
		return new Promise((done) => {
			untraceDependency(inheritance, consumer, consumed);
			done();
		});
	};
	
	/**
	 * 
	 * @method untrackInheritance
	 * @param {String} consumer 
	 * @param {Array | String} consumed 
	 */
	this.untrackReference = function(consumer, consumed) {
		untraceDependency(reference, consumer, consumed);
	};
	
	var untraceDependency = function(trace, consumer, consumed) {
		var loading,
			details,
			v,
			x;
		
		console.log("untracking");
		for(x=0; x<consumed.length; x++) {
			if(consumed[x]) {
				if(consumed[x] instanceof Array) {
					for(v=0; v<consumed[x].length; v++) {
						loading = trace[consumed[x]];
						if(loading) {
							loading[consumer]--;
							if(loading[consumer] < 0) {
								console.log("Untracked below 0 Should not happen");
								loading[consumer] = 0;
							}
						} else {
							details = {};
							details.consumer = consumer;
							details.consumed = consumed[x];
							details.index = v;
							universe.emit("error", new universe.Anomaly("universe:trace:untrack", "No such consumed object being tracked", 40, details, null, this));
						}
					}
				} else {
					loading = trace[consumed[x]];
					if(loading) {
						loading[consumer]--;
						if(loading[consumer] < 0) {
							console.log("Untracked below 0 Should not happen");
							loading[consumer] = 0;
						}
					} else {
						details = {};
						details.consumer = consumer;
						details.consumed = consumed;
						universe.emit("error", new universe.Anomaly("universe:trace:untrack", "No such consumed object being tracked", 40, details, null, this));
					}
				}
			}
		}
		console.log("untracked");
	};
	
	/**
	 * 
	 * @method retrieve
	 * @param {String} id Of the _LOADED_ object to fetch. If the object exists and
	 * 		is not loaded, null is still returned.
	 * @return {RSObject} Or null if the object is undefined or not loaded.
	 */
	this.retrieve = function(id) {
		var classManager = manager[universe.getClassFromID(id)];
		if(classManager) {
			return classManager.object[id] || null;
		} else {
			var details = {};
			details.id = id;
			universe.emit("error", new universe.Anomaly("universe:object:retrieval", "Failed to locate manager for requested ID", 50, details, null, this));
			return null;
		}
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
