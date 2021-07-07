
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
		rsSystem.components.StorageController
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
					return meet;
				}
			}
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
		}
	},
	"data": function() {
		var data = {};

		data.name = "";
		data.description = "";
		data.id = "";

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
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
		/**
		 * Used to send the meeting description back to the server.
		 * 
		 * Additionally, when the active meeting changes, the current
		 * description is synced.
		 * 
		 * TODO: This is to be replaced by a `page` object for dynamic
		 * multi-client synced editing.
		 * @method syncDescription
		 * @param {String} meeting ID
		 * @param {String} description Text
		 */
		"syncDescription": function(meeting, name, description) {
			this.universe.send("meeting:details", {
				"name": name,
				"description": description
			});
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
