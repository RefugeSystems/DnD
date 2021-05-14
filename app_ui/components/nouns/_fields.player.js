
(function() {

	var dataSource,
		entity;

	entity = {
		"label": "Entity",
		"property": "entity",
		"type": "select",
		"optionValue": "id",
		"optionLabel": "name"
	};

	dataSource = [{
		"label": "ID",
		"property": "id",
		"type": "text"
	}, {
		"label": "Username",
		"property": "username",
		"type": "text"
	}, {
		"label": "Name",
		"property": "name",
		"type": "text"
	}, {
		"label": "Passcode",
		"property": "passcode",
		"type": "text"
	}, {
		"label": "E-Mail",
		"property": "email",
		"type": "text"
	}, {
		"label": "Discord",
		"property": "linked_discord",
		"type": "text"
	},
	entity,
	{
		"label": "Master",
		"property": "master",
		"type": "checkbox"
	}, {
		"label": "Description",
		"property": "description",
		"type": "textarea"
	}, {
		"label": "Master Note",
		"property": "master_note",
		"type": "textarea"
	}];

	rsSystem.component("NounFieldsPlayer", {
		"inherit": true,
		"props": {
			"universe": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};
			data.fields = this.fields || {};
			data.fields.player = dataSource;

			return data;
		},
		"mounted": function() {
			// entity.options = this.universe.indexes.entity.listing;
			// entity.options.sortBy("name");
		},
		"methods": {
			"update": function() {

			}
		},
		"beforeDestroy": function() {

		}
	});
})();
