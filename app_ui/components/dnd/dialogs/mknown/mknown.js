/**
 * 
 * @class dndMeetingKnowledge
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {UIProfile} profile
 */
rsSystem.component("dndMeetingKnowledge", {
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
			this.universe.index.fields.category,
			this.universe.index.fields.description,
			this.universe.index.fields.associations,
			this.universe.index.fields.acquired
		];
		data.root = {
			"id": "knowledge:" + Date.now() + ":" + this.universe.time,
			"icon": "fa-solid fa-graduation-cap",
			"name": data.meeting.name,
			"description": data.meeting.description,
			"associations": data.meeting.associations?data.meeting.associations.concat([]):[],
			"category": "category:ideas:travel",
			"acquired": this.universe.time,
			"acquired_in": data.meeting.id
		};

		if(data.meeting.location) {
			data.root.associations.push(data.meeting.location);
		}
		if(data.meeting.entities && data.meeting.entities.length) {
			data.root.associations = data.root.associations.concat(data.meeting.entities);
		}
		if(data.meeting.skirmishes && data.meeting.skirmishes.length) {
			data.root.associations = data.root.associations.concat(data.meeting.skirmishes);
		}
		if(data.meeting.session_events && data.meeting.session_events.length) {
			data.root.associations = data.root.associations.concat(data.meeting.session_events);
		}
		if(data.meeting.items && data.meeting.items.length) {
			data.root.associations = data.root.associations.concat(data.meeting.items);
		}

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"sendUpdate": function() {
			// Loop through and update
			this.universe.send("meeting:knowledge", {
				"meeting": this.meeting.id,
				"knowledge": this.root
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
	"template": Vue.templified("components/dnd/dialogs/mknown.html")
});