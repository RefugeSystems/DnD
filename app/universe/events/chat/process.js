/**
 * 
 * @event player:chat
 * @for Universe
 * @param {Object} event With data from the system
 * @param {String} event.type The event name being fired, should match this event's name
 * @param {Integer} event.received Timestamp of when the server received the event
 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
 * @param {RSObject} event.player That triggered the event
 * @param {Object} event.message The payload from the UI
 * @param {Object} event.message.mid To identify the message
 * @param {Object} event.message.group
 * @param {Object} event.message.text
 * @param {Object} event.message.from
 * @param {Object} event.message.sent
 */

var Random = require("rs-random");

module.exports.initialize = function(universe) {
	universe.on("player:chat", function(event) {
		console.log("Received Chat: ", event.message);
		universe.chronicle.addOccurrence("chat", event.message, universe.time, event.player.id, event.message.group);

		var chat = {},
			location,
			parties,
			entity,
			player,
			party,
			main,
			to,
			i,
			j;

		chat.id = Random.string(32);
		chat.type = "chat";
		chat.text = event.message.data.text;
		chat.from = event.player.id;
		chat.group = event.message.data.group;
		chat.sent = Date.now();
		chat.client_sent = event.message.data.sent;
		chat.server_recv = Date.now();

		if(chat.group === "all") {

		} else if(chat.group === "master") {
			chat.recipients = universe.getMasters();
			chat.recipients[chat.from] = true;
		} else if(chat.group === "locale") {
			chat.recipients = {};
			chat.recipients[chat.from] = true;
			if(event.player.attribute.playing_as && (main = universe.get(event.player.attribute.playing_as, "entity"))) {
				parties = universe.list("party");
				for(i=0; i<parties.length; i++) {
					party = universe.get(parties[i], "party");
					if(!party.is_preview && party.entities.indexOf(main.id)) {
						for(j=0; j<party.entities.length; j++) {
							entity = universe.get(party.entities[j]);
							if(entity && entity.owned) {
								Object.assign(chat.recipients, entity.owned);
							}
						}
					}
				}

				if(main.location) {
					location = universe.get(main.location);
					if(location && location.populace) {
						for(i=0; i<location.populace.length; i++) {
							entity = universe.get(location.populace[i], "entity");
							if(entity && entity.owned) {
								Object.assign(chat.recipients, entity.owned);
							}
						}
					}
				}
			}
		} else {
			// Add "Party" support
			chat.recipients = {};
			chat.recipients[chat.group] = true;
			chat.recipients[chat.from] = true;
		}

		universe.emit("send", chat);
	});
};