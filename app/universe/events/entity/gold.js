/**
 * 
 * @event player:send:gold
 * @for Universe
 * @param {Object} event With data from the system
 * @param {String} event.type The event name being fired, should match this event's name
 * @param {Integer} event.received Timestamp of when the server received the event
 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
 * @param {RSObject} event.player That triggered the event
 * @param {Object} event.message The payload from the UI
 * @param {Object} event.message.data Object data from UI
 * @param {String | Object} event.message.data.entity 
 * @param {String | Object} event.message.data.target 
 * @param {Number} event.message.data.amount Of gold
 * @param {Boolean} event.message.data.hide To not add history when true and from master
 */
module.exports.initialize = function(universe) {

	universe.on("player:send:gold", function(event) {
		var target = universe.get(event.message.data.target),
			amount = parseInt(event.message.data.amount),
			entity;

		if(event.message.data.entity || event.message.data.source) {
			entity = universe.get(event.message.data.entity || event.message.data.source);
		}
			
		if(target) {
			if(!entity) {
				if(event.player.gm) {
					if(event.message.data.hide) {
						target.addValues({
							"gold": amount
						});
					} else {
						target.addValues({
							"gold": amount,
							"history": {
								"event": "recv:gold",
								"time": universe.time,
								"amount": amount,
								"from": null
							}
						});
					}
					universe.chronicler.addOccurrence("entity:give:gold", {
						"source": entity.id,
						"amount": amount
					});
				} else {
					// TODO: Warning
				}
			} else if(entity) {
				if(entity.owned[event.player.id]) {
					if(amount <= entity.gold) {
						entity.addValues({
							"gold": -1 * amount,
							"history": {
								"event": "give:gold",
								"time": universe.time,
								"to": target.id
							}
						});
						target.addValues({
							"gold": amount,
							"history": {
								"event": "recv:gold",
								"time": universe.time,
								"from": entity.id
							}
						});
						universe.chronicler.addOccurrence("entity:give:gold", {
							"source": entity.id,
							"target": target.id,
							"amount": amount
						});
					} else {
						universe.emit("send", {
							"type": "notice",
							"mid": "report:error:received",
							"recipients": universe.getMasters(),
							"message": "Failed gold transfer",
							"data": event.message,
							"anchored": true
						});
					}
				} else {
					universe.emit("send", {
						"type": "notice",
						"mid": "report:error:received",
						"recipients": universe.getMasters(),
						"message": "Attempt to send gold from un-owned entity",
						"data": event.message,
						"anchored": true
					});
				}
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "report:error:received",
					"recipients": universe.getMasters(),
					"message": "Attempted to send to " + target.name + " from unknown",
					"data": event.message,
					"anchored": true
				});
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "report:error:received",
				"recipients": universe.getMasters(),
				"message": "Attempted to send to undefined target",
				"data": event.message,
				"anchored": true
			});
		}
	});
};
