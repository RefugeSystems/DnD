var SedgwickEmployeeBoardingUtility = Class.create();

var approvalWarning = 2,
	startWarning = 7,
	startDanger = 2,

	TIME_Second = 1000,
	TIME_Minute = 60 * TIME_Second,
	TIME_Hour = 60 * TIME_Minute,
	TIME_Day = 24 * TIME_Hour,
	TIME_Week = 7 * TIME_Day;

SedgwickEmployeeBoardingUtility.prototype = {
	/**
	 * 
	 * @class SedgwickEmployeeBoardingUtility
	 * @constructor
	 * @param {String} [user] Optional SysID to set the user to be considered active. Defaults
	 * 		to the current session user value (gs.getUserID()).
	 */
    "type": "SedgwickEmployeeBoardingUtility",
	"initialize": function (user) {

		if (!user) {
			this.user = gs.getUserID();
		} else {
			this.user = user;
		}

		this.falloff = falloff = parseInt(gs.getProperty("colleague.offboarding.portal_display.fall_off")) || 30;
		this.delegates = new YorkDelegateUtil().getDelegates("u_onboarding_activities", this.user);
	},
	/**
	 * 
	 * @method getByFalloff
	 * @param {String} item SysID of a catalog item
	 * @param {String | Array} [skip] Optional list of User SysIDs to skip, presumably already
	 * 		present and don't need to double count.
	 * @return {Array} Of objects for those users under the indicated Catalog Items.
	 */
	"getByFalloff": function(item, skip) {
		var employees = [],
			result = [],
			requests;
		
		if(skip && typeof(skip) !== "string") {
			skip = skip.join(",");
		}
		
		// STRY0208438: Additional considerations for displaying offboarded employees
		requests = new GlideRecord("sc_req_item");
		requests.addEncodedQuery("sys_updated_onRELATIVEGT@dayofweek@ago@" + this.falloff);
		requests.addQuery("u_requested_for.manager", "IN", this.user);
		requests.addQuery("cat_item", item);
		if(skip) {
			requests.addQuery("u_requested_for", "NOT IN", skip);
		}
		requests.query();
		gs.info("STS:AA:Test - /" + requests.getTableName() + "_list.do?sysparm_query=" + requests.getEncodedQuery());
		while(requests.next()) {
			employees.push(requests.getValue("u_requested_for"));
		}
		return this.colleagueStateData(item, employees.join(","));
	},
	/**
	 * 
	 * @method getUsersByBoardingStatus
	 * @param {Boolean} onboarding 
	 * @param {String} status 
	 * @param {Number} limit 
	 * @returns {Array}
	 */
	"getUsersByBoardingStatus": function(onboarding, contractor, status, limit_by, limit) {
		limit = parseInt(limit || gs.getProperty("colleague.boarding.table_display.inclusion.default_limit", "30"));
		var directReports = new GlideRecord("sys_user"),
			employees = [];

		if(contractor) {
			directReports.addQuery("u_employee_type", "IN", "Contractor");
		} else {
			directReports.addQuery("u_employee_type", "IN", "Employee_ID,Contingent_Worker_ID");
		}

		if(onboarding) {
			// directReports.addActiveQuery();
			directReports.addQuery("u_onboarding_status", status);
		} else {
			directReports.addQuery("u_offboarding_status", status);
		}

		switch(limit_by) {
			case "start":
				directReports.addEncodedQuery("u_start_dateRELATIVEGE@dayofweek@ago@" + limit);
				break;
			case "last":
				directReports.addEncodedQuery("u_last_day_of_workRELATIVEGE@dayofweek@ago@" + limit);
				break;
		}

		directReports.addQuery("manager", "IN", this.delegates);
		directReports.query();
// 		gs.info("Query: " + directReports.getEncodedQuery());
		while(directReports.next()) {
			employees.push(directReports.getUniqueValue());
		}

		return employees;
	},
	/**
	 * 
	 * @method getNewHires
	 * @returns {Array}
	 */
	"getNewHires": function () {
		var employees = this.getUsersByBoardingStatus(true, false, "pre-hire");
		return employees;
	},
	/**
	 * 
	 * @method getNewHiresDataSet
	 * @returns {Array}
	 */
	"getNewHiresDataSet": function() {
		var item = gs.getProperty("colleague.onboarding.orderguide"),
			// item = gs.getProperty("york.onboarding.order_guide"),
			first = this.getNewHires().join(","),
			buffer,
			rows,
			row,
			i;

		rows = this.colleagueStateData(item, first);
		for(i=0; i<rows.length; i++) {
			row = rows[i];
			buffer = (new GlideDateTime(row.u_start_date)).getNumericValue() - Date.now();
			if(!row.$status_text && row.u_start_date) {
				if(buffer < 0) {
					row.$status_text = "This user should have already started";
					row.$status_icon = "fa fa-exclamation-triangle";
					row.$status_class = "btn btn-danger";
				} else if(buffer < (startDanger * TIME_Day)) {
					row.$status_text = "This user starts in less than " + startDanger + " days";
					row.$status_icon = "fa fa-exclamation-triangle";
					row.$status_class = "btn btn-danger";
				} else if(buffer < (startWarning * TIME_Day)) {
					row.$status_text = "This user starts in less than " + startWarning + " days";
					row.$status_icon = "fa fa-exclamation-triangle";
					row.$status_class = "btn btn-warning";
				} 
			}
		}

		return rows;
	},
	/**
	 * 
	 * @method getInitiated
	 * @returns {Array}
	 */
	"getInitiated": function () {
		var employees = this.getUsersByBoardingStatus(true, false, "initiated");
		return employees;
	},
	/**
	 * 
	 * @method getOnboarded
	 * @returns {Array}
	 */
	"getOnboarded": function () {
		var employees = this.getUsersByBoardingStatus(true, false, "onboarded", "start", gs.getProperty("colleague.boarding.table_display.inclusion.onboarding_limit", "60"));
		return employees;
	},
	/**
	 * 
	 * @method getOnboardedAndInitiatedDataSet
	 * @returns {Array}
	 */
	"getOnboardedAndInitiatedDataSet": function () {
		var warnings = gs.getProperty("colleague.onboarding.portal_display.warnings") == true,
			item = gs.getProperty("colleague.onboarding.orderguide"),
			// item = gs.getProperty("york.onboarding.order_guide"),
			first = this.getInitiated().join(","),
			second = this.getOnboarded().join(","),
			buffer,
			rows,
			row,
			i;

		// Get Base Data
		rows = this.colleagueStateData(item, first, second);
		for(i=0; i<rows.length; i++) {
			row = rows[i];
			employees.push(row.sys_id);
		}

		// STRY0208438: Additional considerations for displaying offboarded employees
		rows = rows.concat(this.getByFalloff(item, employees));

		// Add Warnings if configured
		if(warnings) {
			for(i=0; i<rows.length; i++) {
				row = rows[i];
				if(row.request_exists) {
					if(!row.$status_text && row.u_start_date) {
						buffer = (new GlideDateTime(row.u_start_date)).getNumericValue();
						if(buffer < row.request_sla) {
							row.$status_text = "This request may not be completed until after this user's start date";
							row.$status_icon = "fa fa-exclamation-triangle";
							row.$status_class = "btn btn-danger";
						}
					}
					if(!row.$status_text && row.approval != "approved" && (Date.now() - (new GlideDateTime(row.sys_created_on)).getNumericValue()) < (approvalWarning * TIME_Day)) {
						row.$status_text = "This request is still pending approval after " + approvalWarning + " days";
						row.$status_icon = "fa fa-exclamation-triangle";
						row.$status_class = "btn btn-warning";
					}
				}
			}
		}

		return rows;
	},
	/**
	 * 
	 * @method getInitiatedContractors
	 * @returns {Array}
	 */
	"getInitiatedContractors": function () {
// 		var employees = this.getUsersByBoardingStatus(true, true, "initiated", 30);
// 		return employees;
		var directReports = new GlideRecord("sys_user"),
			employees = [];

		directReports.addQuery("u_onboarding_status", "pre-hire")
			.addOrCondition("u_onboarding_status", "initiated");
		directReports.addQuery("u_employee_type", "contractor");
		directReports.addQuery("manager", "IN", this.delegates);
		directReports.addActiveQuery();
		// gs.log("Contractor Pre-Hire Query: " + directReports.getEncodedQuery());
		directReports.query();
		while(directReports.next()) {
			employees.push(directReports.getUniqueValue());
		}
// 		return JSON.stringify(employees);
		return employees;
	},

	"getInitiatedContractorsDataSet": function() {
		var item = gs.getProperty("sedgwick.boarding.contractor.onboarding"),
			first = this.getInitiatedContractors().join(","),
			buffer,
			rows,
			row,
			i;

		rows = this.colleagueStateData(item, first);
		return rows;
	},
	/**
	 * 
	 * @method getAllContractors
	 * @returns {Array}
	 */
	"getAllContractors": function () {
		var employees = [],
			directReports,
			calculate,
			endDate;

		// endDate = new Date(Date.now() + 3 * TIME_Week);
		endDate = new Date(Date.now() + TIME_Day * parseInt(gs.getProperty("colleague.boarding.table_display.inclusion.contractor_limit", "30")));

		/*
		directReports.addQuery("u_offboarding_status", "!=", "offboarded")
			.addOrCondition("active", true);
		directReports.addQuery("u_employee_type", "IN", "Contractor");
		directReports.addQuery("manager", "IN", this.delegates);
		directReports.query();
		*/
		
		// Active Contractors
		directReports = new GlideRecord("sys_user");
		directReports.addQuery("u_onboarding_status", "onboarded");
		directReports.addNullQuery("u_offboarding_status");
		directReports.addQuery("u_employee_type", "contractor");
		directReports.addQuery("manager", "IN", this.delegates);
		directReports.addActiveQuery();
		// gs.log("Active Contractor Query: " + directReports.getEncodedQuery());
		directReports.query();
		while(directReports.next()) {
			employees.push(directReports.getUniqueValue());
		}
		
		// Departing Contractors
		directReports = new GlideRecord("sys_user");
		directReports.addNotNullQuery("u_offboarding_status");
		directReports.addQuery("u_employee_type", "IN", "contractor");
		directReports.addQuery("manager", "IN", this.delegates);
		directReports.addNullQuery("u_last_day_of_work")
			.addOrCondition("u_last_day_of_work", "<", SedgwickEmployeeBoardingUtility.dateToQueryString(endDate));
		// gs.log("Departing Contractor Query: " + directReports.getEncodedQuery());
		directReports.query();
		while(directReports.next()) {
			employees.push(directReports.getUniqueValue());
		}
		
		
// 		return JSON.stringify(employees);
		return employees;
	},

	"getAllContractorsDataSet": function() {
		var offboard = gs.getProperty("sedgwick.boarding.contractor.offboarding"),
			extend = gs.getProperty("sedgwick.boarding.contractor.extension"),
			first = this.getAllContractors().join(","),
			buffer,
			rows,
			row,
			i;

		// gs.log("Contractor Data Query: ");
		rows = this.colleagueStateData(offboard, first, null, extend);
		for(i=0; i<rows.length; i++) {
			row = rows[i];
			row.request_offboarding = offboard;
			row.request_extension = extend;
		}
		// gs.log(" - : " + JSON.stringify(row, null, 4));
		return rows;
	},
	/**
	 * 
	 * @method getPreTerms
	 * @returns {Array}
	 */
	"getPreTerms": function () {
		var employees = this.getUsersByBoardingStatus(false, false, "preterm");
		// The original utility (YorkOnboardingUtil) added reporting contractors here as well, but those are now handled separately
		return employees;
	},

	"getDeparturesDataSet": function() {
		var item = gs.getProperty("colleague.offboarding.item"),
			// item = gs.getProperty("york.offboarding.item_manual"),
			first = this.getPreTerms().join(","),
			buffer,
			rows,
			row,
			i;

		rows = this.colleagueStateData(item, first);
		// Departurers currently have no status considerations to populate
		return rows;
	},
	/**
	 * 
	 * @method getOffboardingInitiated
	 * @returns {Array}
	 */
	"getOffboardingInitiated": function () {
		var employees = this.getUsersByBoardingStatus(false, false, "initiated");
		return employees;
	},
	/**
	 * 
	 * @method getOffboarded
	 * @returns {Array}
	 */
	"getOffboarded": function () {
		var employees = this.getUsersByBoardingStatus(false, false, "offboarded", "last",  gs.getProperty("colleague.boarding.table_display.inclusion.offboarding_limit", "30"));
		return employees;
	},

	"getOffboardedAndInitiatedDataSet": function() {
		var warnings = gs.getProperty("colleague.offboarding.portal_display.warnings") == true,
			item = gs.getProperty("colleague.offboarding.item"),
			// item = gs.getProperty("york.offboarding.item_manual"),
			first = this.getOffboardingInitiated().join(","),
			second = this.getOffboarded().join(","),
			employees = [],
			rows,
			row,
			i;

		// Get Base Data
		rows = this.colleagueStateData(item, first, second);
		for(i=0; i<rows.length; i++) {
			row = rows[i];
			employees.push(row.sys_id);
		}

		// STRY0208438: Additional considerations for displaying offboarded employees
		rows = rows.concat(this.getByFalloff(item, employees));
		
		// Check for warnings if set
		if(warnings) {
			for(i=0; i<rows.length; i++) {
				row = rows[i];
				if(row.request_exists) {
					if(!row.$status_text && row.approval != "approved" && (Date.now() - (new GlideDateTime(row.sys_created_on)).getNumericValue()) < (approvalWarning * TIME_Day)) {
						row.$status_text = "This request is still pending approval after " + approvalWarning + " days";
						row.$status_icon = "fa fa-exclamation-triangle";
						row.$status_class = "btn btn-warning";
					}
				}
			}
		}

		return rows;
	}
};

