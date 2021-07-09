
var cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * Requires GameMaster
	 * @event player:give:copy
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
	 * @param {String} [event.message.data.source] Optional information for the source of the copy
	 * @param {String} event.message.data.target To receive the object
	 * @param {String} event.message.data.object To be copied
	 * @param {String} event.message.data.field To which to add the copy, should essentially always be an Array type field
	 */
	universe.on("player:give:copy", function(event) {
		if(event.player.gm) {
			var target = universe.get(event.message.data.target),
				object = universe.get(event.message.data.object),
				field = event.message.data.field, // TODO: Get actual field object for better checks?
				values = {},
				source,
				object;

			if(event.message.data.source) {
				source = universe.get(event.message.data.source);
			}

			if(object.is_singular) {
				values[field] = object.id;
				target.addValues(values);
			} else {
				values.acquired = universe.time;

				if(object.duration) {
					values.expiration = universe.time + (parseInt(object.duration) || 0);
				}

				universe.copy(event.message.data.object, values, function(err, copy) {
					if(copy.expiration) {
						// TODO: Setting an expiration in the far future then rewinding time invalidates the previous expirations as they
						//		are on the abandoned timeline. May need a fallback check on "time_end" field instead of relying on the
						//		chronicle. Or rescan all items and effects for future endings on a resumed forward.
						universe.chronicle.addOccurrence("object:expiration", {
							"target": target.id,
							"id": copy.id,
							"field": field
						}, copy.expiration);
					}
					values = {};
					values[field] = copy.id;
					target.addValues(values);
				});
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "universe:error",
				"recipients": universe.getMasters(),
				"message": "Access error: Non Game-Master Player attempted to give an item copy",
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"anchored": true
			});
		}
	});

	/**
	 * 
	 * Requires GameMaster
	 * @event player:distribute:items
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
	 * @param {Array} event.message.data.targets Entity Object or IDs
	 * @param {Array} event.message.data.items Item Object or IDs
	 */
	universe.on("player:distribute:items", function(event) {
		if(event.player.gm) {
			var targets = event.message.data.targets,
				items = event.message.data.items;

			targets.forEach(function(target) {
				var distributing = [],
					waiting = [],
					item,
					i;

				if(typeof(target) === "string") {
					target = universe.manager.entity.object[target];
				}
				if(target && !target.disabled && !target.is_preview) {
					distributing = [];
					for(i=0; i<items.length; i++) {
						item = items[i];
						if(typeof(item) === "string") {
							item = universe.manager.item.object[item];
						}
						if(item && !item.disabled && !item.is_preview) {
							if(item.is_singular) {
								distributing.push(item.id);
							} else {
								waiting.push(new Promise(function(done, fail) {
									universe.copy(item, function(err, copy) {
										if(err) {
											fail(err);
										} else {
											distributing.push(copy.id);
											done();
										}
									});
								}));
							}
						}
					}

					Promise.all(waiting)
					.then(function() {
						target.addValues({
							"inventory": distributing
						});
					})
					.catch(function(err) {
						universe.warnMasters("Failed to distribute items", {
							"error": err,
							"event": event.message.data
						});
					});
				}
			});
		}
	});

	/**
	 * 
	 * Requires GameMaster
	 * @event player:undistribute:items
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
	 * @param {Array} event.message.data.targets Entity Object or IDs
	 * @param {Array} event.message.data.items Item Object or IDs
	 */
	universe.on("player:undistribute:items", function(event) {
		if(event.player.gm) {
			var targets = event.message.data.targets,
				items = event.message.data.items,
				removing = [],
				entity,
				i;
			
			for(i=0; i<items.length; i++) {
				if(items[i]) {
					if(typeof(items[i]) === "string") {
						removing.push(items[i]);
					} else {
						removing.push(items[i].id);
					}
				}
			}

			removing = {
				"inventory": removing
			};
			
			// TODO: Consider a more elegant event firing to remove the items one at a time or consolidating the relevent
			//		"Is Equipped?" check for removing an item and other considerations. Though, this yoink should be rarely
			//		used in condtions where that would be a problem
			for(i=0; i<targets.length; i++) {
				entity = targets[i];
				if(typeof(entity) === "string") {
					entity = universe.manager.entity.object[entity];
				}
				entity.subValues(removing);
			}
		}
	});
};