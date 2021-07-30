(function() {
	var source = new GlideRecord("u_seamless_ai_data_export"),
		company;
	source.get("77251a8287a93890afc976e7cebb3547");
	company = SAIUtility.matchCompany(source, SAIUtility.MAPS.sai_company, SAIUtility.KEYS.sai_company);
	if(company) {
		gs.info("Match Found[" + company.getValue("name") + "]:\n" + SAIUtility.linkRecord(company));
	} else {
		gs.info("No Match Found");
	}
})();