/**
 * Colleague of Contractor
 * @method isOnboardingRequest
 * @static
 * @param {GlideRecord} record Table: sc_request
 * @return {Boolean}
 */
SedgwickEmployeeBoardingUtility.isOnboardingRequest = function(current) {
	var colleague = new ColleagueOnboardingUtil();
	return colleague.isOnboardingRequest(current) || SedgwickEmployeeBoardingUtility.isContractorOnboardingRequest(current);
};
	
/**
 * 
 * @method isContractorOnboardingRequest
 * @static
 * @param {GlideRecord} record Table: sc_request
 * @return {Boolean}
 */
SedgwickEmployeeBoardingUtility.isContractorOnboardingRequest = function(current) {
	var gaItem = new GlideAggregate("sc_req_item");
	gaItem.addQuery("order_guide", gs.getProperty("sedgwick.boarding.contractor.onboarding"));
	gaItem.addQuery("request", current.getUniqueValue());
	gaItem.addAggregate("COUNT");
	gaItem.query();
	if (gaItem.next()) {
		return gaItem.getAggregate("COUNT") != 0;
	}
};
	
/**
 * 
 * @method getOnboardingRequestReqFor
 * @static
 * @param {GlideRecord} record Table: sc_request
 * @return {GlideRecord} Table: sys_user
 */
