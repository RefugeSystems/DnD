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
 * @param {Object} event.message.entity 
 * @param {Object} event.message.target 
 * @param {Object} event.message.amount 
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
					target.setValues({
						"gold": parseInt(target.gold) + amount
					});
				} else {
					// TODO: Warning
				}
			} else if(entity) {
				if(entity.owned[event.player.id]) {
					if(amount <= entity.gold) {
						entity.setValues({
							"gold": parseInt(entity.gold) - amount
						});
						target.setValues({
							"gold": parseInt(target.gold) + amount
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
