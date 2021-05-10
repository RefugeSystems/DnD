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
fields.push({
	"id": "player",
	"name": "Player",
	"description": "Reference to a Player object.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "code",
	"name": "Code",
	"description": "A code used for matching. Mostly session usage.",
	"type": "string",
	"attribute": {}
});
fields.push({
	"id": "authenticator",
	"name": "Authenticator",
	"description": "Refers to the authentication process used to establish this object.",
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
	"id": "incidents",
	"name": "Incidents",
	"description": "IDs of the Incidents to which this object is associated",
	"type": "array",
	"attribute": {}
});
fields.push({
	"id": "gender",
	"name": "Gender",
	"description": "The gender of this object",
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
	"fields": ["name", "disabled", "username", "password", "email", "description", "authenticators", "last"]
});
classes.push({
	"id": "session",
	"name": "Session",
	"description": "Tracks a Player connection session",
	"fields": ["player", "disabled", "code", "authenticator", "last", "expiry"]
});
/*
classes.push({
	"id": "setting",
	"name": "Setting",
	"description": "Value for the universe",
	"fields": ["name", "value"]
});
classes.push({
	"id": "incident",
	"name": "Incident",
	"description": "For an event in the universe, such as a Long Rest or Battle",
	"fields": ["name", "description", "time", "associated"]
});
classes.push({
	"id": "meeting",
	"name": "meeting",
	"description": "xxxx",
	"fields": ["name", "description", "time", "date", "entities"]
});
classes.push({
	"id": "dataset",
	"name": "dataset",
	"description": "xxxx",
	"fields": ["name", "description", "disabled", "value"]
});
classes.push({
	"id": "image",
	"name": "image",
	"description": "xxxx",
	"fields": ["name", "description", "disabled", "data", "url"]
});
classes.push({
	"id": "playlist",
	"name": "Playlist",
	"description": "Collection of ",
	"fields": ["name", "description", "disabled", "streamurls"]
});
classes.push({
	"id": "audio",
	"name": "Audio",
	"description": "An audio clip that can be played either locally, on a client device, or streamed to a sound system. Different circumstances require different fields. Sonos streaming requires a URL. Client play requires data.",
	"fields": ["name", "description", "disabled", "url", "data", "attribute"]
});
classes.push({
	"id": "profile",
	"name": "Profile",
	"description": "Describes a user's set of settings",
	"fields": ["name", "description", "user", "attribute"]
});
classes.push({
	"id": "dashboard",
	"name": "Dashboard",
	"description": "Describes the layout of widgets on a Dashboard",
	"fields": ["name", "description", "user", "attribute", "widgets"]
});
classes.push({
	"id": "widget",
	"name": "Widget",
	"description": "Describes a widget available in the UI. The attributes specify available values for configuration and offer a string on field usage or an array of options.",
	"fields": ["name", "description", "disabled", "attribute"]
});
classes.push({
	"id": "slot",
	"name": "Slot",
	"description": "An entry where an item can be placed in association with another object.",
	"fields": ["name", "description", "types"]
});
classes.push({
	"id": "entity",
	"name": "Entity",
	"description": "A manipulatable entry in the Universe.",
	"fields": ["name", "description", "slots"]
});
classes.push({
	"id": "ability",
	"name": "ability",
	"description": "xxxx",
	"fields": ["name", "description"]
});
classes.push({
	"id": "skill",
	"name": "skill",
	"description": "xxxx",
	"fields": ["name", "description"]
});
classes.push({
	"id": "archetype",
	"name": "archetype",
	"description": "xxxx",
	"fields": ["name", "description"]
});
classes.push({
	"id": "action",
	"name": "action",
	"description": "xxxx",
	"fields": ["name", "description"]
});
classes.push({
	"id": "effect",
	"name": "effect",
	"description": "xxxx",
	"fields": ["name", "description"]
});
classes.push({
	"id": "race",
	"name": "Race",
	"description": "xxxx",
	"fields": ["name", "description"]
});
classes.push({
	"id": "conditional",
	"name": "Conditional",
	"description": "Specifies values to add, subtract, or set based on the described condition being met.",
	"fields": ["name", "description", "disabled", "condition", "ifop", "add", "set", "sub"]
});
classes.push({
	"id": "type",
	"name": "Type",
	"description": "Indicates the type of object here-in for game purposes. Such as 'weapon' or 'ranged' and are for use incombination in determing or displaying properties for the object.",
	"fields": ["name", "description", "disabled"]
});
classes.push({
	"id": "journal",
	"name": "Journal",
	"description": "xxxx",
	"fields": ["name", "description", "disabled", "attribute"]
});
classes.push({
	"id": "page",
	"name": "Page",
	"description": "A page in any set of journals. This is to allow replication of information across multiple journals and facilitate sharing with other players without duplication.",
	"fields": ["name", "description", "disabled", "journals", "versioning", "value", "time", "date"]
});
classes.push({
	"id": "item",
	"name": "Item",
	"description": "An item used by entities",
	"fields": ["name", "description", "icon", "cost", "types", "needs", "damage", "dmgtype", "range", "durability", "size", "weight", "encumberance", "proiciency", "stat", "ranged", "thrown", "consume", "consume_hint", "consume_icon", "dc", "user", "attunes", "attuned", "attuned_locked", "charges", "recharges", "enchantments", "conditionals"]
});
classes.push({
	"id": "knowledge",
	"name": "Knowledge",
	"description": "Knowledge held by an entity in the universe.",
	"fields": ["name", "description", "icon", "category", "state", "screen", "associated", "included", "effects"]
});
classes.push({
	"id": "quest",
	"name": "Quest",
	"description": "Specific entry for objectives.",
	"fields": ["name", "description", "locations", "items", "conditionals", ]
});
classes.push({
	"id": "minigame",
	"name": "Minigame",
	"description": "Describes the state of a mini-game",
	"fields": ["name", "description", "game", "attribute", "time", "date", "last", "expiry", "conditionals"]
});
classes.push({
	"id": "location",
	"name": "Location",
	"description": "xxxx",
	"fields": ["name", "description"]
});
*/


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
