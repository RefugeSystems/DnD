/**
 *
 *
 * @class dndMasterMeeting
 * @constructor
 * @module Components
 */
(function() {
	// TODO: Move to a time component for reusability
	var second = 1000,
		minute = 60 * second,
		hour = 60 * minute,
		day = 24 * hour,
		week = 7 * day;

	rsSystem.component("dndMasterMeeting", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageController,
			rsSystem.components.DNDCore
		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			},
			"player": {
				"required": true,
				"type": Object
			},
			"profile": {
				"required": true,
				"type": Object
			},
			"configuration": {
				"required": true,
				"type": Object
			}
		},
		"computed": {
			"meetings": function() {
				var mark = Date.now() - 2 * week,
					meetings = [],
					meet,
					i;
				
				for(i=0; i<this.universe.listing.meeting.length; i++) {
					meet = this.universe.listing.meeting[i];
					if(meet && !meet.is_preview && !meet.disabled && mark < meet.date) {
						meetings.push(meet);
					}
				}

				return meetings;
			},
			"weathers": function() {
				var weathers = [],
					weather,
					i;
				
				for(i=0; i<this.universe.listing.weather.length; i++) {
					weather = this.universe.listing.weather[i];
					if(rsSystem.utility.isValid(weather)) {
						weathers.push(weather);
					}
				}

				return weathers;
			},
			"types": function() {
				/*
				var types = [],
					type,
					i;
				
				for(i=0; i<this.universe.listing.type.length; i++) {
					type = this.universe.listing.type[i];
					if(rsSystem.utility.isValid(type)) {
						types.push(type);
					}
				}
				
				return types;
				*/
				var types = ["type:navigating", "type:travel", "type:town", "type:combat", "type:combat:town", "type:combat:boss", "type:combat:epic", "type:investigation", "type:investigation:town", "type:investigation:risky"];
				if(this.active && types.indexOf(this.active.type) === -1) {
					types.unshift(this.active.type);
				}
				return this.universe.transcribeInto(types);
			},
			"active": function() {
				var meet,
					i;

				for(i=0; i<this.universe.listing.meeting.length; i++) {
					meet = this.universe.listing.meeting[i];
					if(meet.is_active && !meet.disabled && !meet.is_preview) {
						Vue.set(this, "description", meet.description || "");
						Vue.set(this, "weather", meet.weather || "");
						Vue.set(this, "location", meet.location);
						Vue.set(this, "note", meet.note || "");
						Vue.set(this, "type", meet.type || "");
						if(meet.name) {
							Vue.set(this, "editName", false);
							Vue.set(this, "name", "");
						} else {
							Vue.set(this, "editName", true);
						}
						return meet;
					}
				}
				
				return null;
			},
			"skirmish": function() {
				var skirmish,
					i;

				for(i=0; i<this.universe.listing.skirmish.length; i++) {
					skirmish = this.universe.listing.skirmish[i];
					if(skirmish.is_active && !skirmish.disabled && !skirmish.is_preview) {
						return skirmish;
					}
				}

				return null;
			},
			"locality": function() {
				if(this.storage && this.storage.all_locations) {
					return this.universe.listing.location;
				}

				var places = [],
					added = {},
					current,
					location,
					entity,
					id,
					i;

				if(current = this.universe.get(this.location)) {
					places.push(current);
					places.push("-- [Nearby Locations] --");
					// Parent
					if(current.location && (location = this.universe.get(current.location))) {
						places.push(location);
					}
					// Available Transitions
					for(i=0; i<this.universe.listing.location.length; i++) {
						location = this.universe.listing.location[i];
						if(location && (location.location === current.id || (current.location && location.location === current.location)) && location.id !== current.id) {
							if(location.links_to) {
								added[location.links_to] = true;
								if(location = this.universe.get(location.links_to)) {
									places.push(location);
								}
							} else {
								added[location.id] = true;
								places.push(location);
							}
						}
					}
				}

				// Meeting Relevent Specified Locations
				places.push("-- [Meeting Locations] --");
				if(this.active && this.active.locations) {
					for(i=0; i<this.active.locations.length; i++) {
						id = this.active.locations[i];
						if(id !== current.id && !added[id] && (location = this.universe.get(id))) {
							places.push(location);
						}
					}
				}

				places.push("-- [Active Entities] --");
				if(this.skirmish) {
					if(this.skirmish.entities) {
						for(i=0; i<this.skirmish.entities.length; i++) {
							if(entity = this.universe.get(this.skirmish.entities[i])) {
								added[entity.id] = true;
								places.push(entity);
							}
						}
					}
				} else if(this.active && this.active.entities && this.active.entities.length) {
					for(i=0; i<this.active.entities.length; i++) {
						if(entity = this.universe.get(this.active.entities[i])) {
							added[entity.id] = true;
							places.push(entity);
						}
					}
				}

				
				places.push("-- [Location Entities] --");
				if(this.location) {
					for(i=0; i<this.universe.listing.entity.length; i++) {
						entity = this.universe.listing.entity[i];
						if(entity && entity.location === this.location.id && !added[entity.id]) {
							added[entity.id] = true;
							places.push(entity);
						}
					}
				}

				return places;
			},
			"entities": function() {
				if(this.active && this.active.entities) {
					return this.universe.transcribeInto(this.active.entities, [], "entity");
				}
				return [];
			}
		},
		"watch": {
			"active.id": function(newValue, oldValue) {
				console.log("Sync Active");
				// this.syncDescription(oldValue, this.description);
				// Vue.set(this, "description", this.active.description);
				if(newValue) {
					Vue.set(this, "id", newValue);
				}
			},
			"weather": function(newValue, oldValue) {
				if(newValue) {
					this.universe.send("meeting:weather", {
						"meeting": this.active.id,
						"weather": newValue
					});
				}
			},
			"location": function(newValue, oldValue) {
				if(newValue) {
					this.universe.send("meeting:location", {
						"meeting": this.active.id,
						"location": newValue
					});
				}
			},
			"type": function(newValue, oldValue) {
				if(newValue) {
					this.universe.send("meeting:type", {
						"meeting": this.active.id,
						"encounter": newValue
					});
				}
			},
			"id": function(newValue, oldValue) {
				if(newValue && (!this.active || newValue !== this.active.id)) {
					this.universe.send("meeting:activate", {
						"meeting": newValue
					});
				}
			},
			"name": function(text) {
				this.syncDescription();
			},
			"description": function(text) {
				this.syncDescription();
			},
			"note": function(text) {
				this.syncDescription();
			}
		},
		"data": function() {
			var data = {};

			data.renderedDate = this.universe.calendar.toDisplay();
			data.editName = false;
			data.name = "";
			data.description = this.active?this.active.description:"";
			data.note = this.active?this.active.note:"";
			data.id = this.active?this.active.id:"";
			data.weather = "";
			data.type = "";
			data.activeTimer = null;
			data.timer = {};
			data.location = null;

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
			this.universe.$on("time:changed", this.updateTime);
		},
		"methods": {
			"exitEntity": function() {
				var entity,
					i;
				if(this.active && this.active.entities) {
					for(i=0; i<this.active.entities.length; i++) {
						entity = this.universe.get(this.active.entities[i]);
						if(entity && !rsSystem.utility.isEmpty(entity.owned)) {
							this.universe.send("master:quick:set", {
								"object": entity.id,
								"field": "inside",
								"value": null
							});
						}
					}
				}
			},
			"toggleLocales": function() {
				Vue.set(this.storage, "all_locations", !this.storage.all_locations);
			},
			"selectTimer": function() {
				var details = {},
					action,
					types,
					i,
					j;

				details.title = "Select Timer Duration";
				details.component = "dndDialogList";
				details.sections = ["timers"];
				details.clear = true;
				details.related = {};
				details.cards = {};
				details.data = {
					"timers": []
				};

				details.activate = (section, timer) => {
					timer = Object.assign({}, timer);
					timer.id = Random.identifier("timer");
					timer.entities = this.active.entities;
					timer.meeting = this.active.id;
					timer.is_active = true;
					Vue.set(this.timer, timer.id, timer.entities);
					Vue.set(this, "activeTimer", timer.id);
					this.universe.send("meeting:timer", timer);
					this.closeDialog();
				};

				// details.classing = (section, action) => {
				// 	return "fa-duotone fa-hourglass";
				// };

				// details.note = (section, action) => {
				// 	return "<span>Note</span>";
				// };

				details.cards.timers = {
					"name": "Durations",
					"icon": "fa-solid fa-hourglass-clock",
					"description": "Select timer duration"
				};
				details.data.timers = [{
					"id": "duration:1",
					"icon": "fa-solid fa-hourglass",
					"name": "1 Minute",
					"description": "",
					"duration": 60000,
					"_search": "1 minute 1minute"
				}, {
					"id": "duration:2",
					"icon": "fa-solid fa-hourglass",
					"name": "2 Minutes",
					"description": "",
					"duration": 120000
				}, {
					"id": "duration:3",
					"icon": "fa-solid fa-hourglass",
					"name": "3 Minutes",
					"description": "",
					"duration": 180000
				}, {
					"id": "duration:4",
					"icon": "fa-solid fa-hourglass",
					"name": "4 Minutes",
					"description": "",
					"duration": 240000
				}, {
					"id": "duration:5",
					"icon": "fa-solid fa-hourglass",
					"name": "5 Minutes",
					"description": "",
					"duration": 300000
				}, {
					"id": "duration:10",
					"icon": "fa-solid fa-hourglass",
					"name": "10 Minutes",
					"description": "",
					"duration": 600000
				}, {
					"id": "duration:15",
					"icon": "fa-solid fa-hourglass",
					"name": "15 Minutes",
					"description": "",
					"duration": 900000
				}, {
					"id": "duration:20",
					"icon": "fa-solid fa-hourglass",
					"name": "20 Minutes",
					"description": "",
					"duration": 1200000
				}];

				rsSystem.EventBus.$emit("dialog-open", details);
			},
			"endTimer": function() {
				if(this.activeTimer) {
					var timer = {};
					timer.entities = this.timer[timer.id];
					timer.meeting = this.active.id;
					timer.id = this.activeTimer;
					this.universe.send("meeting:untime", timer);
					Vue.set(this, "activeTimer", null);
					Vue.delete(this.timer, timer.id);
				}
			},
			"createNextMeeting": function() {
				this.universe.send("meeting:generate", {
					"meeting": this.active.id
				});
			},
			"createKnowledge": function() {
				console.log("Create Knowledge");
				var details = {
					"component": "dndMeetingKnowledge",
					"storageKey": "master",
					"id": "dndMeetingOption",
					"meeting": this.active,
					"max_size": true
				};
				rsSystem.EventBus.$emit("dialog-open", details);
			},
			"createEvent": function() {
				console.log("Create Event");
				var details = {
					"component": "dndMeetingEvent",
					"storageKey": "master",
					"id": "dndMeetingOption",
					"meeting": this.active,
					"max_size": true
				};
				rsSystem.EventBus.$emit("dialog-open", details);
			},
			"toggleNameEdit": function() {
				Vue.set(this, "editName", !this.editName);
				if(this.editName && this.active && this.active.name) {
					Vue.set(this, "name", this.active.name);
				}
			},

			"startSkirmish": function() {
				if(this.active && !this.skirmish) {
					this.universe.send("meeting:combat", {
						"meeting": this.active.id
					});
				}
			},

			"nextTurmSkirmish": function() {
				if(this.skirmish) {
					this.universe.send("skimish:turn:next", {
						"skirmish": this.skirmish.id
					});
				}
			},

			"finishSkirmish": function() {
				if(this.skirmish) {
					this.universe.send("skirmish:finish", {
						"skirmish": this.skirmish.id
					});
				}
			},
			"openCalendar": function() {
				rsSystem.EventBus.$emit("dialog-open", {
					"component": "rsCalendarDialog",
					"calendar": this.universe.calendar,
					"entity": this.$route.query.entity?this.universe.get(this.$route.query.entity):undefined,
					"time": this.universe.time
				});
			},
			/**
			 * 
			 * @method toggleTimeLock
			 */
			"toggleTimeLock": function() {
				Vue.set(this.storage, "timeLocked", !this.storage.timeLocked);
			},
			/**
			 * 
			 * @method broadcastThinking
			 */
			"broadcastThinking": function() {
				this.universe.send("master:thinking", {});
			},
			/**
			 * 
			 * @method forwardTime
			 * @param {Integer} increment Seconds to go forward in time
			 */
			"forwardTime": function(increment) {
				this.universe.send("time:forward", {
					"increment": increment
				});
			},
			/**
			 * Set the exact start time for the meeting.
			 * @method setStartDate
			 */
			"setStartDate": function() {

			},
			/**
			 * Move the current universe time to the meeting's start time
			 * @method timeToMeeting
			 */
			"timeToMeeting": function() {

			},
			/**
			 * Set the Game Time start for the active meeting
			 * @method setStartTime
			 */
			"setStartTime": function() {

			},
			/**
			 * Set the Game Time end for the active meeting
			 * @method setStartTime
			 */
			"setEndTime": function() {

			},
			/**
			 * Create a new meeting
			 * @method setStartTime
			 */
			"newMeeting": function() {

			},

			"levelUp": function(amount) {
				rsSystem.EventBus.$emit("dialog-open", {
					"component": "systemDialogBasic",
					"title": "Level Up Entities",
					"messages": ["Select which entities should gain a level or close to cancel."],
					"buttons": [{
						"classes": "fas fa-users",
						"text": "All",
						"action": () => {
							this.universe.send("points:give", {
								"entities": this.active.entities,
								"type": "level",
								"amount": amount
							});
							this.closeDialog();
						}
					}, {
						"classes": "fas fa-users-crown",
						"text": "Players",
						"action": () => {
							var entities = [],
								player,
								entity,
								i;
							for(i=0; i<this.active.entities.length; i++) {
								entity = this.universe.index.entity[this.active.entities[i]];
								if(entity.played_by && (player = this.universe.index.player[entity.played_by])) {
									entities.push(entity.id);
								}
							}
							this.universe.send("points:give", {
								"entities": entities,
								"type": "level",
								"amount": amount
							});
							this.closeDialog();
						}
					}, {
						"classes": "fas fa-users-cog",
						"text": "NPCs",
						"action": () => {
							var entities = [],
								entity,
								i;
							for(i=0; i<this.active.entities.length; i++) {
								entity = this.universe.index.entity[this.active.entities[i]];
								if(entity.is_npc) {
									entities.push(entity.id);
								}
							}
							this.universe.send("points:give", {
								"entities": entities,
								"type": "level",
								"amount": amount
							});
							this.closeDialog();
						}
					}, {
						"classes": "fal fa-crosshairs",
						"text": "Hostile",
						"action": () => {
							var entities = [],
								entity,
								i;
							for(i=0; i<this.active.entities.length; i++) {
								entity = this.universe.index.entity[this.active.entities[i]];
								if(entity.is_hostile) {
									entities.push(entity.id);
								}
							}
							this.universe.send("points:give", {
								"entities": entities,
								"type": "level",
								"amount": amount
							});
							this.closeDialog();
						}
					}]
				});
			},
			/**
			 * Used to send the meeting description back to the server.
			 * 
			 * Additionally, when the active meeting changes, the current
			 * description is synced.
			 * 
			 * TODO: This is to be replaced by a `page` object for dynamic
			 * multi-client synced editing.
			 * @method syncDescription
			 */
			"syncDescription": function(meeting, description, note) {
				var send = {};
				if(meeting) {
					send.meeting = meeting;
					send.description = description;
					send.note = note;
				} else if(this.active) {
					send.meeting = this.active.id;
					send.description = this.description;
					send.name = this.name;
					send.note = this.note;
				}
				this.universe.send("meeting:details", send);
			},
			"setTimeTo": function(time) {
				this.universe.send("time:to", {
					"time": parseInt(time),
					"lock": this.storage.timeLocked
				});
			},
			"toggleTimeStamp": function() {
				Vue.set(this.storage, "show_time", !this.storage.show_time);
			},
			"updateTime": function(event) {
				Vue.set(this, "renderedDate", this.universe.calendar.toDisplay());
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("time:changed", this.updateTime);
			/*
			this.universe.$off("universe:modified", this.update);
			rsSystem.EventBus.$off("key:escape", this.closeInfo);
			*/
		},
		"template": Vue.templified("components/dnd/master/meeting.html")
	});
})();
