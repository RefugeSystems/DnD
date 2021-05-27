
/**
 * 
 * @property Router
 * @type VueRouter
 * @module Core
 * @for rsSystem
 * @static
 */
rsSystem.Router = new VueRouter({
	mode: "hash"
});

rsSystem.EventBus.$on("sys-ready", function() {
	// Get System Configuration
	var path = location.pathname,
		index = path.lastIndexOf("/"),
		timeout;
	var navigation = [],
		routes = {},
		item,
		i;
		
	console.log("Building Routes");
	
	if(index !== -1) {
		path = path.substring(0, index);
	}
	routes.path = "/";
	routes.component = rsSystem.components.RSHome;
	routes.children = navigation;
	
	fetch(location.protocol + "//" + location.host + path + "/configuration.json")
	.then((res) => {
		if(res.status === 404) {
			throw new Error("Site Unavailable");
		} else if(res.status === 500) {
			throw new Error("Site Unavailable due to Server Error");
		}
		return res.json();
	}).then((configuration) => {
		rsSystem.configuration = configuration;
		
		
		if(configuration.mainpage) {
			item = {
				"path": "/home",
				"component": rsSystem.components[configuration.mainpage],
				"icon": "fas fa-globe"
			};
			navigation.push(item);
		}
		if(configuration.navigations) {
			for(i=0; i<configuration.navigations.length; i++) {
				item = Object.assign({}, configuration.navigations[i]); // TODO: Nested children processing
				if(item.route && item.component) {
					if(rsSystem.components[item.component]) {
						item.component = rsSystem.components[item.component];
						navigation.push(item);
					} else {
						console.warn("No component for navigation item: ", item);
					}
				}
			}
		}
		console.log("Routes: ", routes);
		rsSystem.Router.addRoute(routes);
	}).catch((err) => {
		console.warn(err);
	});
});

rsSystem.configureRouting = function(configuration) {
	return new Promise(function(done, fail) {
		if(configuration.navigations) {
			var component,
				x;
			/*	
			for(x=0; x<configuration.navigations.length; x++) {
				component = rsSystem.components[configuration.navigations[x].component];
				if(component) {
					configuration.navigations[x].component = component;
					rsSystem.Router.addRoute(configuration.navigations[x]);
				} else {
					console.warn("Route not added for missing component: " + configuration.navigations[x].component);
					configuration.navigations[x].errored = "no component";
				}
			}
			*/
		}
		done(configuration);
	});
};
