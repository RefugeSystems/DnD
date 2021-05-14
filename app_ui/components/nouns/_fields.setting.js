
(function() {
	
	var dataSource;
	
	dataSource = [{
		"label": "ID",
		"property": "id",
		"type": "text"
	}, {
		"label": "Name",
		"property": "name",
		"type": "text"
	}, {
		"label": "Value",
		"property": "value",
		"type": "textarea"
	}, {
		"label": "Description",
		"property": "description",
		"type": "textarea"
	}];
	
	rsSystem.component("NounFieldsSetting", {
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
			data.fields.setting = dataSource;

			return data;
		},
		"mounted": function() {
		},
		"methods": {
			"update": function() {
				
			}
		},
		"beforeDestroy": function() {
			
		}
	});
})();
