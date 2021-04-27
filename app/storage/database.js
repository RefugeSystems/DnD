/**
 *
 * @class RSDatabase
 * @constructor
 * @param {Object} specification
 */

var EventEmitter = require("events").EventEmitter,
	Anomaly = require("../management/anomaly"),
	sqlite3 = require("sqlite3").verbose(),
	emptyArray = [],
	mapping = {};

/**
 *
 * @property mapping
 * @type Object
 * @private
 * @static
 */
mapping.dice = {
	"type": "text"
};
mapping.integer = {
	// 1:1
};
mapping.string = {
	"type": "text"
};
mapping.number = {
	"type": "double"
};
mapping.object = {
	"type": "text",
	"read": function(data) {
		JSON.parse(data);
	},
	"write": function(data) {
		return JSON.stringify(data);
	}
};
mapping.array = {
	"type": "text",
	"read": function(data) {
		JSON.parse(data);
	},
	"write": function(data) {
		return JSON.stringify(data);
	}
};

/**
 * Sets various properties on an object to cache command strings.
 * @method mapping._buildStrings
 * @private
 * @static
 * @param {Array} fields  [description]
 * @param {Object} [strings] [description]
 * @return {[type]}         [description]
 */
mapping._buildStrings = function(fields, strings) {
	if(!strings) {
		strings = {};
	}
	strings.identifiers = "";
	strings.columns = "";
	strings.create = "";
	for(var x=0; x<fields.length; x++) {
		strings.columns += ", \"" + fields[x].id + "\"";
		strings.identifiers += ", $" + fields[x].id;
		if(mapping[fields[x].type]) {
			strings.create += ", " + fields[x].id + " " + (mapping[fields[x].type].type || fields[x].type);
		} else {
			throw new Error("Unknown field type: " + fields[x].id + " - " + fields[x].type);
		}
	}
	return strings;
};

/**
 *
 * Returned string starts with a leading comma for field usage. This is due to an
 * assumption that at the least ID will be specified prior to these column
 * specifications.
 * @method mapping._toCommand
 * @private
 * @static
 * @param {Array | RSField} fields
 * @return {String}
 */
mapping._toCommand = function(fields) {
	var command = "";
	for(var x=0; x<fields.length; x++) {
		if(mapping[fields[x].type]) {
			command += ", " + fields[x].id + " " + mapping[fields[x].type].type;
		} else {
			// TODO: Warning or thrown?
		}
	}
	return command;
};

/**
 * Field names quoted for SQL command usage. Used for dynamic command creation.
 * 
 * Returned string starts with a leading comma for field usage. This is due to an
 * assumption that at the least ID will be specified prior to these column
 * specifications.
 * @method mapping._toColumns
 * @private
 * @static
 * @param {Array | RSField | String} fields
 * @return {String}
 */
mapping._toColumns = function(fields) {
	var command = "";
	for(var x=0; x<fields.length; x++) {
		command += ", \"" + (fields[x].id || fields[x]) + "\"";
	}
	return command;
};

/**
 * 
 * @method mapping._toInsert
 * @private
 * @static
 * @param {String} name Of the table
 * @param {Array | String} fields Strings matching field names.
 * @param {Object} write The Object with the changes to write. This does NOT
 * 		have to specify every field.
 * @return {String}
 */
mapping._toInsert = function(name, fields, write) {
	var columns = "(id, created, updated",
		values = "($id, $created, $updated",
		field;
	for(var x=0; x<fields.length; x++) {
		if(write[fields[x]]) {
			field = fields[x].id || fields[x];
			columns += ", " + field;
			values += ", $" + field;
		}
	}
	return "insert into " + name + " " + columns + ") values " + values + ");";
};

/**
 * Field name identifiers for SQL command usage as "$" + field.name. Used for
 * dynamic command creation.
 * 
 * Returned string starts with a leading comma for field usage. This is due to an
 * assumption that at the least ID will be specified prior to these column
 * specifications.
 * @method mapping._toIdentifiers
 * @private
 * @static
 * @param {Array | RSField | String} fields
 * @return {String}
 */
mapping._toIdentifiers = function(fields) {
	var command = "";
	for(var x=0; x<fields.length; x++) {
		command += ", $" + (fields[x].id || fields[x]);
	}
	return command;
};

