/**
 * Player creating a new character.
 * 
 * Note that additionally specified keys are ignored. The private keys array can be updated
 * to allow additional keys. Remember to update documentation after changes to the keys
 * array.
 * @event player:create:character
 * @for Universe
 * @param {Object} event With data from the system
 * @param {String} event.type The event name being fired, should match this event's name
 * @param {Integer} event.received Timestamp of when the server received the event
 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
 * @param {RSObject} event.player That triggered the event
 * @param {Object} event.message The payload from the UI
 * @param {Object} event.message.type Original event type indicated by the UI; Should be "error:report"
 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
 * @param {Object} event.message.data Typical location of data from the UI
 * @param {String} event.message.data.name Simple name
 * @param {String} event.message.data.notes In markdown text
 * @param {String} event.message.data.description In markdown text
 * @param {String} event.message.data.icon CSS Classing, not typically specified here, possibly slated for inheritance from race
 * @param {String} event.message.data.gender Simply naming the gender; "Male", "Female", "Non-Binary", "Agender"
 * @param {String} event.message.data.race ID
 * @param {String} event.message.data.alignment ID
 * @param {Object} event.message.data.skill_proficiency Mapping IDs to 0 or 1
 * @param {Array} event.message.data.proficiencies IDs
 * @param {Array} event.message.data.knowledges IDs
 * @param {Array} event.message.data.archetypes IDs
 * @param {Array} event.message.data.feats IDs
 * @param {Integer} event.message.data.stat_strength Stat score
 * @param {Integer} event.message.data.stat_dexterity Stat score
 * @param {Integer} event.message.data.stat_constitution Stat score
 * @param {Integer} event.message.data.stat_intelligence Stat score
 * @param {Integer} event.message.data.stat_wisdom Stat score
 * @param {Integer} event.message.data.stat_charisma Stat score
 */

var Random = require("rs-random");
/**
 * Used to determine the keys to copy from the source data to restrict this character creation from being abused.
 * @property keys
 * @type Array
 * @private
 * @static
 */
var keys = [
	"name",
	"notes",
	"description",
	"icon",
	"gender",
	"race",
	"alignment",
	"archetypes",
	"feats",
	"skill_proficiency",
	"proficiencies",
	"knowledges",
	"stat_strength",
	"stat_dexterity",
	"stat_constitution",
	"stat_intelligence",
	"stat_wisdom",
	"stat_charisma"
];
// If changed, update docs

module.exports.initialize = function(universe) {
	universe.on("player:create:character", function(event) {
		universe.emit("info", new universe.Anomaly("player:create:character", "Player character creation requested", 30, event.message, null, "event:" + event.type));
		universe.emit("send", {
			"type": "notice",
			"mid": "create:character",
			"recipient": event.player.id,
			"message": "Creating Character",
			"icon": "fas fa-sync fa-spin",
			"anchored": true
		});

		var source = event.message.data,
			details = {},
			x;

		for(x = 0; x < keys.length; x++) {
			details[keys[x]] = source[keys[x]];
		}
		details.id = Random.identifier("entity", 10, 32).toLowerCase();
		details.owned = {};
		details.owned[event.player.id] = Date.now();
		details.hp = 6;
		details.gold = 0;

		universe.createObject(details, function(err, character) {
			if(err) {
				universe.emit("send", {
					"type": "notice",
					"mid": "create:character",
					"recipient": event.player.id,
					"message": "Character Creation Failed: " + err.message,
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"error": err,
					"anchored": true
				});
			} else {
				character.setValues({"hp": character.hp_max}, function(err) {
					universe.chronicle.addOccurrence("character:created", event.message.data, Date.now(), null, event.player?event.player.id:null);
					var attribute = Object.assign({}, event.player.attribute);
					attribute.playing_as = character.id;
					event.player.setValues({
						"attribute": attribute
					});
					universe.emit("send", {
						"type": "notice",
						"mid": "create:character",
						"recipient": event.player.id,
						"message": "Character Created",
						"icon": err?"fas fa-check rs-lightyellow":"fas fa-check rs-lightgreen",
						"errors": err,
						"timeout": 10000
					});
				});
			}
		});
	});
};
