/**
 * Handles processing variables with an "sts_calculated" attribute to be filled
 * in after submission or periodically depending on the operation specified for
 * use.
 * 
 * The attribute follows the below pattern:  
 * `sts_calculated=([operation];[parameter 1];[parameter 2];...)`
 * 
 * For example `sts_calculated=(datediff;opened_at;variable.start_date)` which
 * will then use the `datediff` operation (See the `formulas` object) to then
 * calculate a value based on the `opened_by` value on the request and the
 * `start_date` variable specified for the request.
 * 
 * This specifically is meant to handle reporting level variables due to
 * limitations in Service-Now reporting around the combination of metrics
 * and catalog variables; See:
 * https://docs.servicenow.com/bundle/paris-now-intelligence/page/use/reporting/concept/rep-service-catalog-variables.html
 * 
 * The purpose here in then is to allow the easy creation of variables for the
 * purpose of replicating a metric and setting a property to kepe the value
 * set and updated without needing to generate one off scripts each time.
 * 
 * To maintain data, this script is used in business rules:  
 * + Variable Value Table (sc_item_option): /sys_script.do?sys_id=9134c7e187ec3850afc976e7cebb3586
 * + Request Items Table: /sys_script.do?sys_id=ee2303a187ec3850afc976e7cebb350a
 * 
 * The above rules handle reprocessing a request item on updates.
 * @class STSVariableReportingUtility
 * @constructor
 */
var STSVariableReportingUtility = Class.create();
STSVariableReportingUtility.prototype = {
	"type": "STSVariableReportingUtility",
	"initialize": function () {}
};

