/**
 * 
 * @class dndMeetingEvent
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {UIProfile} profile
 */
rsSystem.component("dndMeetingEvent", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
	},
	"data": function () {
		var data = {};

		data.meeting = this.details.meeting;
		data.fields = [
			this.universe.index.fields.name,
			this.universe.index.fields.icon,
			this.universe.index.fields.description,
			this.universe.index.fields.time,
			this.universe.index.fields.time_start,
			this.universe.index.fields.time_end,
			this.universe.index.fields.location,
			this.universe.index.fields.meeting,
			this.universe.index.fields.acquired_in,
			this.universe.index.fields.category,
			this.universe.index.fields.associations
		];
		data.root = {
			"id": "event:" + Date.now() + ":" + this.universe.time,
			"name": this.details.values.name || "",
			"icon": this.details.values.icon || "fa-solid fa-newspaper",
			"description": this.details.values.description || data.meeting.description,
			"time": this.universe.time,
			"time_start": this.universe.time,
			"location": this.details.values.location || data.meeting.location,
			"category": this.details.values.category || this.universe.index.category["category:ideas:travels"]?"category:ideas:travels":undefined,
			"associations": this.details.values.associations || data.meeting.associations?data.meeting.associations.concat([]):[],
			"acquired_in": data.meeting.id,
			"meeting": data.meeting.id
		};
		
		if(!this.details.values.associations && data.meeting.location) {
			data.root.associations.push(data.meeting.location);
		}
		if(!this.details.values.associations && data.meeting.entities && data.meeting.entities.length) {
			data.root.associations = data.root.associations.concat(data.meeting.entities);
		}

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"sendUpdate": function() {
			// Loop through and update

			this.universe.send("meeting:event", {
				"meeting": this.meeting.id,
				"event": this.root
			});
			
			this.closeDialog();
		}
	},
	"beforeDestroy": function () {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/mevent.html")
});