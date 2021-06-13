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
	
require("../extensions/string");
require("../extensions/array");

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
	"type": "integer"
};
mapping.calculated = mapping.computed = {
	"type": "text"
};
mapping.text = mapping.string = {
	"type": "text"
};
mapping.date = mapping.time = {
	"type": "integer"
};
mapping.gametime = {
	"type": "integer"
};
mapping.boolean = {
	"type": "boolean"
};
mapping.number = {
	"type": "real"
};
mapping.file = {
	"type": "text"
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
mapping["object:calculated"] = {
	"type": "text",
	"read": function(data) {
		return JSON.parse(data);
	},
	"write": function(data) {
		return JSON.stringify(data);
	}
};
mapping["object:dice"] = {
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
			throw new Error("Unknown Field Type: " + (fields[x].id || fields[x]));
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
		field = fields[x].id || fields[x];
		if(write[field] !== undefined) {
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
		if(field && !field.disabled && write[field.id] !== undefined) {
			if(mapping[field.type] && typeof(mapping[field.type].write) === "function") {
				mapped["$" + field.id] = mapping[field.type].write(write[field.id]);
			} else {
				mapped["$" + field.id] = write[field.id];
			}
		}
	}
	return mapped;
};

var fieldColumns = ["name", "description", "ordering", "inheritance", "inheritable", "classes", "type", "obscured", "displayed_as", "attribute"],
	classColumns = ["name", "description", "fields", "attribute"],
	validClassIdentifier = new RegExp("^[a-z][a-z0-9_]+$"),
	RSObject,
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

	/**
	 * 
	 * @method initialize
	 * @param  {Object} constructors Maps a class ID to a Constructor for that
	 * 		class. Unspecified constructors default to RSObject.
	 * @param  {Class} [rsobject] For the RSObject constructor
	 * @param  {Class} [rsfield] For the RSField constructor
	 * @param {Boolean} [skip_load] When true, skips loading fields and classes.
	 * 		This is to support recovery mode where only the raw connection is
	 * 		needed.
	 * @return {Promise} 
	 */
	initialize(constructors, rsobject, rsfield, skip_load) {
		RSObject = rsobject || require("./rsobject");
		RSField = rsfield || require("./rsfield");
		if(constructors) {
			this.constructor = constructors;
		} else {
			this.constructor = {};
		}
		
		this.constructor._general = RSObject;
		return new Promise((done, fail) => {
			this.connection = new sqlite3.Database(this.specification.file, sqlite3[this.specification.mode]);
			
			var loadFields,
				loadClasses,
				loadTables,
				loading,
				x;
			
			loadFields = () => {
				this.connection.all("select * from rsfield;", emptyArray, (err, rows) => {
					if(err) {
						if(err.message && err.message.indexOf("no such table") !== -1) {
							this.connection
							.run("create table rsfield (id text NOT NULL PRIMARY KEY, name text, description text, ordering integer, displayed_as text, inheritance text, inheritable text, classes text, obscured boolean, type text, attribute text, updated bigint, created bigint);", emptyArray, (err) => {
								if(err) {
									fail(err);
								} else {
									loadClasses();
								}
							});
						} else {
							fail(err);
						}
					} else {
						for(x=0; x<rows.length; x++) {
							rows[x] = new RSField(rows[x]);
							this.field[rows[x].id] = rows[x];
						}
						loadClasses();
					}
				});
			};
			
			loadClasses = () => {
				this.connection.all("select * from rsclass;", emptyArray, (err, rows) => {
					if(err) {
						if(err.message && err.message.indexOf("no such table") !== -1) {
							this.connection
							.run("create table rsclass (id text NOT NULL PRIMARY KEY, name text, description text, fields text, attribute text, updated bigint, created bigint);", emptyArray, (err) => {
								if(err) {
									fail(err);
								} else {
									done();
								}
							});
						} else {
							fail(err);
						}
					} else {
						loading = [];
						for(x=0; x<rows.length; x++) {
							// console.log("Read Class: ", rows[x]);
							rows[x] = new ClassManager(this, rows[x]);
							this.manager[rows[x].id] = rows[x];
							loading.push(rows[x].initialize());
						}
						Promise.all(loading)
						.then(() => {
							done();
						})
						.catch(fail);
					}
				});
			};
			
			this.connection.on("open", (err) => {
				if(err) {
					fail(err);
				} else {
					if(skip_load) {
						done();
					} else {
						loadFields();
					}
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
	 * @return {Promise}
	 */
	createField(specification) {
		if(this.field[specification.id]) {
			return this.updateField(specification.id, specification);
		}
		
		return new Promise((done, fail) => {
			var field = new RSField(specification),
				statement = mapping._toInsert("rsfield", fieldColumns, specification),
				write = {},
				x;
				
			for(x=0; x<fieldColumns.length; x++) {
				if(specification[fieldColumns[x]]) {
					write["$" + fieldColumns[x]] = specification[fieldColumns[x]];
				}
			}
			write.$id = specification.id;
			if(write.$inheritable) {
				write.$inheritable = JSON.stringify(write.$inheritable);
			}
			if(write.$inheritance) {
				write.$inheritance = JSON.stringify(write.$inheritance);
			}
			if(write.$attribute) {
				write.$attribute = JSON.stringify(write.$attribute);
			}
			if(write.$displayed_as) {
				write.$displayed_as = JSON.stringify(write.$displayed_as);
			}
			write.$created = Date.now();
			write.$updated = Date.now();
			
			console.log("Create Field statement: " + statement, write);
			this.connection
			.run(statement, write, (err) => {
				if(err) {
					fail(err);
				} else {
					this.field[specification.id] = field;
					done(field);
				}
			});
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
	 * @return {Promise}
	 */
	updateField(id, delta) {
		if(!this.field[id]) {
			delta.name = delta.name || id;
			delta.id = delta._newid || id;
			return this.createField(delta);
		}
		
		return new Promise((done, fail) => {
			var field = this.field[id],
				statement = "update rsfield set updated = $updated",
				write = {},
				keys,
				x;
				
			for(x=0; x<fieldColumns.length; x++) {
				if(delta[fieldColumns[x]]) {
					statement += ", " + fieldColumns[x] + " = $" + fieldColumns[x];
					write["$" + fieldColumns[x]] = delta[fieldColumns[x]];
				}
			}
			
			write.$id = id;
			if(delta._newid && (!this.usage[delta._newid] || this.usage[delta._newid].length === 0)) {
				console.log(" >> Renaming");
				if(this.field[delta._newid]) {
					throw new Error("Field ID " + delta._newid + " already exists");
				}
				statement += ", id = $_newid";
				write.$_newid = delta._newid;
			}
			
			statement += " where id = $id;";
			
			if(write.$inheritable) {
				write.$inheritable = JSON.stringify(write.$inheritable);
			}
			if(write.$inheritance) {
				write.$inheritance = JSON.stringify(write.$inheritance);
			}
			if(write.$attribute) {
				write.$attribute = JSON.stringify(write.$attribute);
			}
			if(write.$displayed_as) {
				write.$displayed_as = JSON.stringify(write.$displayed_as);
			}
			write.$updated = Date.now();
			
			console.log("Update Field statement: " + statement, write);
			this.connection
			.run(statement, write, (err) => {
				if(err) {
					console.log(err);
					fail(err);
				} else {
					field.updateSpecification(delta);
					/*
					for(x=0; x<fieldColumns.length; x++) {
						if(delta[fieldColumns[x]]) {
							field[fieldColumns[x]] = delta[fieldColumns[x]];
						}
					}
					field.updated = write.$updated;
					*/
					done(field);
				}
			});
		});
	};
   
   /**
	* 
	* @event updated
	* @param  {Object} updated Field data.
	*/

	/**
	 *
	 * @method getClassManager
	 * @param {String} name 
	 * @return {ClassManager}
	 */
	getClassManager(name) {
		return this.manager[name];
	}
	
	/**
	 *
	 * @method createClassManager
	 * @param {Object} specification 
	 * @param {String} specification.id 
	 * @param {String} [specification.name] 
	 * @param {String} [specification.description] 
	 * @param {Array} [specification.fields] 
	 * @return {Promise} 
	 */
	createClassManager(specification) {
		return new Promise((done, fail) => {
			if(this.manager[specification.id]) {
				console.log("Loading Class: ", specification);
				done(this.manager[specification.id]);
			} else {
				var manager = new ClassManager(this, specification),
					statement = mapping._toInsert("rsclass", classColumns, specification),
					write = {},
					x;
					
					
				console.log("Making Class: " + statement, specification);
				for(x=0; x<classColumns.length; x++) {
					if(specification[classColumns[x]]) {
						write["$" + classColumns[x]] = specification[classColumns[x]];
					}
				}
				if(specification.fields.indexOf("parent") === -1) {
					specification.fields.push("parent");
				}
				write.$fields = JSON.stringify(specification.fields);
				write.$id = specification.id;
				
				this.connection
				.run(statement, write, (err) => {
					if(err) {
						fail(err);
					} else {
						manager.initialize()
						.then(() => {
							this.manager[specification.id] = manager;
							done(manager);
						})
						.catch(fail);
					}
				});
			}
		});
	}
	
	/**
	 *
	 * @method deleteClassManager
	 * @param {String} id 
	 * @return {Promise}
	 */
	deleteClassManager(id) {
		return new Promise((done, fail) => {
			if(this.manager[id]) {
				// TODO: Delete Classification Manager
				 
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
	 * Mutates the passed array into the field objects with matching IDs.
	 * @method transcribeFields
	 * @param {Array | String} fields [description]
	 * @return {Array} The passed fields array after mutation.
	 */
	transcribeFields(fields) {
		for(var x=0; x<fields.length; x++) {
			fields[x] = this.field[fields[x]];
		}
		return fields;
	}

	/**
	 * Closes all associated ClassManagers and then itself, releasing the connection
	 * to the underlying database.
	 * @method close
	 * @return {Promise}
	 */
	close() {
		return new Promise((done, fail) => {
			var classes = Object.keys(this.manager),
				waiting = [],
				x;

			for(x=0; x<classes.length; x++) {
				waiting.push(this.manager[classes[x]].close());
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
 * @class ClassManager
 * @constructor
 * @param {RSDatabase} database
 * @param {Object} specification
 */
class ClassManager extends EventEmitter {
	constructor(database, specification) {
		super();
		var loading,
			x;
			
		if(!validClassIdentifier.test(specification.id)) {
			throw new Error("Invalid ID for Class");
		}
		
		/**
		 *
		 * @property id
		 * @type String
		 */
		this.id = specification.id;
		/**
		 *
		 * @property name
		 * @type String
		 */
		this.name = specification.name;
		/**
		 *
		 * @property description
		 * @type String
		 */
		this.description = specification.description;
		/**
		 *
		 * @property specification
		 * @type Object
		 */
		this.specification = specification;
		/**
		 *
		 * @property database
		 * @type RSDatabase
		 */
		this.database = database;
		/**
		 * The Constructor to use for creating objects of this class.
		 * @property construct
		 * @type Constructor
		 */
		this.construct = specification.construct || RSObject;
		/**
		 *
		 * @property statements
		 * @type Object
		 */
		this.statements = {};
		/**
		 * 
		 * @property objectIDs
		 * @type Array
		 */
		this.objectIDs = [];
		/**
		 *
		 * @property object
		 * @type Object
		 */
		this.object = {};
		/**
		 *
		 * @property Strings
		 * @type Object
		 */
		this.strings = {};
		/**
		 *
		 * @property defaultFieldValue
		 * @type Object
		 */
		this.defaultFieldValue = {};
		/**
		 *
		 * @property fields
		 * @type Array | RSField
		 */
		this.fields = [];
		/**
		 * Stores the IDs of fields that have inheritance properties.
		 * @property inheritableFields
		 * @type Array
		 */
		this.inheritableFields = [];
 		/**
 		 * Maps a field ID to the field value from the database for
 		 * usaged reference against properties like type or inheritance.
 		 * @property fieldUsed
 		 * @type Object
 		 */
 		this.fieldUsed = {};
 		/**
 		 * Cache mapping field IDs to their value for lookup.
 		 * @property fieldIDs
 		 * @type Array | String
 		 */
		this.fieldIDs = specification.fields || [];
		if(typeof(this.fieldIDs) === "string") {
			try {
				this.fieldIDs = JSON.parse(this.fieldIDs);
			} catch(error) {
				this.fieldIDs = this.fieldIDs.split(",");
			}
		}
		
		var reference = this;
		this.computeFieldProperties = function() {
			reference.inheritableFields.splice(0);
			var loading,
				x;
				
			for(x=0; x<reference.fieldIDs.length; x++) {
				loading = reference.database.field[reference.fieldIDs[x]];
				if(loading) {
					if(loading.inheritance) {
						reference.inheritableFields.push(loading.id);
					}
				} else {
					console.log("Unknown Field[" + this.fieldIDs[x] + "] in Class[" + this.id + "]");
				}
			}
		};
		
		for(x=0; x<this.fieldIDs.length; x++) {
			loading = this.database.field[this.fieldIDs[x]];
			if(loading) {
				this.fields.push(loading);
				this.fieldUsed[loading.id] = loading;
				loading.on("changed", this.computeFieldProperties);
			} else {
				console.log("Unknown Field[" + this.fieldIDs[x] + "] in Class[" + this.id + "]");
			}
		}
		
		/**
		 *
		 * @property attribute
		 * @type Object
		 */
		this.attribute = specification.attribute || {};
		if(typeof(this.attribute) === "string") {
			this.attribute = JSON.parse(this.attribute);
		}
		
		this.fieldIDs.sort(function(a, b) {
			if(reference.fieldUsed[a] && reference.fieldUsed[b]) {
				if(!reference.fieldUsed[a].ordering && reference.fieldUsed[b].ordering) {
					return 1;
				} else if(reference.fieldUsed[a].ordering && !reference.fieldUsed[b].ordering) {
					return -1;
				} else if(reference.fieldUsed[a].ordering < reference.fieldUsed[b].ordering) {
					return -1;
				} else if(reference.fieldUsed[a].ordering > reference.fieldUsed[b].ordering) {
					return 1;
				}
			}
			
			if(a < b) {
				return -1;
			} else if(a > b) {
				return 1;
			} else {
				return 0;
			}
		});
		database.manager[this.id] = this;
		this.computeFieldProperties();
	}

	/**
	 *
	 * @method initialize
	 * @return {Promise}
	 */
	initialize() {
		// console.trace("Class Initialization: " + this.id);
		return new Promise((done, fail) => {
			this.database.connection.all("select id from " + this.id + ";", emptyArray, (err, rows) => {
				if(err) {
					if(err.message && err.message.indexOf("no such table") !== -1) {
						this.database.connection
						.run("create table " + this.id + " (id text NOT NULL PRIMARY KEY" + mapping._toCommand(this.fields) + ", _parent text, _grid text, _x integer, _y integer, updated bigint, created bigint);", emptyArray, (err) => {
							if(err) {
								fail(err);
							} else {
								done(this);
								/*
								var statement = mapping._toInsert("rsclass", classColumns, this.specification),
									write = mapping._toObject(this.specification, true);
								write.$id = this.id;
								this.database.connection.run(statement, write, (err) => {
									if(err) {
										fail(err);
									} else {
										done(this);
									}
								});
								*/
							}
						});
					} else {
						fail(err);
					}
				} else {
					for(var x=0; x<rows.length; x++) {
						this.object[rows[x].id] = false;
						this.objectIDs.push(rows[x].id);
					}
					done(this);
				}
			});
		});
	}

	/**
	 * 
	 * @method setAttributes
	 * @param {Object} attributes Mapping keys to new attribute values.
	 * 		Null values are kept as null after the update. Undefined is
	 * 		not updated.
	 * @param {Function} callback(err)
	 * @return {Object} Class attributes
	 */
	setAttributes(attributes, callback) {
		var values = {};
		Object.assign(this.attribute, attributes);
		values.$attribute = JSON.stringify(this.attribute);
		values.$id = this.id;

		this.database.connection.run("update rsclass set attribute = $attribute where id = $id;", values, (err, rows) => {
			callback(err);
		});

		return this.attribute;
	}

	/**
	 *
	 * @method isField
	 * @param {String | RSField} field To check if present
	 * @return {Boolean} True if the field is part of this Classification.
	 */
	isField(field) {
		return !!this.fieldUsed[field.id || field];
	}

	/**
	 *
	 * @method addField
	 * @param {String} field ID to add to this ClassManager. This field ID must
	 * 		be defined or the operation will fail.
	 * @return {Promise}
	 */
	addField(id) {
		var field = this.database.field[id];
		
		return new Promise((done, fail) => {
			if(!field) {
				var details = {};
				details.database = this.database.specification.name || this.database.specification.id || this.database.specification.file || "appdb";
				details.operation = "add";
				details.field = id;
				details.database_fields = Object.keys(this.database.field);
				fail(new Anomaly("type:field:add", "Undefined field for database", 50, details, null, this));
			} else if(this.fieldUsed[field.id]) {
				done();
			} else {
				var params,
					type;
					
				type = mapping[field.type];
				if(type) {
					type = type.type || field.type;
				} else {
					type = field.type;
				}
				
				this.database.connection
				.run("alter table " + this.id + " add " + field.id + " " + type + ";", emptyArray, (err) => {
					if(err) {
						fail(err);
					} else {
						this.fieldIDs.push(field.id);
						params = {};
						params.$id = this.id;
						params.$fields = JSON.stringify(this.fieldIDs);
						this.database.connection
						.run("update rsclass set fields = $fields where id = $id;", params, (err) => {
							if(err) {
								this.fieldIDs.purge(field.id);
								fail(err);
							} else {
								this.fieldUsed[field.id] = field;
								this.fields.push(field);
								field.on("changed", this.computeFieldProperties);
								this.computeFieldProperties();
								done(field);
							}
						});
					}
				});
			}
		});
	}

	/**
	 *
	 * @method removeField
	 * @param {String} field ID to remove from this ClassManager. This field ID must
	 * 		be defined or the operation will fail.
	 * @return {Promise}
	 */
	removeField(id) {
		var field = this.database.field[id],
			params = {},
			details;
		
		return new Promise((done, fail) => {
			if(!field) {
				details = {};
				details.database = this.database.specification.name || this.database.specification.id || this.database.specification.file || "appdb";
				details.operation = "remove";
				details.field = id;
				fail(new Anomaly("class:field:remove", "Undefined field for database", 50, details, null, this));
			} else if(this.fieldUsed[id]) {
				// SQLLite Alter Table does NOT SUPPORT remove column
				this.fieldIDs.purge(field.id);
				params = {};
				params.$id = this.id;
				params.$fields = JSON.stringify(this.fieldIDs);
				this.database.connection
				.run("update rsclass set fields = $fields where id = $id;", emptyArray, (err) => {
					if(err) {
						this.fieldIDs.push(field.id);
						fail(err);
					} else {
						delete(this.fieldUsed[field.id]);
						this.fieldIDs.purge(field);
						field.off("changed", this.computeFieldProperties);
						this.computeFieldProperties();
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
	 * @method create
	 * @param {Universe} universe
	 * @param {Object} details
	 * @param {Function} callback
	 */
	create(universe, details, callback) {
		try {
			var object = this.database.constructor[this.id] || RSObject;
			if(object) {
				this.writeObjectData(details, (err) => {
					if(err) {
						console.log("Data Write Failed[" + this.id + "]: " + details.id);
						callback(err, null);
					} else {
						console.log("Data Written[" + this.id + "]: " + details.id);
						object = new object(universe, this, details);
						object.created = details.created;
						object.updated = details.updated;
						this.object[object.id] = object;
						this.objectIDs.push(object.id);
						callback(null, object);
					}
				});
			} else {
				callback(new Error("Failed to locate constructor for Class " + this.id));
			}
		} catch(constructionException) {
			callback(constructionException);
		}
	}

	/**
	 * 
	 * @param {RSObject} object 
	 * @param {Function} callback 
	 */
	delete(object, callback) {
		if(!object || !object.id) {
			throw new Error("Unable to delete an object with no ID: " + JSON.stringify(object));
		}

		if(this.object[object.id]) {
			if(object._universe) {
				this.unload(object._universe, object.id);
			}
			this.database.connection.run("delete from " + this.id + " where id = $id;", {"$id":object.id}, (err) => {
				if(err) {
					callback(err);
				} else {
					delete this.object[object.id];
					this.emit("deleted", object.id);
					callback();
				}
			});
		} else {
			callback();			
		}
	}
	
	/**
	 * 
	 * @method load
	 * @param {Universe} universe 
	 * @param {Object | String} details 
	 * @return {Promise} 
	 */
	load(universe, details) {
		// console.log("Load: ", details);
		return new Promise((done, fail) => {
			if(typeof(details) === "string") {
				if(this.object[details] === false) {
					this.retrieveObjectData(details, (err, data) => {
						if(err) {
							fail(err);
						} else {
							var Construct = this.database.constructor[this.id] || RSObject;
							this.object[details.id] = new Construct(universe, this, data);
							done(this.object[details.id]);
						}
					});
				} else if(this.object[details]) {
					done(this.object[details]);
				} else {
					fail(new Error("Unknown object id (" + details + ") for this class (" + this.id + ")"));
				}
			} else {
				if(this.object[details.id] === false) {
					var Construct = this.database.constructor[this.id] || RSObject;
					this.object[details.id] = new Construct(universe, this, details);
					done(this.object[details.id]);
				} else if(this.object[details.id]) {
					done(this.object[details.id]);
				} else {
					fail(new Error("Unknown object id (" + details.id + ") for this class (" + this.id + ")"));
				}
			}
		});
	}
	
	/**
	 * 
	 * @method unload
	 * @param {Universe} universe [description]
	 * @param {String} id       [description]
	 */
	unload(universe, id) {
		this.object[id] = false;
		universe.emit("send", {
			"type": "unload",
			"classification": this.id,
			"id": id
		});
	}
	
	/**
	 * Get all objects with the noted grid value.
	 * @method loadGrid
	 * @param {Universe} universe [description]
	 * @param {String} [grid]     [description]
	 * @return {Promise}
	 */
	loadGrid(universe, grid) {
		return new Promise((done, fail) => {
			this.retrieveAllData(grid, (err, data) => {
				if(err) {
					fail(err);
				} else if(!data) {
					done();
				} else {
					var loading = [],
						x;
					for(x=0; x<data.length; x++) {
						loading.push(this.load(universe, data[x]));
					}
					
					Promise.all(loading)
					.then(done)
					.catch(fail);
				}
			});
		});
	}
	
	
	unloadGrid(universe, grid) {
		
	}
	

	/**
	 *
	 * @method writeObjectData
	 * @param {Object} object Delta to write. This specifies the new field values
	 * 		for the object that matches the incoming `object.id`. If none is defined,
	 * 		then a new object is inserted.
	 * @param  {Function} callback(err,data) [description]
	 */
	writeObjectData(object, callback) {
		if(!object || !object.id) {
			callback(new Error("Unable to write object with no ID: " + JSON.stringify(object)));
		} else {
			var fields = Object.keys(object),
				sid = fields.join(),
				statement,
				write,
				x;

			if(this.object[object.id] || this.object[object.id] === false) {
				// console.log("update");
				// update
				// TODO: Verify fields are valid for this Classification during write
				write = mapping._toObject(this.fields, object, false);
				if(this.statements[sid]) {
					statement = this.statements[sid];
				} else {
					statement = "update " + this.id + " set updated = $updated";
					for(x=0; x<this.fieldIDs.length; x++) {
						if(object[this.fieldIDs[x]] !== undefined) {
							statement += ", " + this.fieldIDs[x] + " = $" + this.fieldIDs[x];
						}
					}
					this.statements[sid] = statement += " where id = $id;";
				}
				object.updated = write.$updated;
			} else {
				// insert
				write = mapping._toObject(this.fields, object, true);
				this.object[object.id] = {};
				statement = mapping._toInsert(this.id, this.fields, object);
				// console.log("insert: " + statement, write);
				object.updated = write.$updated;
				object.created = write.$created;
			}

			this.database.connection.run(statement, write, callback);
		}
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
			this.database.connection.all("select * from " + this.id + " where id = $id;", params, (err, rows) => {
				if(err) {
					callback(err);
				} else if(rows && rows.length) {
					callback(undefined, rows?this._transcribeObject(rows[0]):null);
				} else {
					callback(null, null);
				}
			});
		} else {
			callback(null, this.object[id]);
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
		if(this.object[id]) {
			callback(this.object[id]);
		} else {
			
		}
	}

	/**
	 *
	 * @method setClassDefaults
	 * @param {Object} defaults Maps field ID to the value to use as a default. Accepts
	 * 		fields that are not defined to this Class but objects should not set those.
	 */
	setClassDefaults(defaults) {
		this.defaultFieldValues = defaults;
	}

	/**
	 *
	 * @method setClassDefault
	 * @param {String} field
	 * @param {Number | String | Boolean | Object | Array} value To set for the default.
	 * 		If `null` is passed, then the mapping is deleted instead.
	 */
	setClassDefault(field, value) {
		if(value === null) {
			delete(this.defaultFieldValues[field]);
		} else {
			this.defaultFieldValues[field] = value;
		}
	}

	/**
	 *
	 * @method deleteObject
	 * @deprecated See `delete`
	 * @param {String | Object} object The object to delete with the ID or the ID
	 * 		of the object to delete.
	 * @param {Function} callback
	 */
	deleteObject(object, callback) {
		var id;
		if(!object || !(id = object.id || object)) {
			throw new Error("Unable to delete an object with no ID: " + JSON.stringify(object));
		}

		if(this.object[id]) {
			this.unload(object._universe, id);
			this.database.connection.run("delete from " + this.id + " where id = $id;", {"$id":id}, (err) => {
				if(err) {
					callback(err);
				} else {
					delete this.object[id];
					this.emit("deleted", id);
					callback();
				}
			});
		} else {
			callback();			
		}
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

		this.database.connection.all("select * from " + this.id + " where _grid is null or _grid = $grid;", grid, (err, rows) => {
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
				callback(null, null);
			}
		});
	}

	/**
	 * Follows the mapping[field.type] for the mapping.[type].read function
	 * @method _transcribeObject
	 * @param {Object} object [description]
	 * @return {Object}
	 */
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

	/**
	 * Follows the mapping[field.type] for the mapping.[type].read function
	 * @method _translateObject
	 * @param {Object} object [description]
	 * @return {Object}
	 */
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
	
	/**
	 * 
	 * @method toJSON
	 * @return {Object}
	 */
	toJSON() {
		var json = {};
		json.id = this.id;
		json.name = this.name;
		json.description = this.description;
		json.fields = this.fieldIDs;
		json.attribute = this.attribute;
		return json;
	}
};
