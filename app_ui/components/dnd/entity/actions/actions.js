
/**
 *
 *
 * @class dndEntityActions
 * @constructor
 * @module Components
 */
(function() {
	var actions = {
		"main": {
			"name": "Main",
			"title": "Main",
			"icon": "game-icon game-icon-throwing-ball"
		},
		"bonus": {
			"name": "Bonus",
			"title": "Bonus",
			"icon": "game-icon game-icon-diving-dagger"
		},
		"movement": {
			"name": "Move",
			"title": "Movement",
			"icon": "fa-solid fa-person-walking"
		},
		"reaction": {
			"name": "React",
			"title": "Reaction",
			"icon": "game-icon game-icon-shield-reflect"
		}
	};

	rsSystem.component("dndEntityActions", {
		"inherit": true,
		"mixins": [
			rsSystem.components.DNDCombatUtility,
			rsSystem.components.DNDWidgetCore
		],
		"props": {
			"entity": {
				"requried": true,
				"type": Object
			},
			"profile": {
				"type": Object,
				"default": function() {
					return {};
				}
			}
		},
		"computed": {
			"attackIcon": function() {
				var loading;
				if(this.entity) {
					if((loading = this.universe.getObject(this.entity.main_weapon)) && loading.icon) {
						return loading.icon;
					} else if(this.entity.spells.length) {
						return "game-icon game-icon-magic-swirl";
					}
				}
				return "game-icon game-icon-punch";
			},
			"isVisible": function() {
				return true;
				
				var skirmish,
					i;

				if(this.entity.hp <= 0) {
					return false;
				}

				if(this.widget.attribute && this.widget.attribute.show_non_combat) {
					return true;
				}
				
				for(i=0; i<this.universe.listing.skirmish.length; i++) {
					skirmish = this.universe.listing.skirmish[i];
					if(rsSystem.utility.isValid(skirmish) && (skirmish.active || skirmish.is_active)) {
						return true;
					}
				}
				return false;
			},
			"events": function() {
				var events = [],
					event,
					keys,
					i;
				if(this.entity.active_events) {
					keys = Object.keys(this.entity.active_events);
					for(i=0; i<keys.length; i++) {
						event = this.entity.active_events[keys[i]];
						if(event && !event.ongoing) {
							events.push(event);
						}
					}
					events.sort(this.sortByTime);
				}
				return events;
			},
			"ongoing": function() {
				var events = [],
					event,
					keys,
					i;
				if(this.entity.active_events) {
					keys = Object.keys(this.entity.active_events);
					for(i=0; i<keys.length; i++) {
						event = this.entity.active_events[keys[i]];
						if(event && event.ongoing) {
							switch(event.type) {
								case "timer":
									if(event.id && !this.timers[event.id]) {
										this.startTimer(event);
									}
									break;
								default:
									if(!event.name) {
										event.name = event.id;
									}
							}
							events.push(event);
						}
					}
					events.sort(this.sortByTime);
				}
				return events;
			}
		},
		"data": function() {
			var data = {};

			data.timers = {};
			if(this.entity.action_max) {
				data.actions = Object.keys(this.entity.action_max);
			} else {
				data.actions = [];
			}

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
		},
		"methods": {
			"timerEventDisplay": function(event) {
				var buffer;
				if(event.countdown) {
					buffer = Math.ceil((event.timer_mark - Date.now())/1000);
					if(buffer <= 0) {
						event.timer_finished = true;
						event.icon = "fa-duotone fa-hourglass-end";
						return "( Complete )";
					} else {
						return this.universe.calendar.displayDuration(buffer);
					}
				} else {
					return this.universe.calendar.displayDuration(Date.now() - event.timer_mark);
				}
			},
			"startTimer": function(event) {
				if(event && event.id && !this.timers[event.id]) {
					Vue.set(event, "name", this.timerEventDisplay(event));
					this.timers[event.id] = () => {
						Vue.set(event, "name", this.timerEventDisplay(event));
						if(!event.timer_finished) {
							setTimeout(this.timers[event.id], 500);
						}
					};
					this.timers[event.id]();
				}
			},
			"setActionBar": function() {
				rsSystem.EventBus.$emit("entity:bar", this.entity);
			},
			"actionTitle": function(action) {
				if(actions[action]) {
					return actions[action].title;
				}
			},
			"actionIcon": function(action) {
				if(actions[action]) {
					return actions[action].icon;
				}
			},
			"actionName": function(action) {
				if(actions[action] && (this.widget.attribute.show_names || (this.storage && this.storage.show_names) || (this.configuration && this.configuration.show_names))) {
					return actions[action].name || actions[action].title;
				}
			}
		},
		"beforeDestroy": function() {
			/*
			this.universe.$off("universe:modified", this.update);
			rsSystem.EventBus.$off("key:escape", this.closeInfo);
			*/
		},
		"template": Vue.templified("components/dnd/entity/actions.html")
	});
})();
