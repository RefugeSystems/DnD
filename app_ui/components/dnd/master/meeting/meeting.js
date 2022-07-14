
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
			},
			"active": function() {
				var meet,
					i;

				for(i=0; i<this.universe.listing.meeting.length; i++) {
					meet = this.universe.listing.meeting[i];
					if(meet.is_active && !meet.disabled && !meet.is_preview) {
						Vue.set(this, "description", meet.description || "");
						Vue.set(this, "weather", meet.weather || "");
						Vue.set(this, "type", meet.type || "");
						if(!meet.name) {
							Vue.set(this, "editName", true);
						} else {
							Vue.set(this, "editName", false);
							Vue.set(this, "name", "");
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
				console.log("New Weather: ", newValue, oldValue);
				if(newValue) {
					this.universe.send("meeting:weather", {
						"meeting": this.active.id,
						"weather": newValue
					});
				}
			},
			"type": function(newValue, oldValue) {
				console.log("New Type: ", newValue, oldValue);
				if(newValue) {
					this.universe.send("meeting:type", {
						"meeting": this.active.id,
						"encounter": newValue
					});
				}
			},
			"id": function(newValue, oldValue) {
				console.log("New ID: ", newValue, oldValue);
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
			}
		},
		"data": function() {
			var data = {};

			data.renderedDate = this.universe.calendar.toDisplay();
			data.editName = false;
			data.name = "";
			data.description = this.active?this.active.description:"";
			data.id = this.active?this.active.id:"";
			data.weather = "";
			data.type = "";

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
			this.universe.$on("time:changed", this.updateTime);
		},
		"methods": {
			"createNextMeeting": function() {
				this.universe.send("meeting:generate", {
					"meeting": this.active.id
				});
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
			/**
			 * 
			 * @method toggleTimeLock
			 */
			"toggleTimeLock": function() {
				Vue.set(this.storage, "timeLocked", !this.storage.timeLocked);
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
								if(entity.played_by && (player = this.universe.index.player[entity.played_by]) && !player.gm) {
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
			"syncDescription": function(meeting, description) {
				if(meeting) {
					this.universe.send("meeting:details", {
						"meeting": meeting,
						"description": description
					});
				} else if(this.active) {
					this.universe.send("meeting:details", {
						"meeting": this.active.id,
						"name": this.name,
						"description": this.description
					});
				}
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