SedgwickEmployeeBoardingUtility.getOnboardingRequestReqFor = function (current) {
	var grItem = new GlideRecord("sc_req_item");
	grItem.addQuery("request", current.getUniqueValue());
	grItem.addQuery("order_guide", gs.getProperty("colleague.onboarding.orderguide"))
		.addOrCondition("order_guide", gs.getProperty("sedgwick.boarding.contractor.onboarding"));
	grItem.setLimit(1);
	grItem.query();
	if (grItem.next()) {
		return grItem.u_requested_for.getRefRecord();
	}
},

/**
 * 
 * @method toJSON
 * @static
 * @param {GlideRecord} record 
 * @return {Object}
 */
 SedgwickEmployeeBoardingUtility.prototype.toJSON = SedgwickEmployeeBoardingUtility.toJSON = function (record, raw) {
	raw = raw || {};
	var keys = Object.keys(record),
		json = {},
		i;

	json.$search = "";
	if (typeof (record.getValue) === "function") {
		for (i = 0; i < keys.length; i++) {
			json[keys[i]] = raw[keys[i]] ? record.getValue(keys[i]) : record.getDisplayValue(keys[i]);
		}
	} else {
		for (i = 0; i < keys.length; i++) {
			json[keys[i]] = record[keys[i]];
		}
	}

	return json;
};

