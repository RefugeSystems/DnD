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
 * @param {String} event.message.data.nickname
 * @param {String} event.message.data.notes In markdown text
 * @param {String} event.message.data.description In markdown text
 * @param {String} event.message.data.icon CSS Classing, not typically specified here, possibly slated for inheritance from race
 * @param {String} event.message.data.gender Simply naming the gender; "Male", "Female", "Non-Binary", "Agender"
 * @param {Number} event.message.data.age This is used to calculate the birthday
 * @param {Number} event.message.data.height 
 * @param {Number} event.message.data.weight 
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

var parseDataUrl = require("parse-data-url"),
	Random = require("rs-random");
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
	"height",
	"weight",
	"nickname",
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

var typeShort = {};
typeShort["jpeg"] = "image/jpeg";
typeShort["jpg"] = "image/jpeg";
typeShort["jfif"] = "image/jpeg";
typeShort["pjpeg"] = "image/jpeg";
typeShort["pjp"] = "image/jpeg";
typeShort["png"] = "image/png";
typeShort["svg"] = "image/svg";

module.exports.initialize = function(universe) {
	// TODO: Calendar time for year calibration/sync
	var year = 60 * 60 * 24 * 25 * 8; 

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
			pictures,
			x;

		for(x = 0; x < keys.length; x++) {
			details[keys[x]] = source[keys[x]];
		}
		details.id = Random.identifier("entity", 10, 32).toLowerCase();
		details.owned = {};
		details.owned[event.player.id] = Date.now();
		details.played_by = event.player.id;
		details.hp_rolled = 0;
		details.gold = 0;
		details.level = 1;
		details.birthday = universe.time - year * (event.message.data.age || 0);
		details.birthplace = event.message.data.birthplace;
		details.rumors_thoughts = event.message.data.rumors_thoughts;
		details.rumors_truths = event.message.data.rumors_truths;
		details.rumors_events = event.message.data.rumors_events;
		details.rumors_lies = event.message.data.rumors_lies;

		makeCharacter(universe, event, source, details)
		.then(copySpells)
		.then(copyFeats)
		.then(addPicture)
		.then(addPortrait)
		.then(finish)
		.catch(errored(universe, event));
	});
};

var makeCharacter = function(universe, event, source, details) {
	var data = {},
		pg = {};
	data.universe = universe;
	data.details = details;
	data.source = source;
	data.event = event;
	data.sets = {};
	
	// Setup Archetype Level Tracking
	data.archetype = universe.get(details.archetypes[0]);
	details.level_archetype = {};
	details.level_archetype[data.archetype.name.toLowerCase()] = 1;

	pg.id = "page:" + details.id;
	return new Promise(function(done, fail) {
		data.universe.createObject(pg, function(perr, page) {
			if(perr) {
				fail(perr);
			} else {
				details.page = page.id;
				data.universe.createObject(data.details, function(err, character) {
					if(err) {
						fail(err);
					} else {
						data.character = character;
						done(data);
					}
				});
			}
		});
	});
};

var copySpells = function(data) {
	return new Promise(function(done, fail) {
		var promised = [],
			errors = [],
			mask = {},
			count = 0,
			collect,
			i;

		if(data.details.spells) {
			mask.acquired = data.universe.time;
			mask.character = data.character.id;
			mask.caster = data.character.id;
			mask.user = data.character.id;
			promised.push(data.universe.copyArrayID(data.details.spells, mask)
			.then(function(copies) {
				data.sets.spells = copies;
			}));
		}
		if(data.details.spells_known) {
			mask.acquired = data.universe.time;
			mask.character = data.character.id;
			mask.caster = data.character.id;
			mask.user = data.character.id;
			promised.push(data.universe.copyArrayID(data.details.spells_known, mask)
			.then(function(copies) {
				data.sets.spells_known = copies;
			}));
		}

		if(promised.length) {
			Promise.all(promised)
			.then(function() {
				done(data);
			})
			.catch(fail);
		} else {
			done(data);
		}
	});
};

