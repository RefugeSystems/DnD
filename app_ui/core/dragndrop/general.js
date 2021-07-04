rsSystem.dragndrop = rsSystem.dragndrop || {};

rsSystem.dragndrop.general = (function() {
	var dragging = null,
		build = {};


	build.drag = function(data) {
		dragging = data;
	};

	build.drop = function() {
		var data = dragging;
		dragging = null;
		return data;
	};
	
	return build;
})();
