/**
 * 
 * @event player:create:object
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
 */
 
module.exports.initialize = function(universe) {
	universe.on("player:calculate:object", function(event) {
		var formula = event.message.data.formula,
			cbid = event.message.data.cbid,
			referenced = [],
			result;

		universe.getObject(event.message.data.id, function(err, object) {
			if(err) {
				universe.emit("send", {
					"type": "notice",
					"mid": "roll:object",
					"recipient": event.player.id,
					"message": "Error retrieving object: " + err.message,
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"error": err,
					"anchored": true
				});
			} else if(object && (event.player.gm || object.owned[event.player.id])) {
				result = universe.calculator.compute(formula, object, referenced);
				universe.emit("send", {
					"type": "computation",
					"recipient": event.player.id,
					"computed": result,
					"referenced": referenced,
					"callback_id": cbid
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "access:alert",
					"recipients": universe.getMasters(),
					"message": event.player.name + "(" + event.player.id + ") attempted calculation against " + event.message.data.id,
					"icon": "fas fa-sync fa-spin",
					"anchored": true
				});
			}
		});
	});

	universe.on("player:roll:object", function(event) {
		var formula = event.message.data.formula,
			cbid = event.message.data.cbid,
			referenced = [],
			dice = {},
			rolled;

		universe.getObject(event.message.data.id, function(err, object) {
			if(err) {
				universe.emit("send", {
					"type": "notice",
					"mid": "roll:object",
					"recipient": event.player.id,
					"message": "Error retrieving object: " + err.message,
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"error": err,
					"anchored": true
				});
			} else if(object && (event.player.gm || object.owned[event.player.id])) {
				universe.calculator.debug(true);
				rolled = universe.calculator.computedDiceRoll(formula, object, referenced, undefined, dice, event.message.data.advantage);
				universe.calculator.debug(false);
				// console.log("Roll[" + formula + "]: ", rolled);
				universe.emit("send", {
					"type": "roll",
					"recipient": event.player.id,
					"computed": rolled,
					"formula": formula,
					"referenced": referenced,
					"dice_rolls": dice,
					"callback_id": cbid
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "access:alert",
					"recipients": universe.getMasters(),
					"message": event.player.name + "(" + event.player.id + ") attempted roll against " + event.message.data.id,
					"icon": "fas fa-sync fa-spin",
					"anchored": true
				});
			}
		});
	});

	universe.on("player:reduce:object", function(event) {
		var formula = event.message.data.formula,
			cbid = event.message.data.cbid,
			referenced = [];

		universe.getObject(event.message.data.id, function(err, object) {
			if(err) {
				universe.emit("send", {
					"type": "notice",
					"mid": "reduce:object",
					"recipient": event.player.id,
					"message": "Error retrieving object: " + err.message,
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"error": err,
					"anchored": true
				});
			} else if(object && (event.player.gm || object.owned[event.player.id])) {
				universe.calculator.reduceDiceRoll(formula, object)
				.then(function(result) {
					console.log("reduce[" + formula + "]: ", result);
					universe.emit("send", {
						"type": "reduce",
						"recipient": event.player.id,
						"computed": result,
						"formula": formula,
						"referenced": referenced,
						"callback_id": cbid
					});
				})
				.catch(function(err) {
					universe.emit("send", {
						"type": "notice",
						"mid": "reduce:object",
						"recipient": event.player.id,
						"message": "Error calculating roll: " + err.message,
						"icon": "fas fa-exclamation-triangle rs-lightred",
						"error": err,
						"anchored": true
					});
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "access:alert",
					"recipients": universe.getMasters(),
					"message": event.player.name + "(" + event.player.id + ") attempted roll against " + event.message.data.id,
					"icon": "fas fa-sync fa-spin",
					"anchored": true
				});
			}
		});
	});
};
