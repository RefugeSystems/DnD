
/**
 *
 * TODO: Collate editing fields and subscribe in someway to ensure save captures
 * 		buffering fields.
 * @class rsForm
 * @constructor
 * @module Components
 * @param {Universe} universe
 * @param {Player} player
 * @param {Object} details
 * @param {Boolean} show_undefined
 * @param {Array} [fields]
 * @param {Object} [configuration]
 * @param {Object} [profile]
 */
(function() {
	rsSystem.component("rsForm", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageController,
			rsSystem.components.DialogController
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
			"details": {
				"required": true,
				"type": Object
			},
			"show_undefined": {
				"required": true,
				"type": Boolean
			},
			"fields": {
				"type": Array,
				"default": function() {
					return [];
				}
			},
			"configuration": {
				"type": Object,
				"default": function() {
					return {};
				}
			},
			"profile": {
				"type": Object,
				"default": function() {
					return {};
				}
			}
		},
		"computed": {

		},
		"watch": {

		},
		"data": function() {
			var data = {},
				x;

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
		},
		"methods": {
			"selectImage": function(event) {
				var input = $(this.$el).find("#attacher"),
					value;

				if(input && input.length && input[0].files.length) {
					value = {};
					this.encodeFile(input[0].files[0])
					.then((result) => {
						value.data = result.data;
						result.name = result.name.substring(0, result.name.lastIndexOf("."));
						value.id = "image:" + result.name.replace(/\./g, ":");
						value.name = result.name;
						Vue.set(this, "rawValue", JSON.stringify(value, null, 4));
						input[0].value = null;
					});
				}
			},
			"isVisible": function(field) {
				return !this.storage || !this.storage.fieldFilter || field.id.indexOf(this.storage.fieldFilter) !== -1;
			},
			"setTimeToNow": function(field) {
				Vue.set(this.details, field.id, this.universe.time);
			},
			"setDateToNow": function(field) {
				var now = new Date();
				now.setSeconds(0);
				now.setMilliseconds(0);
				Vue.set(this.details, field.id, now.getTime());
			},
			"fileAttach": function(event) {
				console.log("Drop: ", event);
			},
			"completed": function(event) {
				// console.log("Complete: ", event);
			},
			"clearData": function(field) {
				Vue.delete(this.details, field.id);
			},
			"noData": function(field) {
				Vue.set(this.details, field.id, null);
			},
			"clearField": function(field) {
				switch(field.type) {
					case "array":
						Vue.set(this.details, field.id, []);
						break;
					case "object":
						Vue.set(this.details, field.id, {});
						break;
					default:
						Vue.delete(this.details, field.id);
						break;
				}
			},
			"hasInheritance": function(field) {
				return field.inheritance && Object.keys(field.inheritance).length;
			}
		},
		"beforeDestroy": function() {
			/*
			this.universe.$off("universe:modified", this.universeUpdate);
			if(this.currentIndex) {
				this.currentIndex.$off("indexed", this.buildAvailableCopies);
			}
			*/
		},
		"template": Vue.templified("components/data/form.html")
	});
})();
