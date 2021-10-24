/**
 * 
 * @method runMailScript
 * @param {GlideRecord} current
 * @param {TemplatePrinter} current
 * @param {EmailOutbound} email
 * @param {GlideRecord} email_action
 * @param {GlideRecord} event
 */
(function runMailScript(current, template, email, email_action,event) {
	STSApprovalUtiltiy.resendingApproval(current, template);
})(current, template, email, email_action, event);
