var STSAssignmentProcessor = Class.create();
/**
 * Allows complex assignment routing for an Advanced Work Assignment (AWA) Queue.
 * @class STSAssignmentProcessor
 * @constructor
 * @param {GlideRecord} workItem That is currently being considered.
 */
 STSAssignmentProcessor.prototype = {
	"type": "STSAssignmentProcessor",
	"initialize": function(workItem) {
		this.workItem = workItem;
		this.debug = true;
	},
	/**
	 * 
	 * @method getNextAssignment
	 * @return {Object} Object with two properties, "user" and "group",
	 * 		used to set assignment on the document.
	 */
	"getNextAssignment": function(process) {
		// Javascript requires true string match (===) but ServiceNow returns Java Strings in manay cases that only work with corecion (==)
		process = JSON.parse(JSON.stringify(process));
		
		if(this.debug) {
			gs.info("STSAssignmentProcessor: Start Assignment - " + process);
		}
		
		switch(process) {
			case "Round Robin":
				return this.assignmentRoundRobin();
			// Add additional processes as cases here that match the choice list on the dictionary:
			//       /sys_dictionary.do?sys_id=88e7c2b6db623890eae7c784059619c6
		}
		return this.assignmentNext();
	},
	/**
	 * 
	 * @method assignmentNext
	 * @returns {Object}
	 */
	"assignmentNext": function() {
		var group = new GlideRecord("sys_user_group"),
			user = new GlideRecord("sys_user"),
			result = {};

		if(group.get(this.workItem.getValue("assignment_group"))) {
			result.group = group;
		}
		if(user.get(this.workItem.getValue("assigned_to"))) {
			result.user = user;
		}
		
		if(this.debug) {
			gs.info("STSAssignmentProcessor:  Assignment - " + process);
		}

		return result;
	},
	/**
	 * 
	 * @method assignmentRoundRobin
	 * @returns {Object}
	 */
	"assignmentRoundRobin": function() {
		var build = new GlideRecord("awa_eligibility_pool"),
			search = new GlideRecord("sys_user_grmember"),
			queue = new GlideRecord("awa_queue"),
			group = new GlideRecord("sys_user_group"),
			user = new GlideRecord("sys_user"),
			sesrched = [],
			result = {},
			groups = [],
			index = -1,
			stop;

		// Get information from the Queue
		queue.get(this.workItem.getValue("queue"));
		stop = parseInt(queue.getValue("u_assignment_index")) || 0;
		if(this.debug) {
			gs.info("STSAssignmentProcessor:  Round Robin (RR) Stop: " + stop);
		}

		// Get all groups involved
		build.addQuery("queue", this.workItem.getValue("queue"));
		if(this.debug) {
			gs.info("STSAssignmentProcessor:  Group Query: " + build.getEncodedQuery());
		}
		build.query();
		while(build.next()) {
			groups = groups.concat(build.getValue("groups").split(","));
			if(this.debug) {
				gs.info("STSAssignmentProcessor -- Groups: " + groups.join());
			}
		}

		// Search down to the current index to get the Robin
		search = new GlideRecord("sys_user_grmember");
		search.addQuery("group", "IN", groups.join(","));
		search.orderBy("user"); // Keep the ordering consistent found round robin assignment
		search.query();
		gs.info(" -- Query: " + search.getEncodedQuery());
		while(index < stop && search.next()) {
			if(this.debug) {
				sesrched.push(search.user.name);
			}
			index++;
		}

		// Update Queue Assignment Index for next Assignment
		if(index < stop) {
			queue.setValue("u_assignment_index", 1);
			queue.update();
			if(this.debug) {
				gs.info("STSAssignmentProcessor -- Queue Index Reset");
			}
			search = new GlideRecord("sys_user_grmember");
			search.addQuery("group", "IN", groups.join(","));
			search.orderBy("user"); // Keep the ordering consistent found round robin assignment
			search.setLimit(1);
			search.query();
			search.next();
			if(this.debug) {
				sesrched.push(search.user.name);
			}
		} else {
			queue.setValue("u_assignment_index", stop + 1);
			queue.update();
			if(this.debug) {
				gs.info("STSAssignmentProcessor -- Queue Index Incremented");
			}
		}
		if(this.debug) {
			gs.info("STSAssignmentProcessor -- Searched: " + sesrched.join(","));
		}

		// Build Result on search
		group.get(search.group);
		user.get(search.user);
		result.group = group;
		result.user = user;

		return result;
	},
	/**
	 * 
	 * @method assignWorkItem
	 * @param {Object | GlideRecord} user 
	 * @param {GlideRecord} [group] If user is an object with a group property, this
	 * 		value is pulled from there.
	 */
	"assignWorkItem": function(user, group) {
		var table = this.workItem.document_table,
			sysid = this.workItem.document_id,
			document = new GlideRecord(table);

		if(!group && user.group) {
			group = user.group;
			user = user.user;
		}

		if(document.get(sysid)) {
			if(user.getValue("active") != 1) {
				gs.warn("STSAssignmentProcessor: Assigning to inacitve User");
			}
			if(group) {
				if(group.getValue("active") != 1) {
					gs.warn("STSAssignmentProcessor: Assigning to inacitve Group");
				}
				document.assignment_group = group.getUniqueValue();
			}
			document.assigned_to = user.getUniqueValue();
			document.update();
		} else {
			gs.warn("STSAssignmentProcessor: Unable to find document(" + this.getDocumentLink(sysid, table) + ") for Work Item(" + this.getDocumentLink() + ")");
		}
	},
	/**
	 * Get the URL path for the specified record.
	 * @method getDocumentLink
	 * @param {GlideRecord | String} [record] Optional record, defaults to the current work item. May also
	 * 		be a SysID when paired with a string for table value.
	 * @param {String} [table] To specify the table with a record value of a SysID.
	 * @return {String} Relative path for the record.
	 */
	"getDocumentLink": function(record, table) {
		if(!record) {
			record = this.workItem;
		}
		return "/" + (record.getTableName() || table) + ".do?sys_id=" + (record.getUniqueValue() || record);
	}
};
