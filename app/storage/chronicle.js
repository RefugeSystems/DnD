/**
 * 
 *
 * @class Chronicle
 * @constructor
 * @extends EventEmitter
 * @param {Universe} universe
 */
 
var EventEmitter = require("events").EventEmitter,
	Anomaly = require("../management/anomaly"),
	RSRandom = require("rs-random"),
	emptyArray = [],
	validField = {},
	validTypes = {},
	count = 0;
	
validField.timeline = true;
validField.source = true;
validField.target = true;
validField.type = true;

// Object state changes
validTypes["object"] = true;
// Something that occured in the world
validTypes["occurance"] = true;



class Chronicle extends EventEmitter {
	constructor(universe) {
		super();
		this.id = "chronicle:controller";
		this.universe = universe;
		
		var receiveObjectData = (delta) => {
			if(universe.initialized && universe.manager[delta._class] && !universe.manager[delta._class].attribute.server_only) {
				this.addOccurrence("object", delta, universe.time, null, delta.id);
			}
		};
		
		universe.on("object-updated", receiveObjectData);
		universe.on("object-created", receiveObjectData);
	}
	
	/**
	 *
	 * @method initialize
	 * @param {RSObjectReferrer} objectHandler
	 * @return {Promise}
	 */
	initialize(objectHandler) {
		this.database = objectHandler.getDatabase();
		return new Promise((done, fail) => {
			this.database.connection.all("select id from chronicle where id = 0;", emptyArray, (err, rows) => {
				if(err) {
					if(err.message && err.message.indexOf("no such table") !== -1) {
						this.database.connection
						.run("create table chronicle (id text NOT NULL PRIMARY KEY, type text, emit text, source text, target text, involved text, time bigint, timeline integer, event text, updated bigint, created bigint);", [], (err) => {
							if(err) {
								fail(err);
							} else {
								done(this);
							}
						});
					} else {
						fail(err);
					}
				} else {
					done(this);
				}
			});
		});
	}
	
	
	reinitialize() {
		return new Promise((done, fail) => {
			this.database.connection.run("drop table if exists chronicle;", emptyArray, (err, rows) => {
				if(err) {
					console.log("Reinit Err: ", err);
					fail(err);
				} else {
					this.database.connection
					.run("create table chronicle (id text NOT NULL PRIMARY KEY, type text, source text, target text, time bigint, timeline integer, event text, updated bigint, created bigint);", [], (err) => {
						if(err) {
							console.log("Reinit Make Err: ", err);
							fail(err);
						} else {
							done(this);
						}
					});
				}
			});
		});
	}
	
	/**
	 * 
	 * @method addOccurrence
	 * @param {String} type
	 * @param {Object} event
	 * @param {String} [event.source]
	 * @param {String} [event.target]
	 * @param {String} [event.time] [description] Gametime offset for the event.
	 * 		Specified here or as a seperate parameter. Defaults to current universe
	 * 		time.
	 * @param {Integer} [time] Gametime offset for the event. Specified here or on
	 * 		the event. Defaults to current universe time.
	 * @param {String} [source] Object ID
	 * @param {String} [target] Object ID
	 * @param {Integer} [timeline] Which tracks the number of times the universe
	 * 		has passed through a given time period.
	 * @param {String} [emit] For EventEmitter
	 * @param {Array} [involved] Other loosely associated objects.
	 * @return {String} The chronicle ID for the event
	 */
	addOccurrence(type, event, time, source, target, timeline, emit, involved) {
		var values = {};
		values["$id"] = "chronicle:" + Date.now() + ":" + (count++) + ":" + (event.id || RSRandom.string(32));
		values["$timeline"] = timeline || event.timeline || this.universe.timeline || null;
		values["$time"] = time || event.time || this.universe.time || null;
		values["$source"] = source || event.source || null;
		values["$target"] = target || event.target || null;
		values["$event"] = JSON.stringify(event);
		values["$type"] = type;
		values["$emit"] = emit || null;
		values["$updated"] = Date.now();
		values["$created"] = values["$updated"];
		this.database.connection.run("insert into chronicle(id, type, emit, source, target, time, timeline, event, updated, created) values($id, $type, $emit, $source, $target, $time, $timeline, $event, $updated, $created);", values, (err) => {
			if(err) {
				this.emit("error", {
					"type": "add",
					"occurrence": values["$id"],
					"event": event,
					"error": err
				});
			}
		});
		if(count > 1000) {
			count = 0;
		}
		return values["$id"];
	}
	
	/**
	 * 
	 * @method removeOccurrence
	 * @param {String} id [description]
	 */
	removeOccurrence(id) {
		var values = {};
		values["$id"] = id;
		this.database.connection.run("delete from chronicle where id = $id;", values, (err) => {
			if(err) {
				this.emit("error", new Anomaly("chronicle:event:remove", "Failed to remove event from Chronicle", 40, {values}, err, this));
			}
		});
	}
	
