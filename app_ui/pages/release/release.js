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
		softStart = 5 * week;

	var sortByStart = function(a, b) {
		if(a.date_started < b.date_started) {
			return -1;
		} else if(a.date_started > b.date_started) {
			return 1;
		}
		return 0;
	};

	// date_needed, priority, effort
	var sortTask = function(a, b) {
		if((b.date_needed === undefined || b.date_needed === null) && a.date_needed !== undefined && a.date_needed !== null) {
			return -1;
		} else if((a.date_needed === undefined || a.date_needed === null) && b.date_needed !== undefined && b.date_needed !== null) {
			return 1;
		} else if(a.date_needed < b.date_needed) {
			return -1;
		} else if(a.date_needed > b.date_needed) {
			return 1;
		}
		if((b.priority === undefined || b.priority === null) && a.priority !== undefined && a.priority !== null) {
			return -1;
		} else if((a.priority === undefined || a.priority === null) && b.priority !== undefined && b.priority !== null) {
			return 1;
		} else if(a.priority > b.priority) {
			return -1;
		} else if(a.priority > b.priority) {
			return 1;
		}
		if(a.effort < b.effort) {
			return -1;
		} else if(a.effort > b.effort) {
			return 1;
		}
		if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
			return -1;
		} else if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
			return 1;
		} else if(a.ordering < b.ordering) {
			return -1;
		} else if(a.ordering > b.ordering) {
			return 1;
		}
		if(a.name < b.name) {
			return -1;
		} else if(a.name > b.name) {
			return 1;
		}
		if(a.id < b.id) {
			return -1;
		} else if(a.id > b.id) {
			return 1;
		}
		return 0;
	};

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

		},
		"data": function() {
			var data = {};

			data.setting = {};
			data.setting.initial_burn = 10;
			data.setting.initial_day = 5;

			data.notice_timeshift = {};
			data.notice_missed = {};
			data.notice_needed = {};
			data.release_effort = {};

			data.cachedDate = {};
			data.tracked = {};

			data.released = [];
			data.queue = [];

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
			this.buildForecast();
		},
		"methods": {
			"getReleaseIcon": function(task) {
				if(task.id) {
					return task.icon || "fa-duotone fa-merge";
				} else {
					return "fa-duotone fa-merge rs-yellow";
				}
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
			"clearRelease": function() {
				Vue.set(this, "releaseStyleClasses", "");
				Vue.set(this, "release", {});
			},
			"clearTask": function(task) {
				Vue.set(this, "task", {});
			},
			"populateRelease": function(release) {
				var tasks,
					i;
				if(this.release.tasks) {
					tasks = this.tracked[release.date_started].map((t) => t.id);
					for(i=0; i<tasks.length; i++) {
						this.release.tasks.uniquely(tasks[i]);
					}
				} else {
					Vue.set(this.release, "tasks", this.tracked[release.date_started].map((t) => t.id));
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
									this.queue.push(release_task);
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

				for(i=0; i<this.universe.listing.dmtask.length; i++) {
					task = this.universe.listing.dmtask[i];
					// TODO: Check for task repetition (Leveraging date_started, repetition, and Ghost Tasks)
					// TODO: Calculate missed repetitions based on repetition duration value - see notice_missed
					if(rsSystem.utility.isValid(task) && !task.date_completed) {
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

				tasks.sort(sortTask);
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
						this.queue.push(task);
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
			"updateReceived": function(event) {
				if(event && (event._class === "dmrelease" || event._class === "dmtask")) {
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
