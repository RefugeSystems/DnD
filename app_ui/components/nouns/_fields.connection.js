
(function() {

	var dataSource,
		parent,
		start,
		end;

	parent = {
		"label": "Parent",
		"property": "parent",
		"type": "select",
		"optionValue": "id",
		"optionLabel": "name"
	};

	start = {
		"label": "Start",
		"property": "start",
		"type": "select",
		"optionValue": "id",
		"optionLabel": "name"
	};

	end = {
		"label": "End",
		"property": "end",
		"type": "select",
		"optionValue": "id",
		"optionLabel": "name"
	};

	dataSource = [{
		"label": "ID",
		"property": "id",
		"type": "text"
	},
	parent,
	{
		"label": "Name",
		"property": "name",
		"type": "text"
	}, {
		"label": "Icon",
		"property": "icon",
		"type": "text"
	},
	start,
	end,
	{
		"label": "Contribution Value",
		"property": "contribution_value",
		"type": "number"
	}, {
		"label": "Description",
		"property": "description",
		"type": "textarea"
	}];

	rsSystem.component("NounFieldsConnection", {
		"inherit": true,
		"props": {},
		"data": function() {
			var data = {};

			data.fields = this.fields || {};
			data.fields.connection = dataSource;

			return data;
		},
		"mounted": function() {
			parent.options = this.universe.indexes.connection.listing;
			parent.options.sortBy("name");

			start.options = end.options = this.universe.indexes.node.listing;
			start.options.sortBy("name");
		},
		"methods": {
			"update": function() {

			}
		},
		"beforeDestroy": function() {

		}
	});
})();
