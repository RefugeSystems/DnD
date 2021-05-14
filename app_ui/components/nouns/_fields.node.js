
(function() {

	var dataSource,
		images,
		parent,
		types;

	parent = {
		"label": "Parent",
		"property": "parent",
		"type": "select",
		"optionValue": "id",
		"optionLabel": "name"
	};

	images = {
		"label": "Images",
		"property": "image",
		"type": "multireference",
		"optionValue": "id",
		"optionLabel": "name",
		"autocomplete": true
	};

	types = {
		"label": "Type",
		"property": "type",
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
	}, {
		"label": "Business Value",
		"property": "business_value",
		"type": "number"
	}, {
		"label": "Importance",
		"property": "importance",
		"type": "number"
	},
	types,
	{
		"label": "Points",
		"property": "points",
		"type": "number",
		"condition": {
			"type": "type:story"
		}
	},
	images,
	{
		"label": "Description",
		"property": "description",
		"type": "textarea"
	}];

	rsSystem.component("NounFieldsNode", {
		"inherit": true,
		"props": {},
		"data": function() {
			var data = {};

			data.fields = this.fields || {};
			data.fields.node = dataSource;

			return data;
		},
		"mounted": function() {
			parent.options = this.universe.indexes.node.listing;
			parent.options.sortBy("name");
			types.options = this.universe.indexes.type.listing;
			types.options.sortBy("name");

			images.source_index = this.universe.indexes.image;
		},
		"methods": {
			"update": function() {

			}
		},
		"beforeDestroy": function() {

		}
	});
})();
