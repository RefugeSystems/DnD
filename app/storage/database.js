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
		return JSON.parse(data);
	},
	"write": function(data) {
		return JSON.stringify(data);
	}
};
mapping.array = {
	"type": "text",
	"read": function(data) {
		return JSON.parse(data);
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
		if(mapping[field.type] && typeof(mapping[field.type].write) === "function") {
			mapped["$" + field.id] = mapping[field.type].write(write[field.id]);
		} else {
			mapped["$" + field.id] = write[field.id];
		}
	}
	return mapped;
};

var RSObject,
	RSField;

class RSDatabase extends EventEmitter {
	constructor(specification) {
		super();
		/**
		 * The configuration for this object.
		 * @property specification
		 * @type Object
		 */
		this.specification = specification;
		
		/**
		 * 
		 * @property ready
		 * @type Boolean
		 */
		this.ready = false;
		
		/**
		 * Maps field IDs to the RSField object.
		 * @property field
		 * @type Object
		 */
		this.field = {};
		/**
		 * Maps type name to the manager for that type.
		 * @property manager
		 * @type Object
		 */
		this.manager = {};
		/**
		 * Maps field IDs to the names of the Types using them.
		 * @property usage
		 * @type Object
		 */
		this.usage = {};
	}

	initialize(rsobject, rsfield, types) {
		RSObject = rsobject;
		RSField = rsfield;
		return new Promise((done, fail) => {
			this.connection = new sqlite3.Database(this.specification.file, sqlite3[this.specification.mode]);
			
			var loadFields,
				loadTypes,
				loading,
				x;
			
			loadFields = () => {
				this.database.connection.all("select * from rsfield;", emptyArray, (err, rows) => {
					if(err && err.message && err.message.indexOf("no such table") !== -1) {
						this.database.connection
						.run("create table rsfield (id text NOT NULL PRIMARY KEY, name text, description, text, inheritance text, inheritance text, type text, obscured boolean, attributes text, updated bigint, created bigint);", emptyArray, (err) => {
							if(err) {
								fail(err);
							} else {
								loadTypes([]);
							}
						});
					} else {
						for(x=0; x<rows.length; x++) {
							rows[x] = new RSField(this, rows[x]);
							this.field[rows[x].id] = rows[x];
						}
						loadTypes(rows);
					}
				});
			};
			
			loadTypes = () => {
				this.database.connection.all("select * from rstype;", emptyArray, (err, rows) => {
					if(err && err.message && err.message.indexOf("no such table") !== -1) {
						this.database.connection
						.run("create table rstype (id text NOT NULL PRIMARY KEY, name text, description, text, fields text, attributes text, updated bigint, created bigint);", emptyArray, (err) => {
							if(err) {
								fail(err);
							} else {
								done([]);
							}
						});
					} else {
						loading = [];
						for(x=0; x<rows.length; x++) {
							rows[x] = new TypeManager(rows[x], this);
							this.manager[rows[x].id] = rows[x];
							loading.push(rows[x].initialize());
						}
						
						Promise.all(loading)
						.then(function() {
							done(rows);
						})
						.catch(fail);
					}
				});
			};
			
			this.connection.on("open", function(err) {
				if(err) {
					fail(err);
				} else {
					loadFields();
				}
			});
		});
	}
	
	/**
	 *
	 * @method getField
	 * @param {String} name
	 * @return {RSField}
	 */
	getField(name) {
		return this.fields[name];
	};
	
	/**
	 * 
	 * @method createField
	 * @param {Object} specification [description]
	 * @param {Function} callback
	 * @return {RSField}
	 */
	createField(specification, callback) {
		return new Promise((done, fail) => {
			// TODO: Create a field
		});
	}
	
	/**
	 * The ID can not be changed while in use (See database.usage).
	 * @method updateField
	 * @param {String} id
	 * @param {Object} delta
	 * @param {Object} [delta.id]
	 * @param {Object} [delta.name]
	 * @param {Object} [delta.description]
	 * @param {Object} [delta.type]
	 * @param {Object} [delta.obscured]
	 * @param {Object} [delta.inheritance]
	 * @param {Object} [delta.inheritable]
	 * @param {Object} [delta.attribute]
	 * @param {Function} callback
	 * @return {RSField}
	 */
	updateField(id, delta, callback) {
		return new Promise((done, fail) => {
			var field = this.field[id];
			if(field) {
				if(delta.id && this.usage[id].length === 0) {
					field.id = delta.id;
				}
				// TODO: Finish field data update
			} else {
				callback(null);
			}
		});
	};
   
