/**
 *
 *
 * @class rsBacklog
 * @constructor
 * @module Components
 */
(function() {
	var second = 1000,
		minute = 60 * second,
		hour = 60 * minute,
		day = 24 * hour,
		week = 7 * day,
		month = 30 * day,
		year = 365 * day,
		weekJump = week + 12 * hour,
		softStart = 5 * week,
		now = Date.now(),
		debug = {};

	rsSystem.component("rsBacklog", {
		"inherit": true,
		"mixins": [
		],
		"props": {
			"universe": {
				"type": Object,
				"default": function() {
					return rsSystem.universe;
				}
			},
			"profile": {
				"type": Object,
				"default": function() {
					return rsSystem.universe.profile;
				}
			},
			"backlog": {
				"type": Object,
				"required": true,
				"default": function() {
					if(this.$route.params.backlog) {
						return this.universe.index.backlog[this.$route.params.backlog];
					} else {
						return null;
					}
				}
			},
			"player": {
				"type": Object
			}
		},
		"data": function() {
			var data = {};

			/**
			 * Tracks a release Start Time to a list of tasks.
			 * 
			 * Start time is used for mapping to tasks as some releases aren't yet made and may have custom spans.
			 * @property releaseStarts
			 * @type Object
			 */
			data.releaseStarts = {};
			/**
			 * Tracks a release ID for created releases to respond to updates and for lookup.
			 * @property releaseMap
			 * @type Object
			 */
			data.releaseMap = {};
			/**
			 * 
			 * @property releases
			 * @type Array
			 */
			data.releases = [];
			/**
			 * Tracks a task ID for created tasks to respond to updates and for lookup.
			 * @property taskMap
			 * @type Object
			 */
			data.taskMap = {};
			/**
			 * 
			 * @property tasks
			 * @type Array
			 */
			data.tasks = [];

			data.dayOfWeek = 0;

			return data;
		},
		"watch": {
			"backlog": function() {
				rsSystem.utility.clearObject(this.releaseStarts);
				rsSystem.utility.clearObject(this.releaseMap);
				rsSystem.utility.clearObject(this.taskMap);
				this.releases.splice(0);
				this.tasks.splice(0);
				this.recalculate();
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			this.universe.$on("updated", this.update);
			this.update();

			/**
			 * 
			 * @event openrelease
			 * @param {Object} release
			 */

			/**
			 * 
			 * @event opentask
			 * @param {Object} task
			 */
		},
		"methods": {
			/**
			 * 
			 * @method openRelease
			 * @param {Object} release 
			 */
			"openRelease": function(release) {
				this.$emit("openrelease", release);
			},
			/**
			 * 
			 * @method openTask
			 * @param {Object} task 
			 */
			"openTask": function(task) {
				this.$emit("opentask", task);
			},
			/**
			 * Order the releases and file tasks to them, tracking tasks already in a release and
			 * keeping them together without overcalculating the next release in the sequence.
			 * @method recalculate
			 */
			"recalculate": function() {

			},
			/**
			 * Use the weighting formula for this backlog to reorder incomplete tasks in the backlog.
			 * @method reorderBuild
			 * @param {Integer} [start] Offset at which to start the sort, defaults to start.
			 */
			"reorderBuild": function(start) {

			},
			/**
			 * 
			 * @method update
			 * @param {Object} [event] Offset at which to start the sort, defaults to start.
			 */
			"update": function(event) {
				if(!event || (this.backlog && event.id === this.backlog.id)) {
					this.tasks.splice(0);
					this.recalculate();
				} else if(this.releaseMap[event.id] || this.taskMap[event.id]) {
					this.recalculate();
				}
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("updated", this.update);
		},
		"template": Vue.templified("components/system/backlog.html")
	});
})();