/**
 * Map an object to field identifiers for database writing.
 * @method mapping._toObject
 * @private
 * @static
 * @param {RSField} fields
 * @param {Object} write The Object with the changes to write. This does NOT
 * 		have to specify every field.
 * @param {Boolean} [create] When true, the $created value is also set.
 * @return {Object} 
 */
mapping._toObject = function(fields, write, create) {
	var mapped = {},
		field;
	mapped["$id"] = write.id;
	mapped["$updated"] = Date.now();
	if(create) {
		mapped["$created"] = Date.now();
	}
	for(var x=0; x<fields.length; x++) {
		field = fields[x];
		if(mapping[field.type] && mapping[field.type].write) {
			mapped["$" + field.id] = mapping[field.type].write(write[field.id]);
		} else {
			mapped["$" + field.id] = write[field.id];
		}
	}
	return mapped;
};

module.exports = function(specification, configuration) {
	var database = this,
		managers = {};

	this.connection = new sqlite3.Database(specification.file, sqlite3[specification.mode]);

	/**
	 *
	 * @method getTableManager
	 * @param {String} name [description]
	 * @return {TypeManager}      [description]
	 */
	this.getTypeManager = function(name) {
		if(!managers[name]) {
			managers[name] = new TypeManager(name, database);
		}
		return managers[name];
	};
	
	/**
	 * Closes all associated TypeManagers and then itself, releasing the connection
	 * to the underlying database.
	 * @method close
	 * @return {Promise} 
	 */
	this.close = function() {
		return new Promise(function(done, fail) {
			var types = Object.keys(managers),
				waiting = [],
				x;
				
			for(x=0; x<types.length; x++) {
				waiting.push(managers[types[x]].close());
			}
			
			Promise.all(waiting)
			.then(function() {
				return new Promise(function(done, fail) {
					database.connection.close(function(err) {
						if(err) {
							fail(err);
						} else {
							done();
						}
					});
				});
			})
			.then(done)
			.catch(fail);
		});
	};

	this.log = {};
	this.log.info = function(message,error) {

	};
	this.log.warning = function(message,error) {

	};
	this.log.error = function(message,error) {

	};
};

/**
 *
 * @class TypeManager
 * @constructor
 * @param {String} name Of the table to be managed.
 * @param {RSDatabase} database
 * @param {Array} fields
 */
class TypeManager extends EventEmitter {
	constructor(name, database) {
		super();
		
		this.name = name;
		
		this.database = database;
		
		/**
		 * 
		 * @property statements
		 * @type Object
		 */
		this.statements = {};
		/**
		 * 
		 * @property objects
		 * @type Object
		 */
		this.objects = {};
		/**
		 * 
		 * @property Strings
		 * @type Object
		 */
		this.strings = {};
		/**
		 * 
		 * @property fields
		 * @type Array | RSField
		 */
		this.fields = [];
		/**
		 * Cache mapping field IDs to their value for lookup.
		 * @property _fields
		 * @type Object | RSField
		 */
		this._fields = {};
	}

	/**
	 *
	 * @method initialize
	 * @param  {Array} fields
	 * @param  {Array} [default_data]
	 * @return {Promise}
	 */
	initialize(fields, default_data) {
		var manager = this;
		this.fields.splice(0);
		this.fields.push.apply(this.fields, fields);
		this.strings = mapping._buildStrings(this.fields, this.strings);
		this.statements = {};
		
		return new Promise((done, fail) => {
			this.database.connection.all("select * from " + this.name + ";", emptyArray, (err, rows) => {
				if(err && err.message && err.message.indexOf("no such table") !== -1) {
					this.database.connection
					.run("create table " + this.name + " (id text NOT NULL PRIMARY KEY" + mapping._toCommand(fields) + ", _grid text, _x integer, _y integer, updated bigint, created bigint);", emptyArray, (err) => {
						if(err) {
							fail(err);
						} else {
							done();
						}
					});
				} else {
					done();
				}
			});
		});
	}
	
	/**
	 * 
	 * @method close
	 * @return {Promise} 
	 */
	close() {
		return new Promise((done) => {
			this.emit("closed", this);
			done();
		});
	}
	