   /**
	* 
	* @event updated
	* @param  {Object} updated Field data.
	*/

	/**
	 *
	 * @method getTypeManager
	 * @param {String} name 
	 * @return {TypeManager}
	 */
	getTypeManager(name) {
		return this.managers[name];
	}
	
	
	createTypeManager(specification) {
		return new Promise((done, fail) => {
			if(!this.manager[specification.name]) {
				// TODO: Create a type manager
			}
		});
	}
	
	
	deleteTypeManager(name) {
		return new Promise((done, fail) => {
			if(this.manager[name]) {
				// TODO: Delete Type Manager
				 
				// TODO: Rename table to "deleted#[TIMESTAMP]$" for preservation
			}
		});
	}

	/**
	 *
	 * @method validateFieldValue
	 * @param {String} name 
	 * @param {Number | String | Array | Object} value 
	 * @return {Boolean}
	 */
	validateFieldValue(field, value) {
		if(field.type) {
			if(mapping[field.type] && mapping[field.type].typeValue) {
				return typeof(value) === mapping[field.type].typeValue;
			} else if(mapping[field.type] && typeof(mapping[field.type].checkType) === "function") {
				return mapping[field.type].checkType(value);
			} else {
				return true;
			}
		} else {
			return typeof(value) === "string";
		}
	}

