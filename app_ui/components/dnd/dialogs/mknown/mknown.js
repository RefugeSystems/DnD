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
		var associations = [],
			associated = {},
			data = {};

		data.meeting = this.details.meeting;
		data.fields = [
			this.universe.index.fields.name,
			this.universe.index.fields.icon,
			this.universe.index.fields.category,
			this.universe.index.fields.description,
			this.universe.index.fields.associations,
			this.universe.index.fields.acquired
		];

		associations = this.pruneAuto(data.meeting.entities, associated)
		.concat(this.pruneAuto(data.meeting.skirmishes, associated))
		.concat(this.pruneAuto(data.meeting.associations, associated));
		if(this.details.values) {
			associations.push.apply(associations, this.pruneAuto(this.details.values.associations, associated));
		}

		// associations = this.pruneAuto(data.meeting.associations, associated)
		// .concat(this.pruneAuto(data.meeting.skirmishes, associated))
		// .concat(this.pruneAuto(data.meeting.entities, associated));

		if(data.meeting.location && !associated[data.meeting.location]) {
			associations.push(data.meeting.location);
			associated[data.meeting.location] = true;
		}

		data.root = {
			"id": "knowledge:" + Date.now() + ":" + this.universe.time,
			"icon": "fa-solid fa-book-open-cover",
			"name": data.meeting.name,
			"description": data.meeting.description,
			"associations": associations,
			"category": "category:ideas:travel",
			"acquired": this.universe.time,
			"acquired_in": data.meeting.id
		};

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