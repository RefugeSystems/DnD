/**
 * The goal of the release component is to organize all tasks into weekly releases and understand
 * multi-week tasks as well as creating repeating tasks as the master is viewing the list.
 *
 * @class RSRelease
 * @constructor
 * @module Pages
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

	var getFunctionText = function(method) {
		method = method.toString();
		return method.slice(method.indexOf("{") + 1, method.lastIndexOf("}"));
	};
	
	var calculateWeight = function(task) {
		var weight = 0;
		if(task.priority) {
			weight += task.priority * 4;
		}
		if(task.effort) {
			weight += 3 * (6/task.effort);
		}
		if(task.ordering) {
			weight += 10 * task.ordering;
		}
		if(task.date_needed) {
			weight += 10 * (month/(task.date_needed - now));
		}
		return weight;
	};

	var sortByStart = function(a, b) {
		if(a.date_started < b.date_started) {
			return -1;
		} else if(a.date_started > b.date_started) {
			return 1;
		}
		return 0;
	};

	// date_needed, priority, effort

	rsSystem.component("RSRelease", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageController,
			rsSystem.components.RSShowdown
		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			},
			"configuration": {
				"required": true,
				"type": Object
			},
			"player": {
				"required": true,
				"type": Object
			},
			"profile": {
				"required": true,
				"type": Object
			}
		},
		"watch": {
			"filterText": function(text) {
				text = text.toLowerCase();
				var filter,
					keys,
					key,
					i;
				
				for(i=0; i<this.filterKeys.length; i++) {
					delete(this.filter[this.filterKeys[i]]);
				}
				this.filterKeys.splice(0);

				Vue.set(this.filter, "_", text);
				// TODO: Key:Value pair parse
				// TODO: Move this to a component
			},
			"storage.calculateWeight": function(text) {
				this.delayWeight();
			}
		},
		"data": function() {
			var data = {};
			data.debugging = debug;

			data.planningStyling = "";

			data.filterText = "";
			data.filterKeys = [];
			data.filter = {};

			data.warningText = null;
			data.warning = null;

			data.setting = {};
			data.setting.initial_burn = 10;
			data.setting.initial_day = 5;

			data.notice_timeshift = {};
			data.notice_missed = {};
			data.notice_needed = {};
			data.release_effort = {};

			data.cachedDate = {};
			data.trackedCategory = {};
			data.trackedReleases = {};
			data.tracked = {};

			data.references = {};
			data.references.priority = [];
			data.references.effort = [];

			data.released = [];
			data.queue = [];

			data.customCalculation = null;
			data.calculateWeight = calculateWeight;
			data.weightWarning = null;
			data.weightWaiting = null;
			data.waitWeight = null;
			data.weights = {};

			data.task = {};
			data.taskFields = this.universe.transcribeInto([
				"name",
				"state",
				"description",
				"date_needed",
				"associations",
				"priority",
				"effort",
				"ordering",
				"date_started",
				"date_completed",
				"categories",
				"hints",
				"repetition",
				"is_player_affected"
			]);

			data.release = {};
			data.releaseStyleClasses = "";
			data.releaseFields = this.universe.transcribeInto([
				"name",
				"state",
				"description",
				"effort",
				"is_baseline",
				"date_started",
				"date_completed",
				"associations",
				"hints",
				"tasks"
			]);
			
			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
			this.universe.$on("updated", this.updateReceived);

			if(this.storage.calculateWeight) {
				this.setWeightCalculation(this.storage.calculateWeight);
			} else {
				Vue.set(this.storage, "calculateWeight", getFunctionText(calculateWeight));
			}

			this.buildForecast();
			this.buildReferences();
		},
		"methods": {
			"delayWeight": function() {
				if(!this.weightWaiting) {
					Vue.set(this, "weightWaiting", setTimeout(this.setWeightFormula, 250));
				}
				this.waitWeight = Date.now() + 500;
			},
			"setWeightFormula": function() {
				if(this.weightWaiting) {
					if(this.waitWeight < Date.now()) {
						this.setWeightCalculation(this.storage.calculateWeight);
						Vue.set(this, "weightWaiting", null);
					} else {
						setTimeout(this.setWeightFormula, 250);
					}
				}
			},
			"resetWeightCalculation": function() {
				Vue.set(this.storage, "lastCalculateWeight", this.storage.calculateWeight);
				Vue.set(this.storage, "calculateWeight", getFunctionText(calculateWeight));
				Vue.set(this, "calculateWeight", calculateWeight);
				this.buildForecast();
			},
			"restoreWeightCalculation": function() {
				var buffer = this.storage.calculateWeight;
				Vue.set(this.storage, "calculateWeight", this.storage.lastCalculateWeight);
				Vue.set(this.storage, "lastCalculateWeight", buffer);
				this.setWeightCalculation(this.storage.calculateWeight);
			},
			"setWeightCalculation": function(formula) {
				var calculation,
					test;

				try {
					calculation = new Function("task", "second", "minute", "hour", "day", "week", "month", "year", "weekJump", "softStart", "now", "rsSystem", "document", "window", "global", "location", "localStorage", "sessionStorage", "navigator", "navigation", "element", "Vue", "Random", formula),
					test = calculation({}, second, minute, hour, day, week, month, year, weekJump, softStart, now);
					if(test === 0) {
						Vue.set(this, "calculateWeight", calculation);
						Vue.set(this, "weightWarning", null);
					} else {
						Vue.set(this, "weightWarning", "Custom Weight Calculation failed to return 0 for empty task");
					}
				} catch(error) {
					Vue.set(this, "weightWarning", "Custom Weight Calculation threw an error while testing during initialization and was ignored: ", error.message);
					console.log("Custom Weight Calculation threw an error while testing during initialization and was ignored: ", error.message);
				}
			},
			"taskVisible": function(task) {
				if(task._class === "dmtask") {
					// TODO: Add Key:Value parsing
					return !this.filter._ || task._search.indexOf(this.filter._) !== -1;
				}

				return false;
			},
			"getFirstRelease": function() {
				var entry,
					i;
				for(i=0; i<this.queue.length; i++) {
					entry = this.queue[i];
					if(entry._class === "dmrelease") {
						return entry;
					}
				}
				return null;
			},
			"getReleaseStyles": function(task) {
				if(this.universe.index.setting["setting:release"] && this.universe.index.setting["setting:release"].value === task.id) {
					return "current";
				}
				return "";
			},
			"getReleaseIcon": function(task) {
				if(task.id) {
					var icon = task.icon || "fa-duotone fa-merge";
					if(this.universe.index.setting["setting:release"] && this.universe.index.setting["setting:release"].value === task.id) {
						return "rs-green " + icon;
					}
					return icon;
				} else {
					return "fa-duotone fa-merge rs-yellow";
				}
			},
			"getTaskCategory": function(task) {
				var category = this.trackedCategory[task.id];
				return "category-name color-" + (category?category.label_color || "gray":"gray");
			},
			"getDate": function(timestamp) {
				if(this.cachedDate[timestamp]) {
					return this.cachedDate[timestamp];
				} else {
					return this.cachedDate[timestamp] = (new Date(timestamp)).toLocaleString("us", {
						"weekday": "short",
						"year": "numeric",
						"month": "numeric",
						"day": "numeric"
					});
				}
			},
			"getAssociatedRelease": function(task) {
				var times = Object.keys(this.tracked),
					release,
					start,
					i;
				task = task?task.id||task||this.task.id:this.task.id;
				if(task) {
					// Search by cache map
					for(i=0; i<times.length; i++) {
						start = times[i];
						if(this.tracked[start] && this.tracked[start].indexOf(task) !== -1) {
							return this.trackedReleases[start];
						}
					}

					// Search releases
					for(i=0; i<this.universe.listing.dmrelease.length; i++) {
						release = this.universe.listing.dmrelease[i];
						if(release.tasks && release.tasks.indexOf(task) !== -1) {
							return release;
						}
					}
				}

				return null;
			},
			"zeroDate": function(date) {
				date.setHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				date.setMilliseconds(0);
				return date.getTime();
			},
			"open": function(task) {
				if(task._class === "dmrelease") {
					if(task.date_started === this.release.date_started) {
						if(this.releaseStyleClasses !== "") {
							Vue.set(this, "releaseStyleClasses", "");
						}
						Vue.set(this, "release", {});
					} else {
						if(this.releaseStyleClasses === "") {
							Vue.set(this, "releaseStyleClasses", "open");
						}
						Vue.set(this, "release", rsSystem.utility.clone(task, false));
					}
				} else if(task._class === "dmtask") {
					Vue.set(this, "task", rsSystem.utility.clone(task, false));
				}
			},
			"copyTask": function(task) {
				var copy = rsSystem.utility.clone(task, false);
				delete(copy.id);
				Vue.set(this, "task", copy);
			},
			"clearRelease": function() {
				Vue.set(this, "releaseStyleClasses", "");
				Vue.set(this, "release", {});
			},
			"clearTask": function(task) {
				Vue.set(this, "task", {});
			},
			"toggleReferenceFlyout": function() {
				if(this.planningStyling) {
					Vue.set(this, "planningStyling", "");
				} else {
					Vue.set(this, "planningStyling", "referencing");
				}
			},
			"buildReferences": function() {
				var task,
					i;
				this.references.priority.splice(0);
				this.references.effort.splice(0);

				for(i=0; i<this.queue.length; i++) {
					task = this.queue[i];
					if(task._class === "dmtask") {
						if(task.priority && !this.references.priority[task.priority]) {
							this.references.priority[task.priority] = task;
						}
						if(task.effort && !this.references.effort[task.effort]) {
							this.references.effort[task.effort] = task;
						}
					}
				}

				for(i=0; i<this.universe.listing.dmtask.length; i++) {
					task = this.universe.listing.dmtask[i];
					if(task.priority && !this.references.priority[task.priority]) {
						this.references.priority[task.priority] = task;
					}
					if(task.effort && !this.references.effort[task.effort]) {
						this.references.effort[task.effort] = task;
					}
				}
			},
			"populateTask": function(task) {
				var release = this.getAssociatedRelease(task),
					associations = [],
					classification,
					load,
					i;

				if(release && release.associations && release.associations.length) {
					for(i=0; i<release.associations.length; i++) {
						load = release.associations[i];
						classification = rsSystem.utility.getClass(load);
						if(classification && !classification.attribute.no_track_task && classification.id !== "dmtask" && classification.id !== "dmrelease") {
							associations.push(load);
						}
					}
					if(this.task.associations) {
						this.task.associations = this.task.associations.union(associations);
					} else {
						this.task.associations = associations;
					}
				}
			},
			"populateRelease": function(release) {
				var tasks = this.tracked[release.date_started].map((t) => t.id),
					task,
					i;

				if(this.release.associations) {
					for(i=0; i<this.release.associations.length; i++) {
						task = this.release.associations[i];
						if(task.startsWith("dmtask:") && (task = this.universe.get(task)) && task.date_completed) {
							tasks.uniquely(task.id);
						}
					}
				}

				if(this.release.tasks) {
					for(i=0; i<tasks.length; i++) {
						this.release.tasks.uniquely(tasks[i]);
					}
				} else {
					Vue.set(this.release, "tasks", tasks);
				}
			},
			"completeRelease": function(release) {
				var now = Date.now(),
					task,
					i;
				release = release || this.release;
				if(release.tasks) {
					for(i=0; i<release.tasks.length; i++) {
						task = this.universe.get(release.tasks[i]);
						if(rsSystem.utility.isValid(task) && !task.date_completed) {
							this.universe.send("master:quick:set", {
								"object": task.id,
								"field": "date_completed",
								"value": now
							});
						}
					}
				}
				this.updateRelease();
			},
			"updateRelease": function(task) {
				this.updateObject(task || this.release, "dmrelease", this.releaseFields);
				this.clearRelease();
			},
			"updateTask": function(task) {
				this.updateObject(task || this.task, "dmtask", this.taskFields);
			},
			"updateObject": function(task, classification, fields) {
				var saving = {},
					field,
					i;

				// Clean eroneous fields
				saving.id = task.id || Random.identifier(classification, 32).toLowerCase();
				for(i=0; i<fields.length; i++) {
					field = fields[i];
					switch(typeof(task[field.id])) {
						case "object":
							if(task[field.id] === null) {
								saving[field.id] = null;
							} else if(rsSystem.utility.isEmpty(task[field.id])) {
								saving[field.id] = undefined;
							} else {
								saving[field.id] = JSON.parse(JSON.stringify(task[field.id]));
							}
							break;
						default:
							saving[field.id] = task[field.id];
					}
				}

				this.universe.send("create:object", {
					"classification": classification,
					"details": saving
				});
			},
			"buildForecast": function() {
				var releases = this.universe.listing.dmrelease,
					releasing = {}, // Maps by week offset where 0 is the current week Friday -> Friday (TODO: Make the start day dynamic)
					tracking = {},
					tasks = [],

					// Functions
					queueRelease,
					queueTask,

					// Calculation Variables
					burn, // Initial burn is 10 points unless a prior release is found
					remaining, // Track remainig burn for the release
					weekOffset, // Track the release (week) offset during loop through tasks
					start, // Timestamp for start of the current calculated period
					end, // End for period
					release, // Track the release being considered, or a temporary object with no ID, ordering is used to maintain a continuous count
					release_task,
					task, // Track the task being examined,
					order,
					date,
					period,
					offset, // Used to calculate dates
					check,

					// Buffer/Loop Variables
					warning,
					o,
					i,
					j;
				
				queueRelease = (release) => {
					if(release) {
						if(release.tasks && release.tasks.length) {
							for(j=0; j<release.tasks.length; j++) {
								release_task = this.universe.get(release.tasks[j]);
								if(rsSystem.utility.isValid(release_task) && !tracking[release_task.id]) {
									this.release_effort[start] += release_task.effort || 0;
									remaining -= release_task.effort || 0;
									queueTask(release_task);
								}
							}
						}
						this.queue.push(release);
					} else {
						o = order + weekOffset;
						this.queue.push({
							"_class": "dmrelease",
							"name": "Release " + o,
							"date_started": start,
							"date_completed": end,
							"ordering": o
						});
					}
				};

				queueTask = (task) => {
					var category;
					if(task && task.categories && task.categories.length) {
						if(!this.trackedCategory[task.id] || this.trackedCategory[task.id] !== task.categories[0]) {
							category = this.universe.index.category[task.categories[0]];
							if(rsSystem.utility.isValid(category)) {
								this.trackedCategory[task.id] = category;
							} else {
								this.trackedCategory[task.id] = null;
							}
						}
					} else if(this.trackedCategory[task.id]) {
						this.trackedCategory[task.id] = null;
					}
					this.queue.push(task);
				};

				Vue.set(this, "warningText", null);
				Vue.set(this, "warning", null);
				if(this.universe.index.setting["setting:release"] && this.universe.index.setting["setting:release"].value) {
					warning = this.universe.index.dmrelease[this.universe.index.setting["setting:release"].value];
					if(rsSystem.utility.isValid(warning)) {
						if(Date.now() < warning.date_completed) {
							if(warning.date_started < Date.now()) {
								// Release Ok. Possible Additional Checks?
							} else {
								Vue.set(this, "warningText", "Current release has not yet started. Change current release to top most release when ready to move forward.");
								Vue.set(this, "warning", warning);
							}
						} else {
							Vue.set(this, "warningText", "Current release has closed. Change current release to top most release when ready to move forward.");
							Vue.set(this, "warning", warning);
						}
					} else {
						Vue.set(this, "warningText", "Current release is not valid");
						Vue.set(this, "warning", warning);
					}
				}

				for(i=0; i<this.universe.listing.dmtask.length; i++) {
					task = this.universe.listing.dmtask[i];
					// TODO: Check for task repetition (Leveraging date_started, repetition, and Ghost Tasks)
					// TODO: Calculate missed repetitions based on repetition duration value - see notice_missed
					if(rsSystem.utility.isValid(task) && !task.date_completed) {
						delete(this.weights[task.id]);
						tracking[task.id] = true;
						tasks.push(task);
					}
				}

				this.released.splice(0);
				this.queue.splice(0);

				date = new Date();
				start = new Date(date.getTime() - day * date.getDay());
				start = this.zeroDate(start);
				date = date.getTime();
				end = start + week;
				order = 0;
				weekOffset = 0;

				// Scan releases and get existing future periods
					// Sort by date_started
					// Past release periods go to "released"
					// Store based on period delta
					// TODO: Calculate burn while scanning past release efforts and adjusting to 
				releases.sort(sortByStart);
				for(i=0; i<releases.length; i++) {
					release = releases[i];
					this.trackedReleases[release.date_started] = release;
					if(release.date_completed < date) {
						this.released.push(release);
						if(order < release.ordering) {
							order = release.ordering;
						}
					} else {
						offset = release.date_started - start;
						releasing[Math.ceil(offset/week)] = release;
					}
				}
				release = releasing[weekOffset];
				burn = this.setting.initial_burn;
				remaining = burn;
				if(release) {
					if(release.is_baseline && release.effort) {
						burn = release.effort;
						remaining = burn;
					}
					if(release.tasks) {
						for(i=0; i<release.tasks.length; i++) {
							release_task = this.universe.get(release.tasks[i]);
							if(rsSystem.utility.isValid(release_task) && !tracking[release_task.id]) {
								remaining -= release_task.effort || 0;
							}
						}
					}
				}
				console.log("Release --- " + Object.keys(releasing) + "\n", release, "\n", releasing, "\n ---");
				this.release_effort[start] = 0;

				// Scan tasks and order by date_needed, priority, effort (Null in any means sort to back)
					// Filter out tasks that are "completed". Those to track are in their respective releases and seen there

				tasks.sort(this.sortTask);
				if(!this.tracked[start]) {
					this.tracked[start] = [];
				} else {
					this.tracked[start].splice(0);
				}
				// Loop through the sorted task list and append to the queue
					// Insert releases as necessary using the mapped offsets from `releasing`
				for(i=0; i<tasks.length; i++) {
					task = tasks[i];
					if(rsSystem.utility.isValid(task)) {
						// TODO: ...

						// TODO: "Soft Start" tasks with date_needed, not populating until we're within ~a month of the needed date

						// TODO: Dynamically Calculate and Update Burn value

						// Check for release change and push release to queue if transitioning
						remaining -= task.effort || 0;
						while(remaining < 0) {
							// Queue Release and Add Burn
							queueRelease(release);
							weekOffset += 1;
							release = releasing[weekOffset];
							remaining += release?release.effort || burn:burn;
							start = this.zeroDate(new Date(start + weekJump)); // Jump by a week and a half to account for drifts
							this.release_effort[start] = 0;
							end += week;
							if(!this.tracked[start]) {
								this.tracked[start] = [];
							} else {
								this.tracked[start].splice(0);
							}
							check = new Date(end);
							if(check.getDay() !== 0) {
								Vue.set(this.notice_timeshift, start, true);
							} else if(this.notice_timeshift[start]) {
								Vue.set(this.notice_timeshift, start, false);
							}
							if(release && release.is_baseline && release.effort) {
								burn = release.effort;
							}
						}
						this.tracked[start].push(task);
						queueTask(task);
						this.release_effort[start] += task.effort || 0;

						// Does the task have a date_needed and is that after the release's expected complete
						if(task.date_needed) {
							if(task.date_needed < start) {
								Vue.set(this.notice_needed, task.id, true);
							} else if(this.notice_needed[task.id]) {
								Vue.set(this.notice_needed, task.id, false);
							}
						}
					}
				}

				if(release) {
					queueRelease(release);
				} else if(this.queue.length && this.queue[this.queue.length - 1] && this.queue[this.queue.length - 1]._class !== "dmrelease") {
					queueRelease();
				}
			},
			"sortTask": function(a, b) {
				var weightA = this.weights[a.id] || this.calculateWeight(a, second, minute, hour, day, week, month, year, weekJump, softStart, now),
					weightB = this.weights[b.id] || this.calculateWeight(b, second, minute, hour, day, week, month, year, weekJump, softStart, now);
		
				debug[a.name] = weightA;
				debug[b.name] = weightB;
		
				if(weightB < weightA) {
					return -1;
				} else if(weightB > weightA) {
					return 1;
				}
				return 0;
			},
			"updateReceived": function(event) {
				if(event && (event._class === "dmrelease" || event._class === "dmtask" || event._class === "setting")) {
					// Rebuild List & Release Markers
					this.buildForecast();
				}
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("updated", this.updateReceived);
		},
		"template": Vue.templified("pages/release.html")
	});
})();
