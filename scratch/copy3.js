var STSUserUtility = Class.create();
/**
 * 
 * @class STSUserUtility
 * @extends AbstractAjaxProcessor
 * @constructor
 */
STSUserUtility.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	"type": "STSUserUtility",
	"constructor": function() {
		
	},
	/**
	 * 
	 * @method getUser
	 * @throws Error
	 * @param {String | GlideRecord | Object} user 
	 * @returns {GlideRecord} 
	 */
	"getUser": function(user) {
		if(user instanceof GlideRecord) {
			return user;
		}
		
		user = user || this.getParameter("user") || this.getParameter("sysparm_user") || this.getParameter("sys_param_user");
		var record = new GlideRecord("sys_user");
		
// 		gs.info("User: " + user);
		if(gs.nil(user) || !user || user == null || user == undefined || user == "undefined") {
			user = gs.getUserID();
		} else {
			user = JSON.parse(JSON.stringify(user)); // Remove Java.lang.String issues from GlideAjax
		}
		if(typeof(user) == "string") {
			if(!record.get(user)) {
				throw new Error("STSUserUtility - Unable to find User: " + user);
			}
		} else {
			throw new Error("STSUserUtility - No User Specified? " + user);
		}
		
		return record;
	},
	/**
	 * 
	 * @method getDetails
	 * @param {String | GlideRecord} user 
	 * @param {Boolean} mobile 
	 * @returns {String} JSON with different properties for the user; manager, location, country, and state.
	 * 		Contains a "display" and "value" property to distinguish various values.
	 */
	"getDetails": function(user, mobile) {
		var record = this.getUser(user),
			result = {};
		if(mobile) {
			result.phone = this.getPhone(record, mobile);
		}

		result.display = {};
		result.display.country = record.getDisplayValue("u_country_ref");
		result.display.location = record.getDisplayValue("location");
		result.display.manager = record.getDisplayValue("manager");
		result.display.state = record.getDisplayValue("state");

		result.value = {};
		result.value.country = record.getValue("u_country_ref");
		result.value.location = record.getValue("location");
		result.value.manager = record.getValue("manager");
		result.value.state = record.getValue("state");
		return JSON.stringify(result);
	},
	/**
	 * 
	 * @method getPhone
	 * @param {String | GlideRecord} user 
	 * @param {Boolean} [mobile] When true, returns the mobile phone insread of the business phone.
	 * @returns {String}
	 */
	"getPhone": function(user, mobile) {
		var record = this.getUser(user);
		if(mobile) {
			return record.getValue("mobile_phone") || record.getValue("phone");
		}
		return record.getValue("phone") || record.getValue("mobile_phone");
	},
	/**
	 * 
	 * @method getEmail
	 * @param {String | GlideRecord} user 
	 * @returns {String}
	 */
	"getEmail": function(user) {
		var record = this.getUser(user);
		return record.getValue("email");
	},
	/**
	 * 
	 * @method getManager
	 * @param {String | GlideRecord} user 
	 * @returns {String}
	 */
	"getManager": function(user) {
		var record = this.getUser(user);
// 		gs.info("User: " + record.getUniqueValue() + " - " + record.getUniqueValue() + " - Manager: " + record.getValue("manager"));
		return record.getValue("manager");
	},
	/**
	 * 
	 * @method getLocation
	 * @param {String | GlideRecord} user 
	 * @returns {String}
	 */
	"getLocation": function(user) {
		var record = this.getUser(user);
		return record.getValue("location");
	},
	/**
	 * 
	 * @method getCountry
	 * @param {String | GlideRecord} user 
	 * @returns {String}
	 */
	"getCountry": function(user) {
		var record = this.getUser(user);
		return record.getValue("u_country_ref");
	},
	/**
	 * 
	 * @method getState
	 * @param {String | GlideRecord} user 
	 * @returns {String}
	 */
	"getState": function(user) {
		var record = this.getUser(user);
		return record.getValue("state");
	}
});
