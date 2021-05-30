rsSystem.manipulateQuery = function(manipulate) {
	var query = Object.assign({}, rsSystem.Router.currentRoute.query),
		keys = Object.keys(manipulate),
		string = "?",
		i,
		j;
	
	for(i=0; i<keys.length; i++) {
		if(manipulate[keys[i]] === null) {
			delete(query[keys[i]]);
		} else {
			query[keys[i]] = manipulate[keys[i]];
		}
	}
	
	keys = Object.keys(query);
	if(keys.length) {
		string += keys[0] + "=" + query[keys[0]];
		for(i=1; i<keys.length; i++) {
			string += "&" + keys[i] + "=" + query[keys[i]];
		}
		string = rsSystem.Router.currentRoute.path + string;
	} else {
		string = rsSystem.Router.currentRoute.path;
	}
	
	rsSystem.Router.push(string);
	return string;
};
