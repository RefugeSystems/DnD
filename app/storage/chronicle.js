/**
 * 
 *
 * @class Chronicle
 * @extends EventEmitter
 * @param {RSDatabase} database
 */
 
var EventEmitter = require("events").EventEmitter,
	Anomaly = require("../management/anomaly"),
	RSRandom = require("rs-random"),
	emptyArray = [],
	validField = {},
	validTypes = {},
	count = 0;

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
				this.addEvent("object", delta, universe.time, null, delta.id);
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
						.run("create table chronicle (id text NOT NULL PRIMARY KEY, type text, source text, target text, time bigint, event text, updated bigint, created bigint);", [], (err) => {
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
					.run("create table chronicle (id text NOT NULL PRIMARY KEY, type text, source text, target text, time bigint, event text, updated bigint, created bigint);", [], (err) => {
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
	 * @method addEvent
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
	 * @return {String} The chronicle ID for the event
	 */
	addEvent(type, event, time, source, target) {
		var values = {};
		values["$id"] = "chronicle:" + Date.now() + ":" + (count++) + ":" + (event.id || RSRandom.string(32));
		values["$time"] = time || event.time || this.universe.time;
		values["$source"] = source || event.source;
		values["$target"] = target || event.target;
		values["$event"] = JSON.stringify(event);
		values["$type"] = type;
		values["$updated"] = Date.now();
		values["$created"] = values["$updated"];
		this.database.connection.run("insert into chronicle(id, type, source, target, time, event, updated, created) values($id, $type, $source, $target, $time, $event, $updated, $created);", values, (err) => {
			if(err) {
				this.emit("error", err);
			}
		});
		if(count > 1000) {
			count = 0;
		}
		return values["$id"];
	}
	
	/**
	 * 
	 * @method removeEvent
	 * @param {String} id [description]
	 */
	removeEvent(id) {
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
	 * @method updateEvent
	 * @param {String} id
	 * @param {Object} event
	 * @param {String} [type]
	 * @param {Integer} [time]
	 * @param {String} [source]
	 * @param {String} [target]
	 */
	updateEvent(id, event, type, time, source, target) {
		var statement = "update chronicle set event = $event, updated = $updated",
			values = {};
		values["$id"] = id;
		values["$event"] = JSON.stringify(event);
		values["$updated"] = Date.now();
		if(type) {
			statement += ", type = $type";
			values["$type"] = type;
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
		statement += " where id = $id;";
		this.database.connection.run(statement, values, (err) => {
			if(err) {
				this.emit("error", new Anomaly("chronicle:event:update", "Failed to update event from Chronicle", 40, {values}, err, this));
			}
		});
	}
	
	/**
	 *
	 * The end time is NOT included as it is generally treated as the "current"
	 * time. So trailing queried for progression should always include everything
	 * as needed.
	 * @method getEvents
	 * @param {Integer} start The included time at which to start the query.
	 * @param {Integer} end The excluded time at which to end the query.
	 * @param {Object} [constrict] Restricts the time search for events.
	 * @param {String} [constrict.type] Optional restriction on the type of event to get.
	 * 		Typically this will be "verse" for events in the universe that happen
	 * 		at that time, such as news or objects changing.
	 * @param {String} [constrict.target]
	 * @param {String} [constrict.source]
	 * @param {Function(err,chronicled)} callback Note that the chronicled values
	 * 		have the "event" property as a JSON string and will need decoded.
	 * 		This is not done here to save looping through the values twice and
	 * 		is handled in the universe.
	 */
	getEvents(start, end, constrict, callback) {
		var statement = "select * from chronicle where $start <= time and time < $end",
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
		
		values["$start"] = start;
		values["$end"] = end;
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
		statement += ";";
		
		this.database.connection.all(statement, values, callback);
	}
}

module.exports = Chronicle;

/**
 *
 * @event error
 * @param {Error | Anomaly} error The error encountered
 */
