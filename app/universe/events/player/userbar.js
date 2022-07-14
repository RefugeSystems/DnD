
module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:userbar:create
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
	 * @param {String} event.message.data.character
	 * @param {Number} [event.message.data.length]
	 * @param {String} [event.message.data.name]
	 * @param {String} [event.message.data.icon]
	 * @param {String} [event.message.data.type]
	 */
	 universe.on("player:userbar:create", function(event) {
		var entity = event.message.data.character || event.message.data.entity,
			length = event.message.data.length || 12,
			name = event.message.data.name,
			icon = event.message.data.icon,
			type = event.message.data.type,
			bar;
	 
	 	if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(entity && (event.player.gm || entity.owned[event.player.id])) {
			if(!name) {
				name = entity.name + " Bar";
			}
			if(!icon) {
				icon = "fa-solid fa-candy-bar";
			}

			bar = {};
			bar.id = "userbar:" + entity.id + ":" + Date.now();
			bar.character = entity.id;
			bar.name = name;
			bar.icon = icon;
			bar.type = type;
			bar.userbar_actions = new Array(length);
			bar.userbar_actions.fill({});
			universe.createObject(bar, function(err, userbar) {
				if(err) {
					// TODO: Log Error
					console.error("Userbar Creation Failed: ", err);
				} else {
					entity.addValues({
						"userbars": userbar.id
					});
				}
			});
		}
	});

	/**
	 * 
	 * @event player:userbar:remove
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
	 * @param {String} event.message.data.character
	 * @param {String} event.message.data.bar
	 */
	 universe.on("player:userbar:remove", function(event) {
		var entity,
			bar;

		entity = universe.get(event.message.data.character);
		if(entity && (event.player.gm || entity.owned[event.player.id])) {
			
		}
	});

	/**
	 * 
	 * @event player:userbar:button
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
	 * @param {String} event.message.data.bar
	 * @param {String} event.message.data.object
	 * @param {Integer} event.message.data.index
	 * @param {String} [event.message.data.icon]
	 * @param {String} [event.message.data.channel]
	 * @param {String} [event.message.data.source]
	 * @param {String} [event.message.data.targets]
	 * @param {String} [event.message.data.name]
	 * @param {String} [event.message.data.title]
	 */
	 universe.on("player:userbar:button", function(event) {
		var object = event.message.data.object,
			index = event.message.data.index,

			channel = event.message.data.channel || event.message.data.use,
			targets = event.message.data.targets,
			source = event.message.data.source,
			name = event.message.data.name,
			icon = event.message.data.icon,

			actions,
			button,
			entity,
			bar;

		bar = universe.get(event.message.data.bar);
		entity = universe.get(bar.character);
		if(event.player.gm || (entity && entity.owned[event.player.id])) {
			actions = bar.userbar_actions;
			if(!actions) {
				actions = new Array(index < 12?12:index);
				actions.fill({});
			} else {
				while(actions.length < index) {
					actions.push({});
				}
			}
			button = actions[index];
			if(!button) {
				actions[index] = button = {};
			}
			if(object === null) {
				button.id = null;
				button.channel = null;
				button.targets = null;
				button.source = null;
				button.name = null;
				button.icon = null;
			} else if(object) {
				button.id = object;
				object = universe.get(object) || {};
				button.use = object.channel || channel;
				button.targets = object.targets || targets;
				button.source = object.source || source;
				button.name = object.name || name;
				button.icon = object.icon || icon;
			}
			bar.setValues({
				"userbar_actions": actions
			});
		}
	});

	/**
	 * 
	 * @event player:userbar:channel
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
	 * @param {String} event.message.data.bar
	 * @param {String} event.message.data.object
	 * @param {Integer} event.message.data.index
	 */
	 universe.on("player:userbar:channel", function(event) {
		
	});

	/**
	 * 
	 * @event player:userbar:channel
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
	 * @param {String} event.message.data.bar
	 * @param {String} event.message.data.level
	 * @param {Integer} event.message.data.index
	 */
	 universe.on("player:userbar:level", function(event) {
		var index = event.message.data.index,
			level = event.message.data.level,
			actions,
			button,
			entity,
			bar;

		bar = universe.get(event.message.data.bar);
		entity = universe.get(bar.character);
		if(event.player.gm || (entity && entity.owned[event.player.id])) {
			actions = bar.userbar_actions;
			if(!actions) {
				actions = new Array(index < 12?12:index);
				actions.fill({});
			} else {
				while(actions.length < index) {
					actions.push({});
				}
			}
			button = actions[index];
			if(button && button.id) {
				button.level = level;
				bar.setValues({
					"userbar_actions": actions
				});
			}
		}
	});


};