	/**
	 * Closes all associated TypeManagers and then itself, releasing the connection
	 * to the underlying database.
	 * @method close
	 * @return {Promise}
	 */
	close() {
		return new Promise((done, fail) => {
			var types = Object.keys(this.managers),
				waiting = [],
				x;

			for(x=0; x<types.length; x++) {
				waiting.push(this.managers[types[x]].close());
			}

			Promise.all(waiting)
			.then(() => {
				return new Promise((done, fail) => {
					this.connection.close((err) => {
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
	}
}

module.exports = RSDatabase;

/**
 *
 * @class TypeManager
 * @constructor
 * @param {String} name Of the table to be managed.
 * @param {RSDatabase} database
 * @param {Array} fields
 */
class TypeManager extends EventEmitter {
	constructor(specification, database) {
		super();
		var x;

		this.id = specification.id;
		
		this.name = specification.name;
		
		this.specification = specification;

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
		 * @property defaultFieldValues
		 * @type Object
		 */
		this.defaultFieldValues = {};
		/**
		 *
		 * @property fields
		 * @type Array | RSField
		 */
		this.fields = specification.fields;
		if(this.fields) {
			this.fields = JSON.parse(this.fields);
		} else {
			this.fields = [];
		}
 		/**
 		 *
 		 * @property fieldCache
 		 * @type Object
 		 */
 		this.fieldCache = {};
 		/**
 		 * Cache mapping field IDs to their value for lookup.
 		 * @property fieldIDs
 		 * @type Array | String
 		 */
		this.fieldIDs = [];
		for(x=0; x<this.fields.length; x++) {
			this.fieldCache[this.fields[x].id] = true; // Use Database for lookup
			this.fieldIDs.push(this.fields[x].id);
		}
		/**
		 *
		 * @property attributes
		 * @type Object
		 */
		this.attributes = specification.attributes;
		if(this.attributes) {
			this.attributes = JSON.parse(this.attributes);
		} else {
			this.attributes = {};
		}
	}

	/**
	 *
	 * @method initialize
	 * @return {Promise}
	 */
	initialize() {
		this.statements = {};
		return new Promise((done, fail) => {
			this.database.connection.all("select * from " + this.name + ";", emptyArray, (err, rows) => {
				if(err && err.message && err.message.indexOf("no such table") !== -1) {
					this.database.connection
					.run("create table " + this.name + " (id text NOT NULL PRIMARY KEY" + mapping._toCommand(this.fields) + ", _grid text, _x integer, _y integer, updated bigint, created bigint);", emptyArray, (err) => {
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
	 * @method isField
	 * @param {String | RSField} field To check if present
	 * @return {Boolean} True if the field is part of this Type.
	 */
	isField(field) {
		return !!this.fieldCache[field.id || field];
	}

	/**
	 *
	 * @method addField
	 * @param {String} field ID to add to this TypeManager. This field ID must
	 * 		be defined or the operation will fail.
	 */
	addField(id) {
		var field = this.database.fields[id],
			details;
		
		return new Promise((done, fail) => {
			if(!field) {
				details = {};
				details.database = this.database.specification.name || this.database.specification.id || this.database.specification.file || "appdb";
				details.operation = "add";
				details.field = id;
				fail(new Anomaly("type:field:addemove", "Undefined field for database", 50, details, null, this));
			} else if(this.fieldCache[field.id]) {
				done();
			} else {
				var params = {};
				params["$field"] = field.id;
				params["$type"] = field.type;
				this.database.connection
				.run("alter table " + this.name + " add $field $type;", params, (err) => {
					if(err) {
						fail(err);
					} else {
						done();
					}
				});
			}
		});
	}

	/**
	 *
	 * @method removeField
	 * @param {String} field ID to remove from this TypeManager. This field ID must
	 * 		be defined or the operation will fail.
	 */
	removeField(id) {
		var field = this.database.fields[id],
			params = {},
			details;
		
		return new Promise((done, fail) => {
			if(!field) {
				details = {};
				details.database = this.database.specification.name || this.database.specification.id || this.database.specification.file || "appdb";
				details.operation = "remove";
				details.field = id;
				fail(new Anomaly("type:field:remove", "Undefined field for database", 50, details, null, this));
			} else if(this.fieldCache[id]) {
				params["$field"] = field.id;
				this.database.connection
				.run("alter table " + this.name + " drop column $field;", params, (err) => {
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
			statement = mapping._toInsert(this.name, fields, object);
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
			var params = {};
			params["$id"] = id;
			this.database.connection.all("select * from " + this.name + " where id = $id;", params, (err, rows) => {
				if(err) {
					callback(err);
				} else if(rows && rows.length) {
					callback(undefined, rows?this._transcribeObject(rows[0]):null);
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
	 * @param {Function} callback
	 * @return {RSObject}
	 */
	getObjectData(id, callback) {
		if(this.objects[id]) {
			callback(this.objects[id]);
		} else {
			
		}
	}

	/**
	 *
	 * @method setTypeDefaults
	 * @param {Object} defaults Maps field ID to the value to use as a default. Accepts
	 * 		fields that are not defined to this Type but objects should not set those.
	 */
	setTypeDefaults(defaults) {
		this.defaultFieldValues = defaults;
	}

	/**
	 *
	 * @method setTypeDefault
	 * @param {String} field
	 * @param {Number | String | Boolean | Object | Array} value To set for the default.
	 * 		If `null` is passed, then the mapping is deleted instead.
	 */
	setTypeDefault(field, value) {
		if(value === null) {
			delete(this.defaultFieldValues[field]);
		} else {
			this.defaultFieldValues[field] = value;
		}
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
			this.database.connection.run("delete from " + this.name + " where id = $id;", {"$id":id}, callback);
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

		this.database.connection.all("select * from " + this.name + " where _grid is null or _grid = $grid;", grid, (err, rows) => {
			if(err) {
				callback(err);
			} else if(rows && rows.length) {
				if(rows) {
					for(var x=0; x<rows.length; x++) {
						rows[x] = this._transcribeObject(rows[x]);
					}
				}
				callback(undefined, rows);
			} else {
				callback(new Error("Failed to find any objects"));
			}
		});
	}


	_transcribeObject(object) {
		var field,
			x;

		if(object) {
			for(x=0; x<this.fields.length; x++) {
				field = this.fields[x];
				if(object[field.id]) {
					if(mapping[field.type] && typeof(mapping[field.type].read) === "function") {
						object[field.id] = mapping[field.type].read(object[field.id]);
					} else {
						object[field.id] = object[field.id];
					}
				}
			}
		}
		
		return object;
	}


	_translateObject(object) {
		var result = {},
			field,
			x;

		if(object) {
			result.id = object.id;
			result._grid = object._grid;
			result._x = object._x;
			result._y = object._y;
			result.updated = object.updated;
			result.created = object.created;

			for(x=0; x<this.fields.length; x++) {
				field = this.fields[x];
				if(object[field.id]) {
					if(mapping[field.type] && typeof(mapping[field.type].read) === "function") {
						result[field.id] = mapping[field.type].read(object[field.id]);
					} else {
						result[field.id] = object[field.id];
					}
				}
			}
		}
		return result;
	}
};
