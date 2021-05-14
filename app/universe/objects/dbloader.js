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
	"id": "game_master",
	"name": "Game Master",
	"description": "Indicates that a player is a game master.",
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
	"id": "last",
	"name": "Last",
	"description": "Timestamp of the last known activity for this object.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "expiry",
	"name": "Expiry",
	"description": "Time over which the object is valid.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "player",
	"name": "Player",
	"description": "Reference to a Player object.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "expiry",
	"name": "Expiry",
	"description": "The duration of time for which this object is valid. Usually used in combination with `last`.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "value",
	"name": "Value",
	"description": "Used for simple value representation.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "time",
	"name": "time",
	"description": "Tracks game time offset.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "attribute",
	"name": "Attributes",
	"description": "Dynamic attributes for the object.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "permission",
	"name": "Permissions",
	"description": "Maps a concept to an access level for more complex permission controls.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "auth_token_use",
	"name": "Authorization Token in Use",
	"description": "Maps authorization tokens to expiration times. This is more to reserve the data than store.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "auth_token",
	"name": "Authorization Tokens",
	"description": "Maps authorization tokens to expiration times. This is more to reserve the data than store.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "auth_identity",
	"name": "Authorization Identities",
	"description": "Maps authorization Identity modules to usernames that correspond to a player. This is to allow user's to have multiple identities (ie. Multiple Google Accounts) map to the same user.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "date",
	"name": "date",
	"description": "Tracks the real time offset.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "meeting",
	"name": "Meeting",
	"description": "The meeting at which this object is tied.",
	"type": "string",
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
	"fields": ["name", "disabled", "username", "password", "email", "description", "auth_token", "auth_identity", "last"]
});
classes.push({
	"id": "session",
	"name": "Session",
	"description": "Tracks a Player connection session",
	"fields": ["player", "disabled", "auth_token_use", "last", "expiry"]
});


/**
 * Objects to ensure exist
 * @property objects
 * @type {Array}
 */
var objects = [];

/**
 * Initialize the database if needed with base data:
 * + Fields
 *     + Name (String)
 *     + Username (String)
 *     + Password (String)
 *     + Description (String)
 *     + Email (String)
 *     + Authorization Tokens (Object)
 *     + Authorization Identities (Object)
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
module.exports.initialize = function(universe, database, configuration) {
	return new Promise(function(done, fail) {
		var promised,
			build,
			x;
			
		if(configuration.classes) {
			classes = classes.concat(configuration.classes);
		}
		if(configuration.fields) {
			fields = fields.concat(configuration.fields);
		}
		if(configuration.objects) {
			objects = objects.concat(configuration.objects);
		}
		
		// Build Fields
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
			// Build Classes
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
			// Load Class Data
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
						manager.load(universe, object)
						.then(function(obj) {
							done(obj);
						})
						.catch(fail);
					} else {
						manager.create(universe, object, function(err, obj) {
							if(err) {
								fail(err);
							} else {
								done(obj);
							}
						});
					}
				});
			};
			
			for(x=0; x<objects.length; x++) {
				promised.push(build(objects[x]));
			}
			
			if(promised.length) {
				Promise.all(promised)
				.then(function(objects) {
					promised = [];
					var x, y;
					for(x=0; x<objects.length; x++) {
						for(y=0; objects[x] && y<objects[x].length; y++) {
							if(objects[x][y]) {
								// console.log("--Object: ", objects[x][y]);
								promised.push(objects[x][y].linkFieldValues());
							}
						}
					}
					return Promise.all(promised);
				})
				.then(function(objects) {
					var x, y;
					for(x=0; x<objects.length; x++) {
						for(y=0; objects[x] && y<objects[x].length; y++) {
							if(objects[x][y]) {
								objects[x][y].updateFieldValues();
							}
						}
					}
					done();
				})
				.catch(fail);
			} else {
				done();
			}
		})
		.catch(fail);
	});
};
