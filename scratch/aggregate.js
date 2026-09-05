var records = new GlideRecord("sys_attachment"),
	ids = [];
records.addEncodedQuery("table_nameSTARTSWITHsn_si^file_nameNOT LIKEexport.sn_si");
records.query();
while (records.next()) {
	ids.push(records.getUniqueValue());
}
gs.info("Attachments[" + ids.length + "] : " + ids.join(","));