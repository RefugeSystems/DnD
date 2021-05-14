
(function() {

	var dataSource,
		parent,
		nodes;

	parent = {
		"label": "Parent",
		"property": "parent",
		"type": "select",
		"optionValue": "id",
		"optionLabel": "name"
	};

	nodes = {
		"label": "Nodes",
		"property": "node",
		"type": "multireference",
		"optionValue": "id",
		"optionLabel": "name",
		"autocomplete": true
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
	nodes,
	{
		"label": "Description",
		"property": "description",
		"type": "textarea"
	}];

	rsSystem.component("NounFieldsConstruct", {
		"inherit": true,
		"props": {},
		"data": function() {
			var data = {};

			data.fields = this.fields || {};
			data.fields.construct = dataSource;

			return data;
		},
		"mounted": function() {
			parent.options = this.universe.indexes.construct.listing;
			parent.options.sortBy("name");

			nodes.source_index = this.universe.indexes.node;
		},
		"methods": {
			"update": function() {

			}
		},
		"beforeDestroy": function() {

		}
	});
})();
