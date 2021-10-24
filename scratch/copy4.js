var YorkOnboardingUtil = Class.create();
YorkOnboardingUtil.prototype = {
	initialize: function(user) {

		if (!user) {
			this.user = gs.getUserID();
		} else {
			this.user = user;
		}

		this.delegates = new YorkDelegateUtil().getDelegates('u_onboarding_activities', this.user);
	},

	isOnboardingRequest: function(current) {

		var gaItem = new GlideAggregate('sc_req_item');
		gaItem.addQuery('order_guide', gs.getProperty('york.onboarding.order_guide'));
		gaItem.addQuery('request', current.getUniqueValue());
		gaItem.addAggregate('COUNT');
		gaItem.query();

		if (gaItem.next())
			return gaItem.getAggregate('COUNT') != 0;

	},

	getOnboardingRequestReqFor: function(current){
		var grItem = new GlideRecord('sc_req_item');
		grItem.addQuery('request', current.getUniqueValue());
		grItem.addQuery('order_guide', gs.getProperty('york.onboarding.order_guide'));
		grItem.setLimit(1);
		grItem.query();
		if(grItem.next())
			return grItem.u_requested_for.getRefRecord();
	},

	getOnboardingStatus: function() {

		var status = "";
		var grUser = new GlideRecord('sys_user');
		if(grUser.get(this.user)){

			status = grUser.getValue('u_onboarding_status');

		}

		return status;
	},


	setOnboardingStatus: function(status) {

		var grUser = new GlideRecord('sys_user');
		if(grUser.get(this.user)){

			grUser.setValue('u_onboarding_status', status);
			grUser.update();

		}
	},

	generateReminders: function() {
		var userQuery = gs.getProperty('york.onboarding.reminder_query');

		var usr = new GlideRecord('sys_user'), hierarchy = [], uniqueMgrKey = [];
		usr.addEncodedQuery(userQuery);
		usr.query();
		while (usr.next()) {
			var usrInfo = [usr.name.toString(), usr.company.getDisplayValue()];
			var mgr = usr.manager.toString();
			var mgrKey = uniqueMgrKey.indexOf(mgr);
			if (mgrKey == -1) { //Manager not in the list yet, create new object/key
				var mgrObj = {};
				mgrObj.manager = mgr;
				mgrObj.emps = [];
				mgrObj.emps.push(usrInfo);
				
				hierarchy.push(mgrObj);
				uniqueMgrKey.push(mgr);
			} else { //Manager exists, just add employee
				hierarchy[mgrKey].emps.push(usrInfo);
			}
		}
		this._processManagers(hierarchy);
	},

	_processManagers: function(hierarchy) {
		for (var mgr in hierarchy) {
			var mgrInfo = new GlideRecord('sys_user');
			mgrInfo.get(hierarchy[mgr].manager);
			if (mgrInfo.active == true) {
				gs.eventQueue('york.onboarding.offboarding.reminder', mgrInfo, mgrInfo.email, JSON.stringify(hierarchy[mgr].emps));
			}
		}
	},

	getNewHires: function() {

		var employees = [];

		// Get all Direct Reports
		var directReports = this._getNewHire('manager');
		while (directReports.next()) {
			employees.push(directReports.getValue('sys_id'));
		}

		return employees;

	},

	getInitiated: function() {

		var employees = [];

		// Get all Direct Reports
		var directReports = this._getInitiated('manager');
		while (directReports.next()) {
			employees.push(directReports.getValue('sys_id'));
		}

		return employees;

	},

	getOnboarded: function() {

		var employees = [];

		// Get all Direct Reports
		var directReports = this._getOnboarded('manager');
		while (directReports.next()) {
			employees.push(directReports.getValue('sys_id'));
		}

		return employees;

	},

	hasNewHires: function() {

		// Check for Direct Reports & Indirect Reports
		var directReports = this._getNewHireCount('manager');
		return directReports != 0;

	},

	hasInitiated: function() {

		// Check for Direct Reports & Indirect Reports
		var directReports = this._getInitiatedCount('manager');
		return directReports != 0;

	},

	hasOnboarded: function() {

		// Check for Direct Reports & Indirect Reports
		var directReports = this._getOnboardedCount('manager');
		return directReports != 0;

	},

	_getNewHire: function(queryField) {

		// Get all employees that report up to this person
		var grUser = new GlideRecord('sys_user');
		grUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		grUser.addQuery('u_onboarding_status', 'pre-hire');
		grUser.addQuery(queryField, 'IN', this.delegates);
		grUser.query();

		return grUser;

	},

	_getInitiated: function(queryField) {

		// Get all employees that report up to this person
		var grUser = new GlideRecord('sys_user');
		grUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		grUser.addQuery('u_onboarding_status', 'initiated');
		grUser.addQuery(queryField, 'IN', this.delegates);
		grUser.query();

		return grUser;

	},

	_getOnboarded: function(queryField) {

		// Get all employees that report up to this person
		var grUser = new GlideRecord('sys_user');
		grUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		grUser.addQuery('u_onboarding_status', 'onboarded');
		grUser.addQuery('u_start_dateRELATIVEGE@dayofweek@ago@30');
		grUser.addQuery(queryField, 'IN', this.delegates);
		grUser.query();

		return grUser;

	},

	_getNewHireCount: function(queryField) {

		// Get all employees that report up to this person
		var gaUser = new GlideAggregate('sys_user');
		gaUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		gaUser.addQuery('u_onboarding_status', 'pre-hire');
		gaUser.addQuery(queryField, 'IN', this.delegates);
		gaUser.addAggregate('COUNT');
		gaUser.query();

		if (gaUser.next())
			return gaUser.getAggregate('COUNT');

	},

	_getInitiatedCount: function(queryField) {

		// Get all employees that report up to this person
		var gaUser = new GlideAggregate('sys_user');
		gaUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		gaUser.addQuery('u_onboarding_status', 'initiated');
		gaUser.addQuery(queryField, 'IN', this.delegates);
		gaUser.addAggregate('COUNT');
		gaUser.query();

		if (gaUser.next())
			return gaUser.getAggregate('COUNT');

	},

	_getOnboardedCount: function(queryField) {

		// Get all employees that report up to this person
		var gaUser = new GlideAggregate('sys_user');
		gaUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		gaUser.addQuery('u_onboarding_status', 'onboarded');
		gaUser.addQuery('u_start_dateRELATIVEGE@dayofweek@ago@30');
		gaUser.addQuery(queryField, 'IN', this.delegates);
		gaUser.addAggregate('COUNT');
		gaUser.query();

		if (gaUser.next())
			return gaUser.getAggregate('COUNT');

	},


	/* Offboarding Functions*/

	getPreTerms: function() {

		var employees = [];

		// Get all Direct Reports
		var directReports = this._getPreTerms('manager');
		while (directReports.next()) {
			employees.push(directReports.getValue('sys_id'));
		}

		return employees;

	},

	getOffboardingInitiated: function() {

		var employees = [];

		// Get all Direct Reports
		var directReports = this._getOffboardingInitiated('manager');
		while (directReports.next()) {
			employees.push(directReports.getValue('sys_id'));
		}

		return employees;

	},

	getOffboarded: function() {

		var employees = [];

		// Get all Direct Reports
		var directReports = this._getOffboarded('manager');
		while (directReports.next()) {
			employees.push(directReports.getValue('sys_id'));
		}

		return employees;

	},

	_getPreTerms: function(queryField) {

		var ids = [];

		// Get all employees that report up to this person
		var grOffUser = new GlideRecord('sys_user');
		grOffUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID');
		grOffUser.addQuery('u_offboarding_status', 'preterm');
		grOffUser.addQuery(queryField, 'IN', this.delegates);
		grOffUser.query();

		while (grOffUser.next()) {

			ids.push(grOffUser.getUniqueValue());
		}

		// Get all contractors that report to this person
		var grContractorUser = new GlideRecord('sys_user');
		grContractorUser.addActiveQuery();
		grContractorUser.addQuery('u_employee_type', 'contractor');
		grContractorUser.addQuery('u_offboarding_status', '');
		grContractorUser.addQuery(queryField, 'IN', this.delegates);
		grContractorUser.query();

		while (grContractorUser.next()) {

			ids.push(grContractorUser.getUniqueValue());
		}

		// Combine the two lists
		var grUser = new GlideRecord('sys_user');
		grUser.addEncodedQuery('sys_idIN' + ids.toString());
		grUser.query();

		return grUser;

	},


	_getOffboardingInitiated: function(queryField) {

		// Get all employees that report up to this person
		var grUser = new GlideRecord('sys_user');
		grUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		grUser.addQuery('u_offboarding_status', 'initiated');
		grUser.addQuery(queryField, 'IN', this.delegates);
		grUser.query();

		return grUser;

	},

	_getOffboarded: function(queryField) {

		// Get all employees that report up to this person
		var grUser = new GlideRecord('sys_user');
		grUser.addQuery('u_employee_type', 'IN', 'Employee_ID,Contingent_Worker_ID,contractor');
		grUser.addQuery('u_offboarding_status', 'offboarded');
		grUser.addQuery('u_last_day_of_workRELATIVEGE@dayofweek@ago@30');
		grUser.addQuery(queryField, 'IN', this.delegates);
		grUser.query();

		return grUser;

	},

	getPreTermsCount: function() {

		return this.getPreTerms().length;
	},

	getOffboardingInitiatedCount: function() {

		return this.getOffboardingInitiated().length;
	},

	getOffboardedCount: function() {

		return this.getOffboarded().length;
	},




	// Email Helper Utilities
	getStepFromSubject: function(email) {

		var subject = email.subject.toString();

		var newEmployeeYork = /^\s*Hello, here is some info on our new employee!\s*$/i;
		var newEmployeeEV5 = /^\s*Candidate Selected\s*$/i;
		var employeeCleared = /^User cleared to start/i;
		var employeeCancelled = /^User event cancelled/i;

		switch(true) {

			case newEmployeeYork.test(subject) || newEmployeeEV5.test(subject):
				return "create";
			case employeeCleared.test(subject):
				return "clear";
			case employeeCancelled.test(subject):
				return "cancel";
			default:
				return null;
		}
	},

	createUser: function(email) {

		// Check if there is already as user with the same employee number
		var grUser = new GlideRecord("sys_user");
		//grUser.addActiveQuery(); //Commented out for STRY0113339
		grUser.addQuery('employee_number', email.body.id.replace(/w/ig, ''));
		grUser.query();

		//if (grUser.hasNext()) {
		if (grUser.next()) {
			//Addition for STRY0113339
			grUser.setValue('active', true);
			grUser.setValue('u_offboarding_status', '');
			grUser.setValue('u_offboard_type', '');
			grUser.setValue('u_last_day_of_work', '');
			grUser.setValue('u_start_date', email.body.target_hire_date.replace(/\s/g, '-'));
			//grUser.setValue('u_onboarding_status', 'pre-hire');
			grUser.setValue('u_cleared', false);
			grUser.setValue('locked_out', false);
			grUser.update();
			//End addition for STRY0113339

			// Do nothing
			return;
		} else {

			// Create a new user
			grUser.initialize();

			grUser.setValue("employee_number", email.body.id.replace(/w/ig, ''));
			grUser.setValue("name", email.body.name);
			grUser.setValue("title", email.body.title);
			grUser.setValue("company", this.getCompany(email.body.company));
			grUser.setValue("department", this.getDepartment(email.body.department));
			grUser.setValue("cost_center", this.getCostCenter(email.body.department));
			grUser.setValue("manager", this.getManager(email.body.reports_to));
			grUser.setValue("location", this.getLocation(email.body.location));
			grUser.setValue("u_start_date", email.body.target_hire_date.replace(/\s/g, '-'));
			grUser.setValue("user_name", email.body.id.replace(/w/ig, ''));

			if (email.body.york_paygroup) {
				grUser.setValue('u_onboarding_status', 'pre-hire');
				grUser.setValue('u_integration_source', 'EV5');
			} else 
				grUser.setValue('u_integration_source', 'workday_email');
			
			grUser.setValue('u_employee_type', 'Employee_ID');
			grUser.insert();

		}
	},

	clearUser: function(email) {

		// Check for an employee number in the body
		var regex = / - (.+?(?=\s))/gm;
		var id = regex.exec(email.body_text);

		if (id) {

			// get the actual value for employee number
			var employeeNumber = id[1];
			employeeNumber = employeeNumber.replace(/w/ig, '');

			// check for the person to update
			var grUser = new GlideRecord('sys_user');
			grUser.addActiveQuery();
			grUser.addQuery('employee_number', employeeNumber);
			grUser.query();

			if (grUser.next()) {

				// Mark them as cleard
				grUser.setValue('u_cleared', true);
				grUser.update();
			}
		}
	},

	cancelUser: function(req_id) {

		// Check for an employee number in the body
		var regex = / - (.+?(?=\s))/gm;
		var id = regex.exec(email.body_text);

		if (id) {

			// get the actual value for employee number
			var employeeNumber = id[1];
			employeeNumber = employeeNumber.replace(/w/ig, '');

			// check for the person to update
			var grUser = new GlideRecord('sys_user');
			grUser.addActiveQuery();
			grUser.addQuery('employee_number', employeeNumber);
			grUser.query();

			if (grUser.next()) {

				// Mark them as cleard
				grUser.setValue('u_cleared', false);
				grUser.setValue('u_onboarding_status', 'cancelled');
				grUser.setValue('active', false); //added 2019-05-14 per STRY0096671
				grUser.setValue('locked_out', true); //added 2019-05-14 per STRY0096671
				grUser.update();
			}
		}
	},

	getCompany: function(company) {

		if (company) {

			if (email.body.york_paygroup.replace(/w/ig, '') == 'Yes')
				return gs.getProperty('york.onboarding.york_company_id');
			var grCompany = new GlideRecord('core_company');
			grCompany.addQuery('name', company);
			grCompany.addQuery('u_source', gs.getProperty('york.cwt.workday.id'));
			grCompany.query();

			if (grCompany.next()) {

				return grCompany.getUniqueValue();
			}
		}

		gs.info("Company does not exist in the system: " + company, "YorkOnboardingUtil.getCompany");
		return '';
	},

	getDepartment: function(department) {

		if (department) {

			var grDepartment = new GlideRecord('cmn_department');
			grDepartment.addQuery('name', department.trim());
			//grDepartment.addQuery('u_source', gs.getProperty('york.cwt.workday.id'));
			grDepartment.query();

			if (grDepartment.next()) {

				return grDepartment.getUniqueValue();
			}
		}

		gs.info("Department does not exist in the system: " + department, "YorkOnboardingUtil.getDepartment");
		return '';
	},

	getCostCenter: function(costCenter) {

		if (costCenter) {

			var grCostCenter = new GlideRecord('cmn_cost_center');
			grCostCenter.addQuery('name', costCenter);
			//grCostCenter.addQuery('u_source', gs.getProperty('york.cwt.workday.id'));
			grCostCenter.query();

			if (grCostCenter.next()) {

				return grCostCenter.getUniqueValue();
			}
		}

		gs.info("Cost Center does not exist in the system: " + costCenter, "YorkOnboardingUtil.getCostCenter");
		return '';
	},

	getManager: function(manager) {

		if (manager) {

			var grUser = new GlideRecord('sys_user');
			grUser.addActiveQuery();
			grUser.addQuery('employee_number', manager);
			grUser.query();

			if (grUser.next()) {

				return grUser.getUniqueValue();
			}
		}

		gs.info("Manager does not exist in the system: " + manager, "YorkOnboardingUtil.getManager");
		return '';
	},

	getLocation: function(location) {

		if (location) {

			var grLocation = new GlideRecord('cmn_location');
			grLocation.addQuery('name', location);
			grLocation.addQuery('u_source', gs.getProperty('york.cwt.workday.id'));
			grLocation.query();

			if (grLocation.next()) {

				return grLocation.getUniqueValue();
			}
		}

		gs.info("Cost Center does not exist in the system: " + location, "YorkOnboardingUtil.getLocation");
		return '';
	},


	getVisibleItems: function(query) {

		var items = [];
		var grItem = new GlideRecord('sc_cat_item');
		grItem.addEncodedQuery(query);
		grItem.query();

		while (grItem.next()) {

			var catItem = new sn_sc.CatItem(grItem.getUniqueValue());
			if (catItem.canView() && catItem.isVisibleServicePortal()) {

				items.push(grItem.getUniqueValue());
			}
		}

		return items.toString();
	},






	/**
 			* Used to pull cost centers items from the cmn cost centers table that
 			* are present in the catalog options table for the indicated catalog
 			* item.
 			*
 			* @method getUsedCatalogOptionCostCenters
 			* @param {SystemID} catItem The sys_id for the category item against
 				*      which to get the approved cost centers from the catalog options
 				*      table.
 				* @return {String} Search string for use in reference qual fields for
 					*      catalog variables.
 					*/
	getUsedCatalogOptionCostCenters: function(catItem, catName) {
		var result, grTable = new GlideRecord("u_catalog_options");
		grTable.addEncodedQuery("u_catalog_item%3D" + catItem);
		grTable.query();

		result = [];
		while(grTable.next()) {
			result.push(grTable.getValue("u_cost_center"));
		}
		result = result.join(",");

		grTable = new GlideRecord("cmn_cost_center");
		// Reference Qualifier does NOT accept "NOT IN" as a query, but a URL search does
		grTable.addQuery("sys_id", "IN", result);
		grTable.query();

		result = [];
		while(grTable.next()) {
			result.push(grTable.getValue("sys_id"));
		}
		result = "sys_idIN" + result.join(",");

		return result;
	},
	/**
 					* Used to pull catalog option items from the catalog options table where
 					* that cost center is not tied to catalog option.
 					*
 					* @method getUnusedCatalogOptionCostCenters
 					* @param {SystemID} catItem The sys_id for the category item against
 						*      which to get the approved cost centers from the catalog options
 						*      table.
 						* @return {String} Search string for use in reference qual fields for
 							*      catalog variables.
 							*/
	getUnusedCatalogOptionCostCenters: function(catItem, catName) {
		var result, grTable = new GlideRecord("u_catalog_options");
		grTable.addEncodedQuery("u_catalog_item%3D" + catItem);
		grTable.query();

		result = [];
		while(grTable.next()) {
			result.push(grTable.getValue("u_cost_center"));
		}
		result = result.join(",");

		grTable = new GlideRecord("cmn_cost_center");
		// Reference Qualifier does NOT accept "NOT IN" as a query, but a URL search does
		grTable.addQuery("sys_id", "NOT IN", result);
		grTable.query();

		result = [];
		while(grTable.next()) {
			result.push(grTable.getValue("sys_id"));
		}
		result = "sys_idIN" + result.join(",");

		return result;
	},

	type: 'YorkOnboardingUtil'
};
