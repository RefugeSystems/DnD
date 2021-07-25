
/**
 *
 *
 * @class dndMasterMeeting
 * @constructor
 * @module Components
 */
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
		"renderedDate": function() {
			return this.universe.calendar.toDisplay();
		},
		"meetings": function() {
			var meetings = [],
				meet,
				i;
			
			for(i=0; i<this.universe.listing.meeting.length; i++) {
				meet = this.universe.listing.meeting[i];
				if(meet && !meet.disabled && !meet.is_preview) {
					meetings.push(meet);
				}
			}

			return meetings;
		},
		"active": function() {
			var meet,
				i;

			for(i=0; i<this.universe.listing.meeting.length; i++) {
				meet = this.universe.listing.meeting[i];
				if(meet.is_active && !meet.disabled && !meet.is_preview) {
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
			this.syncDescription(oldValue, this.description);
			Vue.set(this, "description", this.active.description);
			Vue.set(this, "id", this.active.id);
		},
		"id": function(newValue, oldValue) {
			if(newValue && newValue !== this.active.id) {
				// this.universe.send
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

		data.editName = false;
		data.name = "";
		data.description = "";
		data.id = "";

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"createNextMeeting": function() {
			var create = {};
			if(this.active) {
				create.previous = this.active.id;
			}
			console.warn("Create Next Meeting: ", create);
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
						console.log("Leveling: ", this.active.entities);
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
						console.log("Leveling: ", entities);
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
						console.log("Leveling: ", entities);
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
						console.log("Leveling: ", entities);
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
		"syncDescription": function() {
			if(this.active) {
				this.universe.send("meeting:details", {
					"meeting": this.active.id,
					"name": this.name,
					"description": this.description
				});
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/meeting.html")
});
