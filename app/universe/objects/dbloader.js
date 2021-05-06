/**
 * 
 * @class DBLoader
 * @constructor
 */
module.exports = {};

/**
 * Fields to ensure exist on any initialized database.
 * @property fields
 * @type {Array}
 * @private
 */
var fields = [];
fields.push({
	"id": "name",
	"name": "Name",
	"description": "The display name for the object.",
	"type": "string",
	"attribute": {
		"obscures": ["name_hidden", "name_generic"]
	}
});
fields.push({
	"id": "disabled",
	"name": "disabled",
	"description": "When true, the object should be considered removed.",
	"type": "boolean",
	"attribute": {}
});
fields.push({
	"id": "username",
	"name": "Username",
	"description": "Name used to log into the system.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "password",
	"name": "Password",
	"description": "The resulting hash of a password for identification purposes.",
	"type": "string",
	"attribute": {
		"encrypted": true
	}
});
fields.push({
	"id": "description",
	"name": "Description",
	"description": "The description of the object.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "email",
	"name": "E-mail",
	"description": "E-mail address at which to reach the owner of the object.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "authenticators",
	"name": "Authenticators",
	"description": "Maps the ID of an authentication process to ID of the user through that system to enable a user to sign in through multiple systems.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "last",
	"name": "Last",
	"description": "Timestamp of the last known activity for this object.",
	"type": "integer",
	"attribute": {}
});

/**
 * Classes to ensure exist
 * @property classes
 * @type {Array}
 * @private
 */
var classes = [];
classes.push({
	"id": "player",
	"name": "Player",
	"description": "Player information for connecting to the universe",
	"fields": ["name", "disabled", "username", "password", "email", "description", "authenticators", "last"]
});

/**
 * Objects to ensure exist
 * @property objects
 * @type {Array}
 */
var objects = [];
objects.push({
	"id": "player:master",
	"name": "Master",
	"username": "master",
	"description": "Default master account for building up the Universe",
	"last": 0
});

/**
 * Initialize the database if needed with base data:
 * + Fields
 *     + Name (String)
 *     + Username (String)
 *     + Password (String)
 *     + Description (String)
 *     + Email (String)
 *     + Authenticators (Object)
 *     + Connections (Integer)
 *     + Disconnects (Integer)
 *     + Last (Integer)
 * + Classes
 *     + Player
 * + Data
 *     + Initial Master Player
 * 
 * @method initialize
 * @static
 * @param {RSDatabase} database 
 * @return {Promise} 
 */
module.exports.initialize = function(universe, database) {
	return new Promise(function(done, fail) {
		var promised,
			build,
			x;
			
		build = function(field) {
			return new Promise(function(done, fail) {
				if(database.field[field.id]) {
					done();
				} else {
					database.createField(field)
					.then(done)
					.catch(fail);
				}
			});
		};
		
		promised = [];
		for(x=0; x<fields.length; x++) {
			promised.push(build(fields[x]));
		}
		
		Promise.all(promised)
		.then(function() {
			build = function(manager) {
				return new Promise(function(done, fail) {
					if(database.manager[manager.id]) {
						done();
					} else {
						database.createClassManager(manager)
						.then(done)
						.catch(fail);
					}
				});
			};
			
			promised = [];
			for(x=0; x<classes.length; x++) {
				promised.push(build(classes[x]));
			}
		
			return Promise.all(promised);
		})
		.then(function() {
			// Load Base Data
			build = function(manager) {
				return new Promise(function(done, fail) {
					manager = database.manager[manager.id];
					manager.loadGrid(universe, null)
					.then(done)
					.catch(fail);
				});
			};
			
			promised = [];
			for(x=0; x<classes.length; x++) {
				promised.push(build(classes[x]));
			}
		
			return Promise.all(promised);
		})
		.then(function() {
			// Guarentee Base Data
			build = function(object) {
				return new Promise(function(done, fail) {
					var manager = database.manager[universe.getClassFromID(object.id)];
					if(manager.object[object.id]) {
						done();
					} else {
						manager.load(universe, object, function(err, obj) {
							if(err) {
								fail(err);
							} else {
								manager.initialize()
								.then(() => {
									done(obj);
								}).catch(fail);
							}
						});
					}
				});
			};
			
			for(x=0; x<classes.length; x++) {
				promised.push(build(objects[x]));
			}
			
			Promise.all(promised)
			.then(done)
			.catch(fail);
		})
		.catch(fail);
	});
};
