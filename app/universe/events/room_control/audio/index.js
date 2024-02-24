/**
 * 
 * @class AudioControls
 * @constructor
 * @param {Universe} universe 
 */

var types = {};

types["audio:sonos"] = require("./sonos.js");

module.exports.initialize = function(universe) {

	var controllerMapping = {},
		buildController,
		getController,
		notifyMasters;

	notifyMasters = function(message, icon) {
		universe.emit("send", {
			"id": "system:audio:sonos",
			"type": "notice",
			"recipients": universe.getMasters(),
			"message": "Sonos Audio: " + message,
			"icon": icon || "fa-solid fa-exclamation-triangle rs-green",
			"anchored": true
		});
	};

	getController = function(controller) {
		if(controllerMapping[controller.control_point]) {
			return controllerMapping[controller.control_point];
		}
		controllerMapping[controller.control_point] = buildController(controller);
		return controllerMapping[controller.control_point];
	};

	buildController = function(controller) {
		var type = types[controller.control_type];
		if(type) {
			console.log("Building Controller");
			return new type.AudioController(controller);
		} else {
			console.log("Failed to Build Controller: ", controller);
			universe.warnMasters("Invalid or Unsupported Room Control Type for Audio Point: " + controller.control_type);
			return null;
			// throw new Error("Invalid or Unsupported Room Control Type for Audio Point: " + controller.control_type);
		}
	};

	/**
	 * 
	 * @event player:master:roomctrl:play
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
	 * @param {Object} event.message.data.control RoomCtrl to which to play.
	 * @param {String} [event.message.data.audio] If specified with playlist, this is added along with the playlist and
	 * 		played first. Otherwise plays and attempts to preserve the playlist.
	 * @param {String} [event.message.data.playlist] Clear the current playlist and queue the audio here in, then play
	 * 		if currently not doing so.
	 * @param {Integer} [event.message.data.volume] Set Volume on the control
	 * @param {Integer} [event.message.data.delay] Time to wait before playing the audio
	 */
	universe.on("player:master:roomctrl:play", function(event) {
		var roomctrl = universe.manager.roomctrl.object[event.message.data.control],
			playlist = universe.manager.playlist.object[event.message.data.playlist],
			audio = universe.manager.audio.object[event.message.data.audio],
			volume = event.message.data.volume,
			controller,
			follow;

		if(event.player.gm) {
			if(roomctrl && (controller = getController(roomctrl))) {
				if(playlist) {
					follow = controller.cease()
					.then(function() {
						return controller.start(playlist);
					});
				}
				if(audio) {
					console.log("Audio: " + audio.id);
					if(follow) {
						follow = follow.then(function() {
							return controller.play(audio);
						});
					} else {
						follow = controller.play(audio);
					}
				}
				if(typeof(volume) === "number") {
					console.log("volume: " + volume);
					if(follow) {
						follow = follow.then(function() {
							return controller.setVolume(volume);
						});
					} else {
						follow = controller.setVolume(volume);
					}
				}
				if(follow) {
					follow.catch(function(err) {
						notifyMasters("Failed to execute control - " + err.message);
						universe.generalError("master:roomctrl:error", err, "Error managing Room Audio Controller: " + err.message, {
							"player": event.player.id,
							"data": event.message.data,
							"error": {
								"message": err.message,
								"stack": err.stack
							}
						});
					});
				} else {
					notifyMasters("No control to execute was found - " + event.message.data.control);
					universe.generalError("master:roomctrl:execution", null, "No control to execute was found", {
						"player": event.player.id,
						"data": event.message.data
					});
				}
			} else {
				notifyMasters("Non-existent controller - " + event.message.data.control);
				universe.generalError("master:roomctrl:access", null, "Non-existent controller", {
					"player": event.player.id,
					"data": event.message.data
				});
			}
		} else {
			notifyMasters("Unauthorized attempt to access sound system - " + event.player.name + "[" + event.player.id + "]");
			universe.generalError("master:roomctrl:access", null, "Invalid attempt to send a master level message", {
				"player": event.player.id,
				"data": event.message.data
			});
		}
	});

	universe.on("roomctrl:play", function(event) {
		var controller,
			roomctrl,
			playlist,
			volume,
			follow,
			audio;

		if(typeof(event) === "string") {
			roomctrl = universe.manager.roomctrl.object[universe.getSetting("setting:ctrl:audio:main")];
			if(event.startsWith("audio:")) {
				audio = event;
			} else if(event.startsWith("playlist:")) {
				playlist = event;
			} else {
				notifyMasters("Invalid audio control event - " + event);
				universe.generalError("master:roomctrl:invalid", null, "Invalid audio control event", {
					"data": event
				});
			}
		} else {
			roomctrl = universe.manager.roomctrl.object[event.control || universe.getSetting("setting:ctrl:audio:main")];
			playlist = universe.manager.playlist.object[event.playlist];
			audio = universe.manager.audio.object[event.audio];
			volume = event.volume;
		}

		console.log(" - Room Controller[" + universe.getSetting("setting:ctrl:audio:main") + "] Play: ", roomctrl?roomctrl.name:"None", event);
		if(roomctrl && (controller = getController(roomctrl))) {
			if(playlist) {
				if(typeof(playlist) === "string") {
					playlist = universe.manager.playlist.object[playlist];
				}
				follow = controller.cease()
				.then(function() {
					return controller.start(playlist);
				});
			}
			if(audio) {
				if(typeof(audio) === "string") {
					audio = universe.manager.audio.object[audio];
				}
				console.log("Audio: " + audio.id);
				if(follow) {
					follow = follow.then(function() {
						return controller.play(audio);
					});
				} else {
					follow = controller.play(audio);
				}
			}
			if(typeof(volume) === "number") {
				console.log("volume: " + volume);
				if(follow) {
					follow = follow.then(function() {
						return controller.setVolume(volume);
					});
				} else {
					follow = controller.setVolume(volume);
				}
			}
			if(follow) {
				follow.catch(function(err) {
					notifyMasters("Failed to execute control - " + err.message);
					universe.generalError("master:roomctrl:error", err, "Error managing Room Audio Controller: " + err.message, {
						"data": event,
						"error": {
							"message": err.message,
							"stack": err.stack
						}
					});
				});
			} else {
				notifyMasters("No control to execute was found - " + event);
				universe.generalError("master:roomctrl:execution", null, "No control to execute was found", {
					"data": event
				});
			}
		} else {
			notifyMasters("Non-existent controller - " + event.control);
			universe.generalError("master:roomctrl:access", null, "Non-existent controller", {
				"data": event
			});
		}
	});

	/**
	 * 
	 * @event player:master:roomctrl:stop
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
	 * @param {Object} event.message.data.control RoomCtrl to which to play.
	 */
	universe.on("player:master:roomctrl:stop", function(event) {
		var roomctrl = universe.manager.roomctrl.object[event.message.data.control],
			playlist = universe.manager.playlist.object[event.message.data.playlist],
			audio = universe.manager.audio.object[event.message.data.audio],
			volume = event.message.data.volume,
			controller,
			follow;

		if(event.player.gm) {
			if(roomctrl && (controller = getController(roomctrl))) {
				controller.stop();
			} else {
				notifyMasters("Non-existent controller - " + event.message.data.control);
				universe.generalError("master:roomctrl:access", null, "Non-existent controller", {
					"player": event.player.id,
					"data": event.message.data
				});
			}
		} else {
			notifyMasters("Unauthorized attempt to access sound system - " + event.player.name + "[" + event.player.id + "]");
			universe.generalError("master:roomctrl:access", null, "Invalid attempt to send a master level message", {
				"player": event.player.id,
				"data": event.message.data
			});
		}
	});

	/**
	 * 
	 * @event player:master:roomctrl:report
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
	 * @param {Object} event.message.data.control RoomCtrl to which to play.
	 */
	universe.on("player:master:roomctrl:report", function(event) {
		var roomctrl = universe.manager.roomctrl.object[event.message.data.control],
			playlist = universe.manager.playlist.object[event.message.data.playlist],
			audio = universe.manager.audio.object[event.message.data.audio],
			volume = event.message.data.volume,
			controller,
			follow;

		if(event.player.gm) {
			if(roomctrl && (controller = getController(roomctrl))) {
				controller.report(event.player);
			} else {
				notifyMasters("Non-existent controller - " + event.message.data.control);
				universe.generalError("master:roomctrl:access", null, "Non-existent controller", {
					"player": event.player.id,
					"data": event.message.data
				});
			}
		} else {
			notifyMasters("Unauthorized attempt to access sound system - " + event.player.name + "[" + event.player.id + "]");
			universe.generalError("master:roomctrl:access", null, "Invalid attempt to send a master level message", {
				"player": event.player.id,
				"data": event.message.data
			});
		}
	});

	/**
	 * Create an Audio object based on the currently playing audio
	 * @event player:master:roomctrl:create
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
	 * @param {Object} event.message.data.control RoomCtrl to which to play.
	 */
	universe.on("player:master:roomctrl:create", function(event) {
		var roomctrl = universe.manager.roomctrl.object[event.message.data.control],
			controller;

		if(event.player.gm) {
			if(roomctrl && (controller = getController(roomctrl))) {
				controller.currentToAudio()
				.catch(function(error) {
					notifyMasters("Failed to create audio from current track - " + event.message.data.control);
					universe.generalError("master:roomctrl:create", error, "Failed to create audio object from current track: " + error.message, {
						"player": event.player.id,
						"data": event.message.data
					});
				});
			} else {
				notifyMasters("Non-existent controller - " + event.message.data.control);
				universe.generalError("master:roomctrl:access", null, "Non-existent controller", {
					"player": event.player.id,
					"data": event.message.data
				});
			}
		} else {
			notifyMasters("Unauthorized attempt to access sound system - " + event.player.name + "[" + event.player.id + "]");
			universe.generalError("master:roomctrl:access", null, "Invalid attempt to send a master level message", {
				"player": event.player.id,
				"data": event.message.data
			});
		}
	});
};
