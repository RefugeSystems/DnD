
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
		"label": "URL Based",
		"property": "linked",
		"type": "checkbox"
	}, {
		"label": "Delayed",
		"property": "delay_data",
		"knowledge": "knowledge:image:delay",
		"type": "checkbox",
		"condition": {
			"linked": {
				"operation": "!"
			}
		}
	}, {
		"label": "URL",
		"property": "url",
		"knowledge": "knowledge:image:url",
		"type": "text",
		"condition": {
			"linked": {
				"operation": "exists"
			}
		}
	}, {
		"label": "Data",
		"property": "data",
		"knowledge": "knowledge:image:data",
		"type": "file",
		"accept": "image/*",
		"condition": {
			"linked": {
				"operation": "!"
			}
		}
	}, {
		"label": "Description",
		"property": "description",
		"type": "textarea"
	}, {
		"label": "Master Note",
		"property": "master_note",
		"type": "textarea"
	}];
	
	rsSystem.component("NounFieldsImage", {
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
			data.fields.image = dataSource;
			
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
