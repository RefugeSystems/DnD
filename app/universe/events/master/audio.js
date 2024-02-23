module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:master:control:audio:play
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
	 * @param {String} event.message.data.audio
	 * @param {Object} [event.message.data.recipients] 
	 * @param {Integer} [event.message.data.delay] Time to wait before playing the audio
	 * @param {Boolean} [event.message.data.sync] When true, the client attempts to synchronize the play time by leveraging
	 * 		the current ping statistics.
	 */
	universe.on("player:master:control:audio:play", function(event) {
		var audio = event.message.data.audio,
			delay = event.message.data.delay || 0,
			sync = event.message.data.sync || false,
			recipients = event.message.data.recipients;

		if(typeof(audio) === "string") {
			audio = universe.manager.audio.object[audio];
		}

		console.log("Play -");
		if(event.player.gm && audio) {
			console.log(" > Play - " + audio.id);
			if(!audio.disabled && !audio.is_disabled && !audio.is_preview) {
				console.log("> Play - Emit");
				universe.emit("master:control", {
					"control": "audio:play",
					"recipients": recipients,
					"data": {
						"audio": audio.id,
						"delay": delay,
						"sync": sync
					}
				});
			} else {
				console.log("> Play - Disabled");
				recipients = {};
				recipients[event.player.id] = true;
				universe.emit("send", {
					"type": "notice",
					"icon": "fas fa-exclamation-triangle rs-lightyellow",
					"recipients": recipients,
					"message": "Can not send play for disabled audio",
					"data": event.message.data,
					"timeout": 8000
				});
			}
		} else {
			console.log(" > Violation - " + audio.id);
			recipients = Object.assign({}, universe.getMasters());
			recipients[event.player.id] = true;
			universe.emit("send", {
				"type": "notice",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"recipients": recipients,
				"message": "Can't play undefined Audio and you must be a Game Master to do so.",
				"data": event.message.data,
				"timeout": 8000
			});
		}
	});


	universe.on("audio:play", function(event) {
		console.log("Audio Play Event: ", event);
		var recipients,
			audio,
			delay,
			sync;
			
		if(event) {
			if(typeof(event) === "string") {
				audio = event;
				recipients = {"player:master":true};
				sync = false;
				delay = 0;
			} else {
				audio = event.audio;
				recipients = event.recipients || {"player:master":true};
				sync = event.sync || false;
				delay = event.delay || 0;
			}

			if(typeof(audio) === "string") {
				audio = universe.manager.audio.object[audio];
			}

			if(!audio.disabled && !audio.is_disabled && !audio.is_preview) {
				universe.emit("master:control", {
					"control": "audio:play",
					"recipients": recipients,
					"data": {
						"audio": audio.id,
						"delay": delay,
						"sync": sync
					}
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"icon": "fas fa-exclamation-triangle rs-lightyellow",
					"recipients": recipients,
					"message": "Can not send play for disabled audio",
					"data": event,
					"timeout": 8000
				});
			}
		}
	});

	/**
	 * 
	 * @event player:master:control:audio:stop
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
	 * @param {String} event.message.data.audio
	 * @param {Object} [event.message.data.recipients] Maps player IDs to true values to indicate who should receive
	 * @param {Integer} [event.message.data.delay] Time to wait before playing the audio
	 * @param {Boolean} [event.message.data.sync] When true, the client attempts to synchronize the play time by leveraging
	 * 		the current ping statistics.
	 */
	universe.on("player:master:control:audio:stop", function(event) {
		var audio = event.message.data.audio,
			delay = event.message.data.delay || 0,
			sync = event.message.data.sync || false,
			recipients = event.message.data.recipients;

		if(typeof(audio) === "string") {
			audio = universe.manager.audio.object[audio];
		}

		if(event.player.gm && audio) {
			if(!audio.disabled && !audio.is_disabled && !audio.is_preview) {
				universe.emit("master:control", {
					"control": "audio:stop",
					"recipients": recipients,
					"data": {
						"audio": audio.id,
						"delay": delay,
						"sync": sync
					}
				});
			} else {
				recipients = {};
				recipients[event.player.id] = true;
				universe.emit("send", {
					"type": "notice",
					"icon": "fas fa-exclamation-triangle rs-lightyellow",
					"recipients": recipients,
					"message": "Can not send stop for disabled audio",
					"data": event.message.data,
					"timeout": 8000
				});
			}
		} else {
			recipients = Object.assign({}, universe.getMasters());
			recipients[event.player.id] = true;
			universe.emit("send", {
				"type": "notice",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"recipients": recipients,
				"message": "Can't stop undefined Audio and you must be a Game Master to do so.",
				"data": event.message.data,
				"timeout": 8000
			});
		}
	});

	/**
	 * 
	 * @event player:master:control:audio:stop:all
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
	 * @param {String} event.message.data.audio
	 * @param {Object} [event.message.data.recipients] Maps player IDs to true values to indicate who should receive
	 * @param {Integer} [event.message.data.delay] Time to wait before playing the audio
	 * @param {Boolean} [event.message.data.sync] When true, the client attempts to synchronize the play time by leveraging
	 * 		the current ping statistics.
	 */
	universe.on("player:master:control:audio:stop:all", function(event) {
		var delay = event.message.data.delay || 0,
			sync = event.message.data.sync || false,
			recipients = event.message.data.recipients;

		if(event.player.gm) {
			universe.emit("master:control", {
				"control": "audio:stop:all",
				"recipients": recipients,
				"data": {
					"delay": delay,
					"sync": sync
				}
			});
		} else {
			recipients = Object.assign({}, universe.getMasters());
			recipients[event.player.id] = true;
			universe.emit("send", {
				"type": "notice",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"recipients": recipients,
				"message": "Can't stop undefined Audio and you must be a Game Master to do so.",
				"data": event.message.data,
				"timeout": 8000
			});
		}
	});
};
