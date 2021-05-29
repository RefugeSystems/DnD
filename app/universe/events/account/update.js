/**
 * 
 * @event player:account:update
 * @for Universe
 * @param {Object} event With data from the system
 * @param {String} event.type The event name being fired, should match this event's name
 * @param {Integer} event.received Timestamp of when the server received the event
 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
 * @param {RSObject} event.player That triggered the event
 * @param {Object} event.message The payload from the UI
 * @param {Object} event.message.type Original event type indicated by the UI; Should be "error:retrieve"
 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
 * @param {Object} event.message.data Typical location of data from the UI
 */

module.exports.initialize = function(universe) {
	universe.on("player:account:update", function(event) {
		console.log("Player Event: ", event);
		
		var auth_sources = ["discord", "bnet", "google", "facebook"],
			errors = [],
			values,
			keys,
			x;
			
		values = {
			"attribute": {}
		};
		
		for(x=0; x<auth_sources.length; x++) {
			if(event.message.data[auth_sources[x]]) {
				if(confirmUnique(event.player, auth_sources[x], event.message.data)) {
					values.attribute[auth_sources[x]] = event.message.data[auth_sources[x]];
				} else {
					errors.push(auth_sources[x]);
				}
			}
		}
		
		if(event.message.data.password) {
			values.password = event.message.data.password.sha256();
		}
		if(event.message.data.username && event.message.data.username !== event.player.username) {
			values.username = event.message.data.username;
		}
		if(event.message.data.description && event.message.data.description !== event.player.description) {
			values.description = event.message.data.description;
		}
		if(event.message.data.email && event.message.data.email !== event.player.email) {
			values.email = event.message.data.email;
		}
		
		console.log("Account Values: " + JSON.stringify(values, null, 4));
		
		if(errors.length) {
			universe.emit("send", {
				"type": "system-exception",
				"mid": "account:updated",
				"recipient": event.player.id,
				"message": "Account Update Failed: " + errors.join(),
				"errors": errors,
				"anchored": true
			});
		} else {
			event.player.setValues(values, function(err, object) {
				if(err) {
					universe.emit("send", {
						"type": "system-exception",
						"mid": "account:updated",
						"recipient": event.player.id,
						"message": "Account Update Failed: " + err.message,
						"errors": [err],
						"anchored": true
					});
				} else {
					universe.emit("send", {
						"type": "notice",
						"mid": "account:updated",
						"recipient": event.player.id,
						"message": "Account Updated",
						"timeout": 10000
					});
				}
			});
		}
	});
	
	var confirmUnique = function(changing, key, base) {
		if(!base[key]) {
			return false;
		}
		
		var player,
			x;
			
		for(x=0; x<universe.manager.player.objectIDs.length; x++) {
			player = universe.manager.player.object[universe.manager.player.objectIDs[x]];
			if(changing.id !== player.id && player.attribute[key] === base[key]) {
				return false;
			}
		}
		
		return true;
	};
};
