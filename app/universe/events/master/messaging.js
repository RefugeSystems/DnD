module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:master:link
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
	 * @param {String} event.message.data.message
	 * @param {String} event.message.data.link
	 */
	universe.on("player:master:link", function(event) {
	});

	/**
	 * 
	 * @event player:master:message
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {String} event.message.data.text
	 * @param {String} [event.message.data.id] Anchoring ID, defaults to "master:message"
	 * @param {Object} [event.message.data.recipients] Specifying Player IDs as properties for who should receive.
	 * 			Defaults to all connected
	 * @param {String} [event.message.data.icon] Defaults to "rs-light-purple fas fa-comment-lines"
	 * @param {String} [event.message.data.link] Prompts to send the user to a page on the site.
	 * @param {Integer} [event.message.data.timeout] In milliseconds. If omitted, the message is anchored.
	 */
	 universe.on("player:master:message:send", function(event) {
		if(event.player.gm) {
			var message = {};
			message.type = "notice";
			message.message = event.message.data.text;
			message.id = event.message.data.id || "master:message";
			message.icon = event.message.data.icon || "rs-light-purple fas fa-comment-lines";
			if(event.message.data.timeout) {
				message.timeout = parseInt(event.message.data.timeout);
			} else {
				message.anchored = true;
			}
			if(event.message.data.recipients) {
				Object.assign({}, event.message.data.recipients);
			} else {
				message.recipients = universe.getConnectedRecipients();
			}
			universe.emit("send", message);
		} else {
			universe.generalError("master:message:access", null, "Invalid attempt to send a master level message", {"player": event.player.id, "data": event.message.data});
		}
	});

	/**
	 * 
	 * @event player:master:message
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {String} [event.message.data.id] Anchoring ID, defaults to "master:message"
	 * @param {Object} [event.message.data.recipients] Specifying Player IDs as properties for who should receive.
	 * 			Defaults to all connected
	 */
	 universe.on("player:master:message:dismiss", function(event) {
		var id = event.message.data.id || "master:message",
			notify;
		if(event.message.data.recipients) {
			notify = Object.assign({}, event.message.data.recipients);
		} else {
			notify = universe.getConnectedRecipients();
		}
		universe.emit("send", {
			"type": "dismiss-message",
			"id": id,
			"recipients": notify
		});
	 });


	 universe.on("player:master:thinking", function(event) {
		if(event.player.gm) {
			universe.emit("send", {
				"type": "master:thinking"
			});
		}
	 });
};