(function() {
	/**
	 * Used to find and parse out the `sts_calculated` value within a variable's attributes.
	 * @property attributeExpression
	 * @type RegExp
	 * @private
	 * @static
	 */
	var attributeExpression = new RegExp("sts_calculated=\\(([^\\)]+)\\)", "i"),
	/**
	 * Used for the .split() call against the attribute to get the operation and parameters.
	 * @property attributeSeperator
	 * @type String
	 * @private
	 * @static
	 */
		attributeSeperator = ";",
	/**
	 * This is used as an anchor to reference the various operations that are present
	 * for performing calculations. As an anchor, it allows the use of `formulas[op]`
	 * to get the appropriate function, then the parameters can be passed by calling
	 * `apply` on the function. As such, operations should NOT rely on the `this`
	 * variable at any point.
	 * 
	 * As strings are used to specify the passed values from the variable attribute,
	 * the first 2 arguments will always be the Request Item and the Variable
	 * (item_option_new) that had the sts_calculated attribute. The parameters for
	 * the operation will then follow, thus operaions should be specified similar to:  
	 * `formulas.myop = function(request, variable, param1, param2) { ... }`
	 * @property formulas
	 * @type Object
	 * @private
	 * @static
	 */
		formulas = {};

	/**
	 * Handles printing a message to gs.warn and specifically handling prefixing messages
	 * for tracability.
	 * @param {String} message To print to gs.warn .
	 */
	var warn = function(message) {
		gs.warn("STSVariableReportingUtility: " + message);
	};

	/**
	 * Get a URL path to a record.
	 * @param {GlideRecord} record To which to get a URL path.
	 * @return {String} The URL path for the instance to the passed record
	 */
	var path = function(record) {
		return "/" + record.getTableName() + ".do?sys_id=" + record.getUniqueValue()
	};

	/**
	 * Formula for processing the "datediff" operation.
	 * 
	 * Ensure that the variable in use is of type "Duration" for this formula.
	 * 
	 * # Example - General Specification:  
	 * sts_calculated=(datediff;opened_at;variables.start_date)
	 * 
	 * # Example - Override the default Schedule:  
	 * sts_calculated=(datediff;opened_at;variables.start_date;=c94f0e5d13ba5f80798ad7028144b049)
	 * 
	 * Note the "=" in the 3rd argument (4th parameter), which returns the raw value instead of
	 * attempting to resolve the value. Otherwise we would get `null` instead of the desired SysID.
	 * @method formulas.datediff
	 * @private
	 * @param {GlideRecord} request Request Item record
	 * @param {GlideRecord} question That has the specified attribute.
	 * @param {String} a The starting date for the duration consideration.
	 * @param {String} b The ending date for the duration consideration.
	 * @param {SysID} [schedule] Optional value to specify the schedule to use.
	 * @return {String} Indicating the duration between the dates in a readable
	 * 		Days/Hours format.
	 */
	formulas.datediff = function(request, question, a, b, schedule) {
		schedule = new GlideSchedule(schedule || gs.getProperty("reporting.utility.variables.schedule.default"));
		a = new GlideDateTime(a);
		b = new GlideDateTime(b);
		
		if(question.getValue("type") != 29) {
			warn("DateDiff operation prefers variables of type 'Duration' (29). A String representation will be returned instead. See Variable " + path(question));
			if(a.isValid() && b.isValid()) {
				return schedule.duration(a, b).getDisplayValue();
			}
		} else {
			if(a.isValid() && b.isValid()) {
				return schedule.duration(a, b).getValue();
			}
		}
		
		return null;
	};
	
	/**
	 * Find all active request items that have a variable with an sts_calculated variable
	 * specified.
	 * @method getRelevantActiveItems
	 */
	STSVariableReportingUtility.getRelevantActiveItems = function() {

	};

	/**
	 * 
	 * @method guarenteeVariable
	 * @param {Array | GlideRecord} items Specifying the request items for which the sts_calculated
	 * 		variables should be created if they do not exist.
	 */
	STSVariableReportingUtility.guarenteeVariable = function(items) {

	};

	/**
	 * Find relevant variables that have an `sts_calculated` attribute and update the
	 * associated values as needed.
	 * @method updateItem
	 * @param {GlideRecord} request Request Item (sc_req_item) that has recently changed
	 * 		or been submitted to have the sts_calculated variables completed.
	 */
	STSVariableReportingUtility.updateItem = function(request) {
		var calculating,
			attributes,
			parameters,
			questions,
			variables,
			operation,
			value,
			item,
			vIDs,
			i;

		item = new GlideRecord("sc_cat_item");
		item.get(request.getValue("cat_item"));

		variables = new GlideRecord("sc_item_option_mtom");
		variables.addQuery("request_item", request.getUniqueValue());
		variables.query();
		vIDs = [];
		while(variables.next()) {
			vIDs.push(variables.getValue("sc_item_option"));
		}

		questions = new GlideRecord("item_option_new");
		questions.addActiveQuery();
		questions.addQuery("attributes", "CONTAINS", "sts_calculated=");
		questions.addQuery("cat_item", item.getUniqueValue());
		questions.query();
		while(questions.next()) {
			attributes = questions.getValue("attributes");
			attributes = attributeExpression.exec(attributes);
			if(attributes) {
				attributes = attributes[1].split(attributeSeperator);
				operation = attributes.shift().toLowerCase();

				calculating = new GlideRecord("sc_item_option");
				calculating.addQuery("item_option_new", questions.getUniqueValue());
				calculating.addQuery("sys_id", "IN", vIDs.join(","));
				calculating.query();
				while(calculating.next()) { // Shuold only be one value
					parameters = [request, questions];
					for(i=0; i<attributes.length; i++) {
						parameters[i + 2] = getValue(request, attributes[i]);
					}
					if(formulas[operation]) {
						value = formulas[operation].apply(formulas[operation], parameters);
					} else {
						warn("Unknown Operation[" + operation + "] Requested for " + request.getValue("number") + " in Variable[" + path(variables) + "].");
					}
					if(value === null) {
						warn("Null Value recevied for Operation[" + operation + "] Requested for " + request.getValue("number") + " in Variable[" + path(variables) + "].");
					}
					calculating.setWorkflow(false); // This is aimed at preventing this update from triggering this process
					calculating.setValue("value", value);
					calculating.update();
				}
			} else {
				warn("Malformed Attribute for sts_calculated Requested for " + request.getValue("number") + " in Variable[" + path(questions) + "].");
			}
		}
	};
    
	/**
     * Get a described value from the request item or its variables.
	 * 
	 * This method handles processing the "parameters" before they are
	 * passed to the specified operation.
	 * 
	 * A flat variable value such as "opened_at" or "number" is pulled
	 * from the record.
	 * 
	 * A variable value that starts with "variable" or "variables" is
	 * treated as a request variable look up. For example, if the
	 * value for variable was "variables.start_date" then this method
	 * would find the "start_date" variable associated with the request
	 * item and return the value that was specified for it. The part
	 * after "variable" may also be the question text or the SysID for
	 * the question, thus "variables.My Manager Is" as well as
	 * "variables.d9b78a6d87683850afc976e7cebb35ef" are valid values
	 * to specify in the attribute.
	 * 
	 * At this time, other cases, such as "user.location.name" are passed
	 * to the request's "getValue" function for GlideRecord to resolve.
     * @method getValue
     * @static
     * @param {GlideRecord} request Request Item (sc_req_item)
     * @param {String} variable Naming the variable or a path to it. Specify
     *      "variables" to gather the value of the catalog's variable
     *      mathing the name (Or SysID) instead.
     * @return The determined value or null.
     */
    var getValue = STSVariableReportingUtility.getValue = function(request, variable) {
		if(variable && variable.length && (variable[0] === ":" || variable[0] === "=")) {
			return variable.substring(1);
		}

		var parts = variable.split("."),
			question,
			item,
			link,
			ids;
		
		item = new GlideRecord("sc_cat_item");
		item.get(request.getValue("cat_item"));

		if(parts.length === 2 && (parts[0] === "variable" || parts[0] === "variables")) {
			question = new GlideRecord("item_option_new");
			question.addActiveQuery();
			question.addQuery("cat_item", item.getUniqueValue());
			question.addQuery("name", parts[1])
				.addOrCondition("question_text", parts[1])
				.addOrCondition("sys_id", parts[1]);
			question.query();
			if(question.next()) {
				link = new GlideRecord("sc_item_option_mtom");
				link.addQuery("request_item", request.getUniqueValue());
				link.query();
				ids = [];
				while(link.next()) {
					ids.push(link.getValue("sc_item_option"));
				}

				variable = new GlideRecord("sc_item_option");
				variable.addQuery("item_option_new", question.getUniqueValue());
				variable.addQuery("sys_id", "IN", ids.join(","));
				variable.query();
				if(variable.next()) {
					return variable.getValue("value");
				}
			}

			return null;
		}
		return request.getValue(variable);
	};

	/**
	 * Print the Question Text of variables associated with the passed request along
	 * with the location of their values and questions.
	 * 
	 * This is purely a debugging tool.
	 * @param {GlideRecord} request Request Item (sc_req_item)
	 */
	STSVariableReportingUtility.nameItemVariables = function(request) {
		var report = "",
			count = 0,
			questions,
			variables,
			question,
			value;

		variables = new GlideRecord("sc_item_option_mtom");
		variables.addQuery("request_item", request.getUniqueValue());
		variables.query();
		while(variables.next()) {
			value = new GlideRecord("sc_item_option");
			value.get(variables.getValue("sc_item_option"));

			question = new GlideRecord("item_option_new");
			question.get(value.getValue("item_option_new"));
			report += "\n + " + question.getValue("question_text") + " [ Variable: " + path(question) + " , Value: " + path(value) + " ]";
			count++;
		}
		gs.info("# " + request.getValue("number") + " Listed Variables(" + count + "):" + report);
	};
})();
