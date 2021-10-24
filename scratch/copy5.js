var app = new GlideRecord("sysapproval_approver"), //set up variable to retrieve approvals that are pending
	arrUtil = new ArrayUtil(), //set up array to find all pending approvals for users
	answer = [];
	
app.addQuery("state", "requested"); //only retrieve approvals if they are pending (in requested state)
app.addQuery("sysapproval.sys_class_name", "change_request"); //only retrieve approvals for change records
app.orderBy("approver");
app.query(); //retrieve all approvals that meet our query
while(app.next()) { // step through the approvals one by one
	if(arrUtil.indexOf(answer, app.approver.sys_id) == -1) { //if the approver is not currently in our list, add them (next line adds them)
		answer.push(app.approver.sys_id);
	}
}

for(var i = 0; i < answer.length; i++) { //have array that lists each user who has open change approvals We"ll step through each
	gs.eventQueue("open.approval.reminders", app, answer[i]); //and fire off the event for each user, passing their sys_id as parm1
}
