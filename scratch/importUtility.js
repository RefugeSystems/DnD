var STSImportSetUtility = Class.create();
/**
 * Utility class for managing and importing data into import sets.
 * @class STSImportSetUtility
 * @constructor
 * @param {GlideRecord} [set] Optional record to point this utility to a specific
 * 		import set by default.
 */
STSImportSetUtility.prototype = {
	"type": "STSImportSetUtility",
	"initialize": function(table, set) {
		/**
		 * Names the table beung used for import.
		 * @property table
		 * @type String
		 */
		this.table = table;
		/**
		 * The import set to which this utility is currently attached. This will
		 * act as a default for import sets if present.
		 * @property set
		 * @type GlideRecord
		 * @default Null
		 */
		this.set = set || null;
	},
	/**
	 * Create an Import Set for the specified table.
	 * @method create
	 * @param {String} table 
	 * @return {GlideRecord} The created import set.
	 */
	"create": function(table) {
		var set = new GlideRecord("sys_import_set"),
			id;
		set.setValue("table_name", table);
		id = set.insert();
		set = new GlideRecord("sys_import_set");
		set.get(id);
		this.set = set;
		return set;
	},
	/**
	 * Run all transformMaps associated with the passed import set.
	 * @method initiateAllTransforms
	 * @see: https://sedgwickdev.service-now.com/sys_script.do?sys_id=448824870a0a0b24000b128f92f7c975
	 * @param {GlideRecord | String} importSet For where to run the transformations.
	 * @param {String} [name] Optional to name the import log.
	 */
	"initiateAllTransforms": function(importSet, name) {
		importSet = importSet || this.set || null;
		var importSetRun,
			importSetId,
			importLog,
			rows,
			ist;

		if(importSet) {
			if(importSet instanceof GlideRecord) {
				importSetId = importSet.getUniqueValue();
				importSetRun = new GlideImportSetRun(importSetId);
				importLog = new GlideImportLog(importSetRun, name || "Set Transform");
				ist = new GlideImportSetTransformer();
			} else if(typeof(importSet) == "string") {
				importSetId = importSet;
				importSet = new GlideRecord("sys_import_set");
				importSet.get(importSetId);
				importSetRun = new GlideImportSetRun(importSetId);
				importLog = new GlideImportLog(importSetRun, name || "Set Transform");
				ist = new GlideImportSetTransformer();
			}

			rows = new GlideRecord(this.table);
			rows.addQuery("sys_import_set", importSetId);
			rows.query();
			while(rows.next()) {
				ist.setLogger(importLog);
				ist.setImportSetRun(importSetRun);
				ist.setImportSetID(importSetId);
				ist.setSyncImport(true);
				ist.transformAllMaps(importSet, rows.getUniqueValue());
			}
		}
	},
	/**
	 * Load the values from a javascript object to a table, creating the missing fields in the process.
	 * 
	 * Note:
	 * Creating fields on the fly sometimes results in the object being loaded missing the values for the
	 * newly created fields, so test runs are recommended to test the connection and also to generate any
	 * fields that may be needed if leveraging this. Otherwise, new fields will appear as the loads run.
	 * @method loadRecord
	 * @param {Object} data Specifying the data to add. The object keys are treated as field names but
	 * 		are prefixed with "u_" for Service-Now's tables.
	 * @param {GlideRecord} [set] Optional import set to which to tie the record.
	 * @returns {GlideRecord} Of the inserted record.
	 */
	"loadRecord": function(data, set) {
		set = set || this.set;
		var record = new GlideRecord(this.table),
			fields = Object.keys(data),
			field,
			value,
			type,
			len,
			i;

		record.initialize();
		for(i = 0; i < fields.length; i++) {
			field = "u_" + fields[i].toLowerCase();
			value = data[fields[i]];
			if(!record.isValidField(field)) {
				global.SncTableEditor.createElement(this.table, fields[i], field, field, 3000, /* type: This doesn't work at all, in anyway, just load as a string */ "", "", "");
			}
			if(value || value === 0 || value === false) {
				if(typeof(value) == "string") {
					record.setValue(field, value);
				} else {
					record.setValue(field, JSON.stringify(value));
				}
			} else {
				record.setValue(field, "");
			}
		}

		if(set) {
			record.setValue("sys_import_set", set.getUniqueValue());
		}

		record.insert();
		return record;
	}
};

/**
 * 
 * @method tableExists
 * @static
 * @param {String} name 
 * @returns {Boolean} Indicating if the named table already exists.
 */
 STSImportSetUtility.tableExists = function (name) {
	var ga = new GlideAggregate("sys_db_object");
	ga.addQuery("name", name);
	ga.addAggregate("COUNT", "name");
	ga.query();
	if (ga.next()) {
		return ga.getAggregate("COUNT", "name") == 1;
	}
	return false;
};