var copyFeats = function(data) {
	return new Promise(function(done, fail) {
		var errors = [],
			mask = {},
			count = 0,
			collect,
			i;

		if(data.details.feats) {
			mask.acquired = data.universe.time;
			mask.character = data.character.id;
			mask.user = data.character.id;
			data.sets.feats = [];

			collect = function(err, feat) {
				if(err) {
					// TODO: Improve Handling
					console.error("Feat Copy Error: ", err);
					data.universe.generalError("universe:character:create", err, "While copying Feats");
					errors.push(err);
				} else {
					var index = data.details.feats.indexOf(feat.parent);
					if(index === -1) {
						console.error(" [!] No Index for copied Feat?");
						data.universe.handleError("universe:character:create", null, "Copied an feat not in array", {"source": data.details.feats, "copy": feat.id, "parent": feat.parent, "entity": data.character.id});
					} else {
						data.sets.feats.push(feat.id);
					}
				}
				count++;
				if(count === data.details.feats.length) {
					done(data);
				}
			};

			if(data.details.feats.length) {
				for(i=0; i<data.details.feats.length; i++) {
					data.universe.copy(data.details.feats[i], mask, collect);
				}
			} else {
				done(data);
			}
		} else {
			done(data);
		}
	});
};

var addPicture = function(data) {
	return new Promise(function(done, fail) {
		if(data.source.picture) {
			var parsed = parseDataUrl(data.source.picture),
				details = {};
			details.id = Random.identifier("image", 10, 32).toLowerCase() + ":" + details.id;
			details.content_type = typeShort[parsed.content_type] || parsed.content_type || "image/jpeg";
			details.data = data.source.picture;
			details.name = (data.details.name || data.details.id || "Anonymous") + " (Picture)";
			details.description = "Uploaded picture for " + data.details.name + " ( " + data.details.id + " )";
			data.universe.createObject(details, function(err, image) {
				if(err) {
					fail(err);
				} else {
					data.sets.picture = image.id;
					data.picture = image;
					done(data);
				}
			});
		} else {
			done(data);
		}
	});
};

var addPortrait = function(data) {
	return new Promise(function(done, fail) {
		if(data.source.portrait) {
			var parsed = parseDataUrl(data.source.portrait),
				details = {};
			details.id = Random.identifier("image", 10, 32).toLowerCase() + ":" + details.id;
			details.content_type = typeShort[parsed.content_type] || parsed.content_type || "image/jpeg";
			details.data = data.source.portrait;
			details.name = (data.details.name || data.details.id || "Anonymous") + " (Portrait)";
			details.description = "Uploaded portrait for " + data.details.name + " ( " + data.details.id + " )";
			data.universe.createObject(details, function(err, image) {
				if(err) {
					fail(err);
				} else {
					data.sets.portrait = image.id;
					data.portrait = image;
					done(data);
				}
			});
		} else {
			done(data);
		}
	});
};

var finish = function(data) {
	return new Promise(function(done, fail) {
		var attributes = Object.assign({}, data.event.player.attribute),
			maxHP;
		attributes.playing_as = data.character.id;
		attributes = {
			"attribute": attributes
		};
		data.event.player.setValues(attributes, function(p_err) {
			if(typeof(data.character.hit_dice_max) === "object" && (maxHP = Object.keys(data.character.hit_dice_max)) && maxHP.length) {
				maxHP = parseInt(maxHP[0].substring(1)) || 6;
			} else {
				maxHP = 6;
			}
			data.sets.parent = "entity:character:parent";
			data.sets.hp_rolled = maxHP;
			data.sets.hp = maxHP + 4;
			data.sets.hp_temp = 0;
			console.log("Create Sets: ", data.sets);
			data.character.setValues(data.sets, function(err) {
				data.universe.chronicle.addOccurrence("character:created", data.event.message.data, Date.now(), null, data.event.player?data.event.player.id:null);
				data.event.player.setValues(data.sets, function(err) {
					if(err || p_err) {
						data.universe.emit("send", {
							"type": "notice",
							"mid": "create:character",
							"recipient": data.event.player.id,
							"message": "Character Created (With Issues)",
							"icon": "fas fa-check rs-lightyellow",
							"errors": [err, p_err],
							"timeout": 10000
						});
					} else {
						data.universe.emit("send", {
							"type": "notice",
							"mid": "create:character",
							"recipient": data.event.player.id,
							"message": "Character Created",
							"icon": "fas fa-check rs-lightgreen",
							"timeout": 10000
						});
					}
					done(data);
				});
			});
		});
	});
};

var errored = function(universe, event) {
	return function(error) {
		console.log("Creation Error: ", error.message + JSON.stringify(error, null, 4).substring(0, 1000));
		universe.emit("send", {
			"type": "notice",
			"mid": "create:character",
			"recipient": event.player.id,
			"message": "Character Creation Failed: " + error.message,
			"icon": "fas fa-exclamation-triangle rs-lightred",
			"error": error,
			"anchored": true
		});
	};
};
