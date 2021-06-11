(function() {

	/* *
	
	var day = 1000*60*60*24;
	var r = new GlideDateTime("2021-06-04 21:15:40"),
		v = r.getNumericValue();
	r.setNumericValue(v - (v%day));
	gs.info("V: " + r.getDisplayValue() + " @" + r.getNumericValue());
	var d = new GlideDuration("1970-01-16 00:00:00");
	d.add(day);
	gs.info(d.getDisplayValue());
	
	/* */
	
	/* */
	var item = new GlideRecord("sc_req_item");
	item.addQuery("cat_item", "41560ce11338270002d830128144b03d");
	item.query();
	while(item.next()) {
	gs.info("Item: " + item.getValue("number"));
	STSVariableReportingUtility.updateItem(item);
	}
	/* *
	
	var item = new GlideRecord("sc_req_item");
	item.get("0eb4083787283490afc976e7cebb357f");
	gs.info("Item: " + item.getValue("number"));
	STSVariableReportingUtility.updateItem(item);
	
	/* */
	
	
	})();