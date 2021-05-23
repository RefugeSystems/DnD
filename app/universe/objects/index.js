/**
 * Handles Object cross talk and updates for the universe to help make the processing
 * database agnostic.
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
	constructors[classList[x].replace(".js", "")] = require("./classes/" + classList[x]);
}

module.exports = function(universe) {
	this.id = "universe:objects";
	Anomaly = universe.Anomaly;
	var handler = this,
		database = null,
		chronicle = null,
		inheritance = {},
		reference = {},
		manager = {},
		mark = {};
	
	/**
	 * 
	 * @method getDatabase
	 * @deprecated This exists primarily for debugging and should be avoided however
	 * 		it currently fills a required gap between the database and the universe
	 * 		for the Chronicle
	 * @return {RSDatabase} [description]
	 */
	this.getDatabase = function() {
		return database;
	};
	
	this.initialize = function(startup) {
		return new Promise(function(done, fail) {
			var initializing,
				mngr,
				x;
				
			for(x=0; x<universe.classes.length; x++) {
				if(!constructors[universe.classes[x]]) {
					constructors[universe.classes[x]] = RSObject;
				}
			}
			
			// TODO: Add logic for database type consideration?
			database = new startup.RSDatabase(universe.configuration.database);
			console.log("Recovery Mode? " + !!universe.specification.recovery_mode);
			initializing = database.initialize(constructors, null, null, universe.specification.recovery_mode);
			if(universe.specification.recovery_mode) {
				done(manager);
			} else {
				initializing.then(() => {
					return DBLoader.initialize(universe, database, universe.configuration);
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
			}
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
	 * @method getInheritance
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
	 * 
	 * @method getTimeMark
	 * @return {Object}
	 */
	this.getTimeMark = function() {
		return JSON.parse(JSON.stringify(mark));
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
				
			// console.log("Tracking")
			
			if(consumer.parent) {
				source_fields.push("parent");
			}
			traceDependency(inheritance, consumer, source_fields, promised);
			
			// console.log("Tracked")
			if(promised.length) {
				Promise.all(promised)
				.then((loaded) => {
					// console.log("Tracking is Linking: ", loaded);
					for(x=0; x<loaded.length; x++) {
						promised = [];
						if(loaded[x]) {
							promised.push(loaded[x].linkFieldValues());
						}
					}
					// console.log("Tracking Linked")
					return Promise.all(promised);
				})
				.then((linked) => {
					var now = Date.now();
					for(x=0; x<linked.length; x++) {
						if(linked[x]) {
							linked[x].calculateFieldValues();
						}
					}
					for(x=0; x<linked.length; x++) {
						if(linked[x]) {
							linked[x].updateFieldValues();
							mark[linked[x].id] = now;
						}
					}
				})
				.then(done)
				.catch(fail);
			} else {
				done();
			}
		});
	};
	
	/**
	 *
	 * @method trackReference
	 * @param {RSObject} consumer The object using the values.
	 * @param {Array | String} sources IDs of the relevent sources.
	 * @return {Array | Promise}
	 */
	this.trackReference = function(consumer, sources) {
		if(consumer && sources && sources.length) {
			return addDependencies(reference, consumer, sources);
		} else {
			return [];
		}
	};
	
	/**
	 *
	 * @method traceDependency
	 * @private
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
			
		// console.log("Tracking: " + consumer.id);
		inherit = function(value) {
			classification = universe.getClassFromID(value);
			// console.log(" > Inherit: ", classification);
			if(classification && manager[classification]) {
				// console.log(" > Inherit[Manager]");
				if(value !== consumer.id) {
					loading = trace[value];
					
					if(!loading) {
						loading = trace[value] = {"_list":[]};
					}
					if(loading[consumer.id]) {
						loading[consumer.id]++;
					} else {
						loading._list.push(consumer.id);
						loading[consumer.id] = 1;
					}
				
					// console.log(" > Inherit[Object]? ", value, "\n   > Loading: ", loading, "\n   > Inheritance: ", inheritance);
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
					console.log("Self Trace Skipped");
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
			if(consumer._data[source_fields[x]]) {
				if(consumer._data[source_fields[x]] instanceof Array) {
					for(v=0; v<consumer._data[source_fields[x]].length; v++) {
						inherit(consumer._data[source_fields[x]][v]);
					}
				} else {
					// console.log(" > Inherit[Single]");
					inherit(consumer._data[source_fields[x]]);
				}
			}
		}
		
		return loading;
	};
	
	/**
	 *
	 * @method addDependencies
	 * @private
	 * @param {Object} trace Object that handles storing the values representing the connections
	 * @param {RSObject} consumer The object using the values.
	 * @param {Array | String} sources IDs from which to track
	 * @param {Array | Promise} [loading] The holds the promises of loading objects. If omitted,
	 * 		objects that aren't already loaded instead emit a warning.
	 * @return {Promise}
	 */
	var addDependencies = function(trace, consumer, sources, loading) {
		var classification,
			loading,
			details,
			inherit,
			v,
			x;
			
		// console.log("Tracking: " + consumer.id);
		for(x=0; x<sources.length; x++) {
			classification = universe.getClassFromID(sources[x]);
			// console.log(" > Inherit: ", classification);
			if(classification && manager[classification]) {
				// console.log(" > Inherit[Manager]");
				if(sources[x] !== consumer.id) {
					loading = trace[sources[x]];
					
					if(!loading) {
						loading = trace[sources[x]] = {"_list":[]};
					}
					if(loading[consumer.id]) {
						loading[consumer.id]++;
					} else {
						loading._list.push(consumer.id);
						loading[consumer.id] = 1;
					}
						
					// console.log(" > Inherit[Object]? ", sources[x], "\n   > Loading: ", loading, "\n   > Trace: ", trace);
					// Ensure the consumed objects are loaded
					if(manager[classification].object[sources[x]] === false) {
						// Exists but not loaded
						if(loading) {
							loading.push(manager[classification].load(universe, sources[x]));
						} else {
							details = {};
							details.classification = classification;
							details.consumer = consumer;
							details.sources = sources;
							details.id = sources[x];
							universe.emit("error", new universe.Anomaly("universe:trace:depend", "Object not loaded", 40, details, null, this));
						}
					} else if(manager[classification].object[sources[x]] === undefined) {
						// Doesn't exist
						details = {};
						details.classification = classification;
						details.consumer = consumer;
						details.sources = sources;
						details.value = sources[x];
						universe.emit("error", new universe.Anomaly("universe:trace:depend", "No such object", 50, details, null, this));
					}  else {
						// Already loaded
					}
				} else {
					// console.log("Self Dependence Skipped");
				}
			} else {
				details = {};
				details.classification = classification;
				details.consumer = consumer;
				details.sources = sources;
				universe.emit("error", new universe.Anomaly("universe:trace:depend", "No such class", 50, details, null, this));
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
	
	/**
	 * 
	 * @method untraceDependency
	 * @private
	 * @param {Object} trace 
	 * @param {RSObject} consumer 
	 * @param {Array} consumed 
	 */
	var untraceDependency = function(trace, consumer, consumed) {
		var loading,
			details,
			v,
			x;
		
		// console.log("untracking");
		for(x=0; x<consumed.length; x++) {
			if(consumed[x]) {
				if(consumed[x] instanceof Array) {
					for(v=0; v<consumed[x].length; v++) {
						loading = trace[consumed[x]];
						if(loading) {
							loading._list.purge(consumer);
							delete(loading[consumer]);
							/*
							loading[consumer]--;
							if(loading[consumer] < 0) {
								console.log("Untracked below 0 Should not happen");
								loading[consumer] = 0;
							}
							if(loading[consumer] === 0) {
								loading._list.purge(consumer);
								delete(loading[consumer]);
							}
							*/
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
						loading._list.purge(consumer);
						delete(loading[consumer]);
						/*
						loading[consumer]--;
						if(loading[consumer] < 0) {
							console.log("Untracked below 0 Should not happen");
							loading[consumer] = 0;
						}
						if(loading[consumer] === 0) {
							loading._list.purge(consumer);
							delete(loading[consumer]);
						}
						*/
					} else {
						details = {};
						details.consumer = consumer;
						details.consumed = consumed;
						universe.emit("error", new universe.Anomaly("universe:trace:untrack", "No such consumed object being tracked", 40, details, null, this));
					}
				}
			}
		}
		// console.log("untracked");
	};
	
	/**
	 *
	 * @method removeDependencies
	 * @private
	 * @param {Object} trace Object that handles storing the values representing the connections
	 * @param {RSObject} consumer The object using the values.
	 * @param {Array | String} sources IDs from which to track
	 * @param {Array | Promise} [loading] The holds the promises of loading objects. If omitted,
	 * 		objects that aren't already loaded instead emit a warning.
	 * @return {Promise}
	 */
	var removeDependencies = function(trace, consumer, sources, loading) {
		var classification,
			loading,
			details,
			inherit,
			v,
			x;
			
		// console.log("Tracking: " + consumer.id);
		for(x=0; x<sources.length; x++) {
			classification = universe.getClassFromID(sources[x]);
			// console.log(" > Inherit: ", classification);
			if(classification && manager[classification]) {
				// console.log(" > Inherit[Manager]");
				loading = trace[sources[x]];
				if(loading && loading[consumer.id]) {
					loading._list.purge(consumer.id);
					delete(loading[consumer.id]);
				}
			} else {
				details = {};
				details.classification = classification;
				details.consumer = consumer;
				details.sources = sources;
				universe.emit("error", new universe.Anomaly("universe:trace:undepend", "No such class", 50, details, null, this));
			}
		}
		
		return loading;
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
			details.managers = Object.keys(manager);
			details.id = id;
			universe.emit("error", new universe.Anomaly("universe:object:retrieval", "Failed to locate manager for requested ID", 50, details, null, this));
			return null;
		}
	};

	/**
	 * Notifies the handler to recalculate the values of dependent objects.
	 *
	 * This is essentially a deep update on objects as the underlying value
	 * has changed.
	 * @method pushCalculated
	 * @param {String} id 
	 */
	this.pushCalculated = function(id) {
		mark[id] = Date.now();
		if(reference[id] && reference[id]._list.length) {
			var changing = {};
			changing.origin = id;
			changing.queue = reference[id]._list;
			changing.index = 0;
			changing.start = Date.now();
			trackCalculations(changing);
		}
	};
	
	/**
	 * 
	 * @method trackCalculations
	 * @private
	 * @param {Object} changing Used for tracking what objects have
	 * 		been changed as a crude loop prevention
	 */
	var trackCalculations = function(changing) {
		setTimeout(function() {
			var cascade = handler.retrieve(changing.queue[changing.index++]);
			if(cascade) {
				cascade.calculateFieldValues();
				cascade.updateFieldValues();
				if(changing.index < changing.queue.length) {
					trackCalculations(changing);
				} else {
					changing.duration = Date.now() - changing.start;
					universe.emit("cascaded", changing);
				}
			}
		}, 0);
	};

	/**
	 * Notifies the handler to update the values of dependent objects.
	 *
	 * This is essentially a surface update as the main values haven't changed.
	 * @method pushUpdated
	 * @param {String} id 
	 */
	this.pushUpdated = function(id) {
		// console.log("Update: ", inheritance[id]);
		mark[id] = Date.now();
		if(inheritance[id] && inheritance[id]._list.length) {
			var changing = {};
			changing.origin = id;
			changing.queue = inheritance[id]._list;
			changing.index = 0;
			changing.start = Date.now();
			trackUpdates(changing);
		}
	};
	
	/**
	 * 
	 * @method trackUpdates
	 * @private
	 * @param {Object} changing Used for trackign what objects have
	 * 		been changed as a crude loop prevention
	 */
	var trackUpdates = function(changing) {
		setTimeout(function() {
			var cascade = handler.retrieve(changing.queue[changing.index++]);
			if(cascade) {
				cascade.updateFieldValues();
				if(changing.index < changing.queue.length) {
					trackCalculations(changing);
				} else {
					changing.duration = Date.now() - changing.start;
					universe.emit("cascaded", changing);
				}
			}
		}, 0);
	};
	
	return this;
};
