module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:meeting:details
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
	 * @param {String} event.message.data.meeting
	 * @param {String} event.message.data.name
	 * @param {String} event.message.data.description
	 */
	universe.on("player:meeting:details", function(event) {
		var meeting = universe.manager.meeting.object[event.message.data.meeting],
			update = {};
		if(event.player.gm) {
			if(meeting) {
				if(event.message.data.name && event.message.data.name.length) {
					update.name = event.message.data.name;
				}
				if(event.message.data.description && event.message.data.description.length) {
					update.description = event.message.data.description;
				}
				if(event.message.data.note && event.message.data.note.length) {
					update.note = event.message.data.note;
				}
				meeting.setValues(update);
			} else {
				universe.warnMasters("Missing information - No Meeting Found: " + event.message.data.meeting, event.message.data);
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});

	/**
	 * 
	 * @event player:meeting:add:entities
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
	 * @param {String} event.message.data.meeting
	 * @param {String} event.message.data.entities
	 */
	/**
	 * 
	 * @event session:nearby:coming
	 * @param {String} type Event type classifier
	 * @param {Array} entities
	 * @param {String} meeting
	 * @param {Number} time Simulation
	 * @param {Number} date Reality
	 */
	universe.on("player:meeting:add:entities", function(event) {
		var entities = event.message.data.entities,
			meeting = event.message.data.meeting,
			associations = [],
			changing = [],
			transition,
			entity,
			add,
			i;

		if(typeof(meeting) === "string") {
			meeting = universe.manager.meeting.object[event.message.data.meeting];
		}
		if(event.player.gm) {
			if(meeting && entities && entities.length) {
				for(i=0; i<entities.length; i++) {
					entity = entities[i];
					if(typeof(entity) === "string") {
						entity = universe.manager.entity.object[entity];
					}
					if(entity && !entity.disabled && !entity.is_preview && meeting.entities.indexOf(entity.id) === -1) {
						changing.push(entity.id);
						if(entity.is_copy && entity.parent) {
							add = entity.parent;
						} else {
							add = entity.id;
						}
						if(!meeting.associations || meeting.associations.indexOf(add) === -1) {
							associations.push(add);
						}
					}
				}
				if(changing.length) {
					transition = {
						"name": "Creatures join the travels...",
						"type": "session:nearby:coming",
						"entities": changing,
						"meeting": meeting.id,
						"time": universe.time,
						"date": Date.now()
					};
					meeting.addValues({
						"associations": associations.length?associations:undefined,
						"entities": changing
					});
					meeting.addValues({
						"historical_events": [transition]
					});
					universe.emit("send", transition);
				}
			} else {
				universe.warnMasters("Missing information: " + (!!meeting) + " | " + (entities?entities.length:"false"));
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});

	/**
	 * 
	 * @event player:meeting:remove:entities
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
	 * @param {String} event.message.data.meeting
	 * @param {String} event.message.data.entities
	 */
	/**
	 * 
	 * @event session:nearby:going
	 * @param {String} type Event type classifier
	 * @param {Array} entities
	 * @param {String} meeting
	 * @param {Number} time Simulation
	 * @param {Number} date Reality
	 */
	universe.on("player:meeting:remove:entities", function(event) {
		var entities = event.message.data.entities,
			meeting = event.message.data.meeting,
			changing = [],
			transition,
			entity,
			i;

		if(typeof(meeting) === "string") {
			meeting = universe.manager.meeting.object[event.message.data.meeting];
		}
		if(event.player.gm) {
			if(meeting && entities && entities.length) {
				for(i=0; i<entities.length; i++) {
					entity = entities[i];
					if(typeof(entity) === "string") {
						entity = universe.manager.entity.object[entity];
					}
					if(entity) {
						changing.push(entity.id);
					} else {
						changing.push(entities[i]);
					}
				}
				if(changing.length) {
					transition = {
						"name": "Creatures leave the travels...",
						"type": "session:nearby:going",
						"entities": changing,
						"meeting": meeting.id,
						"time": universe.time,
						"date": Date.now()
					};
					meeting.subValues({
						"entities": changing
					});
					meeting.addValues({
						"historical_events": [transition]
					});
					universe.emit("send", transition);
				}
			} else {
				universe.warnMasters("Missing information: " + (!!meeting) + " | " + (entities?entities.length:"false"));
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
