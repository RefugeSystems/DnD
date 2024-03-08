module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:charge:use
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
	 * @param {Object} event.message.data.entity That has the object
	 * @param {Object} event.message.data.object To gain a charge
	 * @param {Object} event.message.data.expend Charges
	 */
	universe.on("player:charges:use", function(event) {
		var entity = event.message.data.entity,
			object = event.message.data.object,
			expend = event.message.data.expend;
		expend = parseInt(expend);
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		// console.log("Use: ", event.message.data);
		// TODO: Check Player ownership and entity has object
		// if(expend && entity && object && object.charges_max) {
		if(expend && object && object.charges_max) {
			object.subValues({
				"charges": expend
			});
		}
	});

	/**
	 * 
	 * @event player:charge:gain
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
	 * @param {Object} event.message.data.entity That has the object
	 * @param {Object} event.message.data.object To gain a charge
	 * @param {Object} event.message.data.gained Charges
	 */
	universe.on("player:charges:gain", function(event) {
		var entity = event.message.data.entity,
			object = event.message.data.object,
			gained = event.message.data.gained;
		gained = parseInt(gained);
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		// console.log("Gain: ", event.message.data);
		// TODO: Check Player ownership and entity has object
		if(gained && object && object.charges_max) {
			object.addValues({
				"charges": gained
			});
		}
	});

	/**
	 * 
	 * @event player:charge:gain
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
	 * @param {Object} event.message.data.entity That has the object
	 * @param {Object} event.message.data.object To gain a charge
	 * @param {Object} event.message.data.change Charges
	 */
	universe.on("player:object:charges", function(event) {
		var entity = event.message.data.entity,
			object = event.message.data.object,
			change = event.message.data.change;
		change = parseInt(change);
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		// console.log("Gain: ", event.message.data);
		// TODO: Check Player ownership and entity has object
		if(change && object && object.charges_max) {
			object.addValues({
				"charges": change
			});
		}
	});

	/**
	 * Purchase a charge for a given object.
	 * 
	 * For instance, recharging a backpack.
	 * @event player:charge:purchase
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
	 * @param {Object} event.message.data.entity That has the object
	 * @param {Object} event.message.data.object To gain a charge
	 * @param {Object} event.message.data.cost Cost
	 */
	universe.on("player:charges:purchase", function(event) {
		var entity = event.message.data.entity,
			object = event.message.data.object,
			cost = event.message.data.cost;

		cost = parseInt(cost);
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(typeof(object) === "string") {
			object = universe.get(object);
		}

		if(cost && object && object.charges_max && cost < entity.gold) {
			object.addValues({
				"charges": 1
			});
			entity.subValues({
				"gold": cost
			});
		}
	});
};
