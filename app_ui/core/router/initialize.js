
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

rsSystem.configureRouter = function(configuration) {
	return new Promise(function(done, fail) {
		
		done(configuration);
	});
};
