var STSApprovalUtiltiy = Class.create();
/**
 * 
 * @class STSApprovalUtiltiy
 * @constructor
 */
STSApprovalUtiltiy.prototype = {
	"type": "STSApprovalUtiltiy",
	"initialize": function() {

	}
};

/**
 * 
 * @method resendPendingApprovals
 * @static
 * @param {String} [sys_class] (ie. "change_request").
 * @param {String | Array} [companies] Optional restriction on the approver companies on which to resend approvals
 * 		either by name or SysID.
 * @param {Integer} [reminder_limit] Optional limit on how many reminders should be sent.
 */
STSApprovalUtiltiy.resendPendingApprovals = function(sys_class, conditions, reminder_limit) {
	var approvals = new GlideRecord("sysapproval_approver"),
		answer = [],
		approver,
		approval,
		limit,
		cond,
		i;

	approvals.addQuery("state", "requested");
	approvals.addQuery("u_reminder", true);
	if(reminder_limit) {
		approvals.addQuery("u_reminder_limit", "<", parseInt(reminder_limit))
			.addOrCondition("u_reminder_limit", null);
	}
	if(sys_class) {
		approvals.addQuery("sysapproval.sys_class_name", sys_class);
	}
	if(conditions) {
		for(i=0; i<conditions.length; i++) {
			cond = conditions[i];
			if(cond.comparison) {
				approvals.addQuery(cond.name, cond.comparison, cond.value);
			} else {
				approvals.addQuery(cond.name, cond.value);
			}
		}
	}
	approvals.orderBy("approver");
	approvals.query();
	gs.info("Pending Approval Reviews: " + approvals.getEncodedQuery());

	while(approvals.next()) {
		approver = approvals.getValue("approver");
		if(answer.indexOf(approver) == -1) {
			approval = new GlideRecord("sysapproval_approver");
			approval.get(approvals.getUniqueValue());
			answer.push(approver);
			gs.eventQueue("open.approval.reminders", approval, approver);
		}
		limit = parseInt(approvals.getValue("u_reminder_limit")) || 0;
		approvals.setValue("u_reminder_limit", limit + 1);
		approvals.update();
	}
};

/**
 * 
 * @method resendingApproval
 * @static
 * @param {GlideRecord} current Approval on which to send a reminder
 * @param {EmailOutbound} email 
 * @param {TemplatePrinter} template
 */
STSApprovalUtiltiy.resendingApproval = function(current, email, template) {
	var record = new GlideRecord(current.getValue("source_table"));
	record.get(current.getValue("document_id"));
	email.setSubject("Approval pending for " + (record.getValue("short_description") || record.getValue("number") || record.getClassDisplayValue()));
	template.print("<p>" + STSApprovalUtiltiy.getLink(current) + " is awaiting approval for " + STSApprovalUtiltiy.getLink(record) + "</p>");
	template.print("<p>You can view your pending approvals <a href=\"https://" + gs.getProperty("instance_name") + ".service-now.com/sysapproval_approver_list.do?sysparm_query=state%3Drequested%5Eapprover%3D" + current.getValue("approver") + "\">here</a>.</p>");
};

/**
 * 
 * @method getLink
 * @static
 * @param {GlideRecord} record 
 * @return {String} 
 */
STSApprovalUtiltiy.getLink = function(record) {
	return "<a href=\"https://" + gs.getProperty("instance_name") + ".service-now.com/" + record.getTableName() + ".do?sys_id=" + record.getUniqueValue() + "\">" + (record.getValue("number") || record.getClassDisplayValue()) + "</a>";
};
