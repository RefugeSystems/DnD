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
	"name": "Disabled",
	"description": "When true, the object should be considered removed.",
	"type": "boolean",
	"attribute": {}
});
fields.push({
	"id": "restricted",
	"name": "Restricted",
	"description": "When set, the object's listed properties require knowledge with the 'reveals' property and the corrsponding object as a subject.",
	"type": "array",
	"attribute": {}
});
fields.push({
	"id": "condition",
	"name": "Condition",
	"description": "Used by Conditional objects to determine the condition on which to apply.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "ifop",
	"name": "If Operation",
	"description": "Used by Conditional objects to determine the how to use the values of the 'condition' object for comparisons.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "adds",
	"name": "Adds",
	"description": "Used by Conditional objects to determine the values to add when aplied.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "subs",
	"name": "Subs",
	"description": "Used by Conditional objects to determine the values to sub when aplied.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "sets",
	"name": "Sets",
	"description": "Used by Conditional objects to determine the values to set when aplied.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "hidden",
	"name": "Hidden",
	"description": "Lists properties to keep hidden.",
	"type": "array",
	"attribute": {}
});
fields.push({
	"id": "reveals",
	"name": "Reveals",
	"description": "Used in combination with objects that have subjects to indicate what they reveal about those subjects.",
	"type": "array",
	"attribute": {}
});
fields.push({
	"id": "gm",
	"name": "Game Master",
	"description": "Flags objects as game masters. Primarily for use on Player objects.",
	"type": "boolean",
	"attribute": {}
});
fields.push({
	"id": "subjects",
	"name": "Subjects",
	"description": "Used in combination with objects that have subjects to indicate what they reveal about those subjects.",
	"type": "array",
	
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
		"server_only": true,
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
	"id": "expires_to",
	"name": "Expires To",
	"description": "Indicates the new parent for this object once expired.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "expires_from",
	"name": "Expires From",
	"description": "Indicates that object values should be pulled to this object on expiration, this value identifying the object to use. If a template is specified, values are generated and pushed into this object.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "template",
	"name": "Template",
	"description": "When set, this object is considered a template and can create children as described in the template object to set values of generated children.",
	"type": "object",
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
	"id": "json",
	"name": "JSON",
	"description": "Used for storing raw JSON data. Generally for historical use.",
	"type": "string",
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
	"id": "auth_token",
	"name": "Authorization Tokens",
	"description": "Maps authorization tokens to expiration times. This is more to reserve the data than store.",
	"type": "object",
	"attribute": {
		"server_only": true
	}
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
fields.push({
	"id": "owners",
	"name": "Owners",
	"description": "Lists the players that own and operate the object.",
	"type": "array",
	"attribute": {}
});
fields.push({
	"id": "dead",
	"name": "Dead",
	"description": "Flags that the object is considered deceased.",
	"type": "boolean",
	"attribute": {}
});
fields.push({
	"id": "acquired",
	"name": "Acquired",
	"description": "Maps an ID to the gametime at which it was acquired by the object.",
	"type": "object",
	"attribute": {}
});
fields.push({
	"id": "icon",
	"name": "Icon",
	"description": "CSS class to display as short hand for this object.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "gm_note",
	"name": "Game Master Note",
	"description": "For game masters to save notes about this object and is meant to be trimmed before being sent to players.",
	"type": "string",
	"attribute": {
		"master_only": true
	}
});
fields.push({
	"id": "sessions",
	"name": "Sessions",
	"description": "List of sessions for a player.",
	"type": "array",
	"attribute": {
		"server_only": true
	}
});
fields.push({
	"id": "object",
	"name": "Object ID",
	"description": "Used to track that an object is directly related to another object.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "data",
	"name": "Data",
	"description": "Used for large data storage (Such as images). Typically Base64 encoded.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "connections",
	"name": "Connections",
	"description": "Number of active connections.",
	"type": "integer",
	"attribute": {
		"default": 0
	}
});
fields.push({
	"id": "x",
	"name": "X Position",
	"description": "X location of the object.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "y",
	"name": "Y Position",
	"description": "Y location of the object.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "location",
	"name": "Location",
	"description": "Lists the players that own and operate the object.",
	"type": "string",
	"inheritance": {
		
	},
	"inheritable": [
		"location"
	],
	"attribute": {}
});
fields.push({
	"id": "conditionals",
	"name": "Conditionals",
	"description": "Lists of conditionals that may be applied to this object.",
	"type": "array",
	"attribute": {}
});
fields.push({
	"id": "ordering",
	"name": "Order",
	"description": "The order in which this field displays or computes when applicable.",
	"type": "integer",
	"attribute": {}
});
fields.push({
	"id": "entrance",
	"name": "Entrance",
	"description": "Indicates the location to which this location links instead of itself. This is used for things like multiple cave entrances into one cave.",
	"type": "string",
	"inheritance": {
		
	},
	"inheritable": [
		"location"
	],
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
	"fields": ["name", "disabled", "username", "password", "email", "description", "gm", "auth_token", "last", "connections", "attribute"]
});
classes.push({
	"id": "session",
	"name": "Session",
	"description": "Tracks a Player connection session",
	"fields": ["player", "username", "disabled", "last", "expiry"]
});
classes.push({
	"id": "location",
	"name": "Locations",
	"description": "Active entity in the game that takes actions",
	"fields": ["name", "icon", "description", "disabled", "hidden", "location", "x", "y", "entrance", "gm_note", "attribute"]
});
classes.push({
	"id": "setting",
	"name": "Setting",
	"description": "Universe values",
	"fields": ["name", "disabled", "description", "value", "gm_note"]
});
classes.push({
	"id": "conditional",
	"name": "Conditional",
	"description": "Represents a conditional addition to the object's properties.",
	"fields": ["condition", "ifop", "adds", "subs", "sets"]
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
	if(configuration.universe.recovery_mode) {
		return new Promise(function(done) {
			// Skip DB Loading
			done();
		});
	}
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