	/**
	 * 
	 * @method writeObjectData
	 * @param {Object} object Delta to write. This specifies the new field values
	 * 		for the object that matches the incoming `object.id`. If none is defined,
	 * 		then a new object is inserted.
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	writeObjectData(object, callback) {
		if(!object || !object.id) {
			throw new Error("Unable to write object with no ID: " + JSON.stringify(object));
		}
		
		var fields = Object.keys(object),
			sid = fields.join(),
			statement,
			write,
			x;
			
		if(this.objects[object.id]) {
			// update
			// TODO: Verify fields are valid for this Type during write
			write = mapping._toObject(this.fields, object, false);
			if(this.statements[sid]) {
				statement = this.statements[sid];
			} else {
				statement = "update " + this.name + " set updated = $updated";
				for(x=0; x<fields.length; x++) {
					statement += ", " + fields[x] + " = $" + fields[x];
				}
				this.statements[sid] = statement += " where id = $id;";
			}
		} else {
			// insert
			write = mapping._toObject(this.fields, object, true);
			this.objects[object.id] = {};
			statement = mapping._toInsert(name, fields, object);
		}
		
		this.database.connection.run(statement, write, callback);
		Object.assign(this.objects[object.id], object);
	}
	
	/**
	 * 
	 * @method retrieveObjectData
	 * @param {String} id
	 * @param {Function} callback 
	 * @param {Boolean} force To force the Manager to pull the data from the database
	 * 		instead of from the cached version.
	 */
	retrieveObjectData(id, callback, force) {
		if(!id) {
			throw new Error("Unable to retrieve without an object ID");
		}
		
		if(force) {
			this.database.connection.all("select * from " + name + " where id = $id;", {"$id":id}, (err, rows) => {
				if(err) {
					callback(err);
				} else if(rows && rows.length) {
					callback(undefined, rows?this._translateObject(rows[0]):null);
				} else {
					callback(new Error("Failed to find object"));
				}
			});
		} else {
			callback(null, this.objects[id]);
		}
	}
	
	/**
	 *
	 * @method getObjectData
	 * @param {String} id 
	 * @return {Object} Raw object data for the specified ID.
	 */
	getObjectData(id) {
		return this.objects[id];
	}
	
	/**
	 * 
	 * @method deleteObject
	 * @param {String | Object} object The object to delete with the ID or the ID
	 * 		of the object to delete.
	 * @param {Function} callback
	 */
	deleteObject(object, callback) {
		var id;
		if(!object || !(id = object.id || object)) {
			throw new Error("Unable to delete an object with no ID: " + JSON.stringify(object));
		}
		
		if(this.objects[id]) {
			this.database.connection.run("delete from " + name + " where id = $id;", {"$id":id}, callback);
			delete this.objects[id];
		}
		
		this.emit("deleted", id);
		callback();
	};
	
	
	
	/**
	 * 
	 * @method retrieveAllData
	 * @param {String} [grid] Specifying which grid to retrieve. This is for larger
	 * 		table filtering and initialization to retrieve large sets based on
	 * 		abstract locations within the world and reduce the number of objects
	 * 		actively being tracked. A `null` grid is valid and indicates that data
	 * 		should always be loaded and kept active.
	 * @param {Function} callback Receives an `Error` argument followed by an
	 * 		`Array` argument with the row data from the this.database.
	 */
	retrieveAllData(grid, callback) {
		if(grid && !callback) {
			callback = grid;
			grid = null;
		}
		
		grid = {"$grid":grid};
		
		this.database.connection.all("select * from " + name + " where _grid is null or _grid = $grid;", grid, (err, rows) => {
			if(err) {
				callback(err);
			} else if(rows && rows.length) {
				if(rows) {
					for(var x=0; x<rows.length; x++) {
						rows[x] = this._translateObject(rows[x]);
					}
				}
				callback(undefined, rows);
			} else {
				callback(new Error("Failed to find any objects"));
			}
		});
	}

	/**
	 *
	 * @method guarenteeData
	 * @param {Array} data [description]
	 * @return {Promise}
	 */
	guarenteeData(data) {
		
	};
	
	
	_translateObject(object) {
		console.log(">> Translate:" , object, this.fields);
		var result = {},
			field,
			x;
		
		if(object) {
			result.id = object.id;
			result._grid = object.id;
			result._x = object.id;
			result._y = object.id;
			result.updated = object.updated;
			result.created = object.created;
			
			for(x=0; x<this.fields; x++) {
				field = this.fields[x];
				if(object[field.id]) {
					result[field.id] = mapping[field.type].read?mapping[field.type].read(object[field.id]):object[field.id];
				}
			}
		}
		console.log(">> Result:", result);
		return result;
	}
};
