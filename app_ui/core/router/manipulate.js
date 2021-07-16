
/**
 * Change the current query, leaving unmentioned keys as they are.
 * @method manipulateQuery
 * @for rsSystem
 * @static
 * @param {Object} manipulate Key:Value pairs to set in the query. Use null
 * 		to delete one.
 */
rsSystem.manipulateQuery = function(manipulate) {
	var query = Object.assign({}, rsSystem.Router.currentRoute.query),
		keys = Object.keys(manipulate),
		string = "?",
		i;
	
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
	
	if(rsSystem.Router.currentRoute.fullPath !== string) {
		rsSystem.Router.push(string);
	}
	return string;
};

/**
 * Change location preserving the Query parameters and
 * manipulating them if desired.
 * @method toPath
 * @for rsSystem
 * @static
 * @param {String} path New path to assume.
 * @param {Object} [query] To change the query parameters.
 * @param {Boolean} [manual] When true, the router.push call
 * 		is not performed here.
 */
rsSystem.toPath = function(path, changeQuery, manual) {
	var query = Object.assign({}, rsSystem.Router.currentRoute.query),
		string = "?",
		keys,
		i;
	
	if(changeQuery) {
		keys = Object.keys(changeQuery);
		for(i=0; i<keys.length; i++) {
			if(changeQuery[keys[i]] === null) {
				delete(query[keys[i]]);
			} else {
				query[keys[i]] = changeQuery[keys[i]];
			}
		}
	}
	
	keys = Object.keys(query);
	if(keys.length) {
		string += keys[0] + "=" + query[keys[0]];
		for(i=1; i<keys.length; i++) {
			string += "&" + keys[i] + "=" + query[keys[i]];
		}
		path = path + string;
	}
	
	if(!manual) {
		rsSystem.Router.push(path);
	}

	return path;
};