SedgwickEmployeeBoardingUtility.dateToQueryString = function(date) {
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
};

/**
 * 
 * @method ammendRequestItem
 * @static
 * @param {Object} record
 * @param {GlideRecord} user 
 * @param {String} item
 * @return {String} SysID for active Request, if any
 */
 SedgwickEmployeeBoardingUtility.prototype.ammendRequestItem = SedgwickEmployeeBoardingUtility.ammendRequestItem = function (record, user, item) {
	var request = new GlideRecord("sc_req_item"),
		parent = new GlideRecord("sc_request"),
		sla = new GlideRecord("task_sla"),
		buffer,
		date;
	request.addActiveQuery();
	request.orderByDesc("sys_created_on");
	request.addQuery("u_requested_for", user.getUniqueValue());
	request.addQuery("cat_item", item)
		.addOrCondition("order_guide", item);
	request.query();
	if (request.next() && parent.get(request.getValue("request"))) {
		record.request_exists = true;

		record.request_approval = request.getValue("approval");

		record.request_status = parent.getDisplayValue("state");
		record.request_number = parent.getValue("number");
		record.request_sys_id = parent.getUniqueValue();

		// Get the furtherest out SLA for potential issues with request completion occurring after start date
		//		No real impact on end date
		sla.addQuery("task", request.getUniqueValue());
		sla.addQuery("stage", "IN", "in_progress,breached,paused");
		sla.query();
		while(sla.next()) {
			buffer = sla.getValue("planned_end_date");
			if(buffer) {
				date = (new GlideDateTime(buffer)).getNumericValue();
				if(record.request_sla_end) {
					if(record.request_sla_end < date) {
						record.request_sla_end = date;
					}
				} else {
					record.request_sla_end = date;
				}
			}
		}
	} else {
		if(!record.request_exists) {
			record.request_exists = false;
			record.request_approval = "";
			record.request_status = "";
			record.request_number = "";
			record.request_sys_id = "";
		}
	}
};

/**
 * 
 * @method colleagueStateData
 * @static
 * @param {String} item SysID
 * @param {String} first_pass System IDs, comma separated
 * @param {String} [second_pass] Or condition for System IDs from first pass
 * @param {String} [another_item] SysID of another Item to consider
 * @return {Array} 
 */
 SedgwickEmployeeBoardingUtility.prototype.colleagueStateData  = SedgwickEmployeeBoardingUtility.colleagueStateData = function (item, first_pass, second_pass, another_item) {
	var search = new GlideRecord("sys_user"),
		result = [],
		loading,
		query;

	query = search.addQuery("sys_id", "IN", first_pass);
	if (second_pass) {
		query.addOrCondition("sys_id", "IN", second_pass);
	}
	// gs.log("State Data Query: " + search.getEncodedQuery());
	search.query();
	while (search.next()) {
		loading = SedgwickEmployeeBoardingUtility.toJSON(search);
		SedgwickEmployeeBoardingUtility.ammendRequestItem(loading, search, item);
		if(another_item) {
			SedgwickEmployeeBoardingUtility.ammendRequestItem(loading, search, another_item);
		}
		loading.request_item = item;
		delete(loading.password);
		result.push(loading);
	}

	return result;
};