	/**
	 * 
	 * @method updateOccurrence
	 * @param {String} id
	 * @param {Object} event
	 * @param {String} [type]
	 * @param {Integer} [time]
	 * @param {String} [source]
	 * @param {String} [target]
	 * @param {Integer} [timeline]
	 * @param {String} [emit]
	 * @param {Array | String} [involved]
	 */
	updateOccurrence(id, event, type, time, source, target, timeline, emit, involved) {
		var statement = "update chronicle set event = $event, updated = $updated",
			values = {};
		values["$id"] = id;
		values["$event"] = JSON.stringify(event);
		values["$updated"] = Date.now();
		if(type) {
			statement += ", type = $type";
			values["$type"] = type;
		}
		if(time || event.timeline) {
			statement += ", timeline = $timeline";
			values["$timeline"] = timeline || event.timeline;
		}
		if(time || event.time) {
			statement += ", time = $time";
			values["$time"] = time || event.time;
		}
		if(source || event.source) {
			statement += ", source = $source";
			values["$source"] = source || event.source;
		}
		if(target || event.target) {
			statement += ", target = $target";
			values["$target"] = target || event.target;
		}
		if(emit || event.emit) {
			statement += ", emit = $emit";
			values["$emit"] = emit || event.emit;
		}
		if((involved || event.involved) instanceof Array) {
			statement += ", involved = $involved";
			values["$involved"] = involved || event.involved;
			values["$involved"] = values["$involved"].join(",");
		}
		statement += " where id = $id;";
		this.database.connection.run(statement, values, (err) => {
			if(err) {
				this.emit("error", new Anomaly("chronicle:event:update", "Failed to update event from Chronicle", 40, {values}, err, this));
			}
		});
	}
	
	/**
	 * 
	 * @method getOccurrence
	 * @param {[String]} id     [description]
	 * @param {Function} callback  [description]
	 */
	getOccurrence(id, callback) {
		this.database.connection.all("select * from chronicle where id = $id;", {"$id": id}, callback);
	}
	
	/**
	 *
	 * The end time is NOT included as it is generally treated as the "current"
	 * time. So trailing queried for progression should always include everything
	 * as needed.
	 * @method getOccurrences
	 * @param {Integer} start The included time at which to start the query.
	 * @param {Integer} end The excluded time at which to end the query.
	 * @param {Object} [constrict] Restricts the time search for events.
	 * @param {String} [constrict.type] Optional restriction on the type of event to get.
	 * 		Typically this will be "verse" for events in the universe that happen
	 * 		at that time, such as news or objects changing.
	 * @param {Integer} [constrict.timeline]
	 * @param {String} [constrict.target]
	 * @param {String} [constrict.source]
	 * @param {Function(err,chronicled)} callback Note that the chronicled Occurrences
	 * 		have the "event" property as a JSON string and will need decoded.
	 * 		This is not done here to save looping through the values twice and
	 * 		is handled in the universe.
	 */
	getOccurrences(start, end, constrict, callback) {
		var statement = "select * from chronicle where $start <= time and time < $end",
			suffix = " order by time",
			values = {},
			keys,
			x;
			
		if(start === end) {
			end++;
		}
		
		if(typeof(constrict) === "function") {
			callback = constrict;
			constrict = undefined;
		}
		
		if(start <= end) {
			values["$start"] = start;
			values["$end"] = end;
			suffix += "ASC";
		} else {
			values["$start"] = end;
			values["$end"] = start;
			suffix += "DESC";
		}
			
		if(constrict) {
			/* Desired path but cleaning to prevent injection feels expensive
			keys = Object.keys(constrict);
			for(x=0; x<keys.length; x++) {
				statement += " and " + keys[x].replace(" ", "") + " = $" + keys[x];
				values["$" + keys[x]] = constrict[keys[x]];
			}
			*/
			keys = Object.keys(constrict);
			for(x=0; x<keys.length; x++) {
				if(validField[keys[x]]) {
					statement += " and " + keys[x] + " = $" + keys[x];
					values["$" + keys[x]] = constrict[keys[x]];
				}
			}
		}
		statement += suffix + ";";
		
		this.database.connection.all(statement, values, callback);
	}
}

module.exports = Chronicle;

/**
 *
 * @event error
 * @param {Error | Anomaly} error The error encountered
 */

/**
 * Used to track events that have happened or events that will transpire.
 *
 * For things with multiple targets, multiple Occurrences are prefered.
 *
 * When triggered by a read, 
 * @class Occurrence
 * @constructor
 */
 
/**
 *
 * @property id
 * @type String
 */
 
/**
 * The type of Occurrence. This is used to select the simulation processor
 * for this Occurrence.
 * @property type
 * @type String
 */
 
/**
 * When set, this is emitted from the universe for event handling.
 * @property emit
 * @type String
 */

/**
 * This is set by the universe for processing.
 *
 * When true, this event is going backwards through time and handlers should
 * apply the inversion of their usual function.
 * @property reverse
 * @type Boolean
 */

/**
 * The source of the occurrence. Generally required, though some occurrences
 * (such as a newspaper publishing of a session recap or similar) may only populate
 * the involved.
 * @property source
 * @type String
 */
 
/**
 * The target of the occurrence. Not generally required.
 * @property target
 * @type String
 */
 
/**
 * Comma separated list of other objects involved in this occurrence beyond the
 * source and target if any are indicated. This should usually track informationally
 * related pieces and not objects actually involved in processing the occurrence.
 * @property involved
 * @type String
 */

/**
 * The in-game time for when this occurs
 * @property time
 * @type Integer
 */
 
/**
 * For timetravel, tracks which "version" of the timeline is currently active,
 * every reversal increments by one, but a timeline can in theory be "resumed"
 * @property timeline
 * @type String
 */
 
/**
 *
 * @property event
 * @type String
 */
 
/**
 *
 * @property updated
 * @type Integer
 */
 
/**
 *
 * @property created
 * @type Integer
 */
