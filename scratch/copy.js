var STSUpdateSetUtility = Class.create();
/**
 * 
 * @class STSUpdateSetUtility
 * @constructor
 * @param {Object} current
 */
(function () {
	var DEFAULT_CheckLimit = 100;

	STSUpdateSetUtility.prototype = {
		"type": "STSUpdateSetUtility",
		"initialize": function (options) {
			options = options || {};
			this.checkLimit = options.limit || DEFAULT_CheckLimit;
			/**
			 * Maps tables names to values depending on the method called.
			 * @property mapping
			 * @type Object
			 */
			this.mapping = {};

			this.operations = {};

			this.creations = {};
			/**
			 * List of SysIDs or GlideRecords found while searching.
			 * @property found
			 * @type Array
			 */
			this.found = [];
			/**
			 * Tracks Table:SysID values for records created.
			 * @property created
			 * @type Array
			 */
			this.created = [];
			/**
			 * 
			 * @property SKIPS
			 * @type Object
			 */
			this.SKIPS = {};
			this.SKIPS.domains = {
				"sys_domain_path": true,
				"sys_domain": true
			};

			this.SKIPS.tables = {
				"sys_app_module": true
			}
		},
		/**
		 * 
		 * @method followReferences
		 * @param {String} table 
		 */
		"followReferences": function (table, skips) {
			var columns = new GlideRecord("sys_dictionary"),
				checks = 0,
				follow;

			columns.addQuery("internal_type", "reference");
			columns.addQuery("reference", table);
			columns.addActiveQuery();
			columns.query();
			while (columns.next() && checks++ < this.checkLimit) {
				follow = columns.getValue("name");
				if (!this.mapping[follow]) {
					this.mapping[follow] = [];
				}
				if (!skips[follow] && this.isIndexedTable(follow) && this.mapping[follow].indexOf(table) === -1) {
					this.mapping[follow].push(table);
					this.followReferences(follow);
				}
			}
		},
		/**
		 * 
		 * @method followRecord
		 * @param {GlideRecord} record Whos references should be followed to find tracked records.
		 * @param {Boolean} keep When true, GlideRecords instances are kept for the references that
		 *		are found.
		 */
		"followRecord": function (record, keep) {
			var columns = new GlideRecord("sys_dictionary"),
				checks = 0,
				reference,
				field,
				table;

			columns.addQuery("internal_type", "reference");
			columns.addQuery("reference", record.getTableName());
			columns.addActiveQuery();
			columns.query();
			while (columns.next() && checks++ < this.checkLimit) {
				field = columns.getValue("element");
				table = columns.getValue("name");
				if (!skips[table] && this.isIndexedTable(table) && !this.mapping[table]) {
					this.mapping[table] = [];
					reference = new GlideRecord(table);
					reference.addQuery(field, record.getUniqueValue());
					reference.query();
					while (reference.next()) {
						if (keep) {
							keep = new GlideRecord(reference.getTableName());
							keep.get(reference.getUniqueValue());
							this.mapping[table].push(keep);
							this.found.push(keep);
						} else {
							this.mapping[table].push(reference.getUniqueValue());
							this.found.push(reference.getUniqueValue());
						}
						this.followRecord(reference);
					}
				}
			}
		},
		/**
		 * 
		 * @method trackCreated
		 * @param {GlideRecord} record 
		 */
		"trackCreated": function(record) {
			var object = {
				"sys_id": record.getUniqueValue(),
				"url": this.getDirectURL(record),
				"table": record.getTableName()
			};
			this.creations[object.sys_id] = Date.now();
			this.created.push(object);
			return object;
		},
		"getDirectURL": function(source) {
			return "https://" + gs.getProperty("instance_name") + ".service-now.com/" + source.getTableName() + ".do?sys_id=" + source.getUniqueValue();
		},
		"deepCopy": function(record, event) {
			var start = Date.now(),
				records = {},
				destination;

			if(!event) {
				event = new GlideRecord("sysevent");
				event.initialize();
				event.setValue("name", "utility.copy");
				event.insert();
				gs.info("Created Event: " + event.getUniqueValue());
			}

			records.source = this.getDirectURL(record);
			event.setValue("descriptive_name", "Deep copy of a record");
			event.setValue("table", record.getTableName());
			event.setValue("parm1", JSON.stringify(records, null, 4));
			event.setValue("processed", new GlideDateTime());
			event.setValue("state", "ready");
			event.update();

			try {
				destination = this._deepCopy(record);
				event.setValue("state", "processed");
			} catch(exception) {
				records.error = exception;
				event.setValue("parm1", JSON.stringify(records, null, 4));
				event.setValue("state", "error");
				gs.error(exception);
			}

			records.destination = this.getDirectURL(destination);
			records.operations = this.operations;
			event.setValue("processing_duration", Date.now() - start);
			event.setValue("parm1", JSON.stringify(records, null, 4));
			event.setValue("parm2", JSON.stringify(this.created, null, 4));
			event.update();

			return destination;
		},
		"_deepCopy": function(record, replacements) {
			var checks = 0,
				reference,
				columns,
				replace,
				field,
				table,
				track,
				copy,
				keys,
				id,
				i;
			
			copy = new GlideRecord(record.getTableName());
			keys = Object.keys(record);
			copy.newRecord();
			for (i = 0; i < keys.length; i++) {
				if(replacements && replacements[keys[i]] !== undefined) {
					// gs.info("Copy of " + this.getDirectURL(record) + "[" + keys[i] + "] -> " + replacements[keys[i]]);
					copy.setValue(keys[i], replacements[keys[i]]);
				} else if(!this.SKIPS.domains[keys[i]] && !keys[i].startsWith("sys_")) {
					copy.setValue(keys[i], record.getValue(keys[i]));
				}
			}
			copy.setWorkflow(false);
			copy.insert();
			this.trackCreated(copy);

			columns = new GlideRecord("sys_dictionary");
			columns.addQuery("internal_type", "reference");
			columns.addQuery("reference", record.getTableName());
			columns.addActiveQuery();
			columns.query();
			while (columns.next() && checks++ < this.checkLimit) {
				field = columns.getValue("element");
				table = columns.getValue("name");
				replace = {};
				replace[field] = copy.getUniqueValue();
				// gs.info(" > Found Referencing Table: " + this.getDirectURL(record) + " <- " + table + "@" + field);
				if(!this.SKIPS.tables[table] && this.isIndexedTable(table)) {
					if(!this.mapping[table]) {
						this.operations[table] = {};
						this.operations[table]._toTables = {};
						this.mapping[table] = {};
					}
					this.operations[table]._toTables[field] = record.getTableName();
					reference = new GlideRecord(table);
					reference.addQuery(field, record.getUniqueValue());
					reference.query();
					while (reference.next()) {
						id = reference.getUniqueValue();
						// gs.info("    + Updating Record: " + field + " -> " + id);
						if(!this.creations[id]) {
							if(!this.mapping[table][id]) {
								// gs.info("    √ Found Reference: " + this.getDirectURL(record) + " <- " + this.getDirectURL(reference));
								track = this._deepCopy(reference, replace);
								this.operations[table][id] = {};
								this.operations[table][id].__source = this.getDirectURL(reference);
								this.operations[table][id].__copy = this.getDirectURL(track);
								this.operations[table][id][field] = replace[field];
								this.mapping[table][id] = track;
							} else {
								if(this.operations[table][id][field]) {
									// gs.info("Repeated Field Set[" + field + "]: " + this.getDirectURL(this.mapping[table][id]) + " <- " + this.getDirectURL(reference));
								} else {
									this.operations[table][id][field] = replace[field];
								}
								// gs.info("> Updating " + this.getDirectURL(this.mapping[table][id]) + "[" + keys[i] + "] -> " + replace[field]);
								this.mapping[table][id].setValue(field, replace[field]);
								this.mapping[table][id].setWorkflow(false);
								this.mapping[table][id].update();
							}
						} else {
							// gs.info("! Skipping own creation: " + this.getDirectURL(reference));
						}
					}
				}
			}

			return copy;
		},
		/**
		 * 
		 * @param {GlideRecord} record 
		 * @param {Object} skip 
		 * @param {Boolean} keepSys Keep 
		 */
		"copyRecord": function (record, skip, keepSys) {
			skip = skip || {};
			var copy = new GlideRecord(record.getTableName()),
				keys = Object.keys(record),
				i;

			copy.newRecord();
			for (i = 0; i < keys.length; i++) {
				if (!skip[keys[i]] && (!keys[i].startsWith("sys_") || (keepSys && keys[i] !== "sys_id"))) {
					copy.setValue(keys[i], record.getValue(keys[i]));
				}
			}
			copy.setWorkflow(false);
			copy.insert();
			return copy;
		},
		"deleteEventRecords": function(event) {
			if(event.getValue("state") != "cleaned") {
				var records = event.getValue("parm2");
				if(records) {
					try{ 
						records = JSON.parse(records);
					} catch(e) {
						records = false;
					}
				}
				if(records) {
					this.deleteRecords(records);
					event.setValue("state", "cleaned");
					event.update();
				}
			}
		},
		/**
		 * Pass in the utility instance's `created` property to delete any created records.
		 * @param {Array | GlideRecord} list 
		 */
		"deleteRecords": function(list) {
			var record,
				i;
			for(i=0; i<list.length; i++) {
				record = new GlideRecord(list[i].table);
				if(record.get(list[i].sys_id)) {
					record.deleteRecord();
				}
			}
		},
		/**
		 * Get a list of all records in the update set.
		 * 
		 * This is currently explicitly to allow deletion of all records
		 * with the "deleteRecords" method.
		 * @method listUpdatedRecords
		 */
		"listUpdatedRecords": function(updateSet) {
			var updates = new GlideRecord("sys_update_xml"),
				records = [],
				index,
				parts,
				name,
				id;
			
			updateSet = updateSet || (new GlideUpdateSet()).get();
			updates.addQuery("update_set", updateSet);
			updates.addQuery("action", "!=", "DELETE");
			updates.query();
			while(updates.next()) {
				parts = updates.getValue("name");
				index = parts.lastIndexOf("_");
				name = parts.substring(0, index);
				id = parts.substring(index + 1);
				records.push({
					"url": "https://" + gs.getProperty("instance_name") + ".service-now.com/" + name + ".do?sys_id=" + id,
					"table": name,
					"sys_id": id
				});
			}

			return records;
		},
		/**
		 * Delete all UpdateXML records of action = DELETE.
		 * @method cleanUpdateSet
		 * @param {String} [updateSet] Optional SysID to specify an Update Set. Defaults to the current.
		 */
		"cleanUpdateSet": function(updateSet) {
			var updates = new GlideRecord("sys_update_xml");
			updateSet = updateSet || (new GlideUpdateSet()).get();
			updates.addQuery("update_set", updateSet);
			updates.addQuery("action", "DELETE");
			updates.query();
			updates.deleteMultiple();
		},
		/**
		 * Compare GlideRecords in 2 lists.
		 * 
		 * The lists _shouold_ be equal lengths but this function loops over `a` and
		 * compares it with the corresponding values in `b` (ie. a[0] =?= b[0]).
		 * 
		 * "sys_" fields are ignored.
		 * 
		 * When using GlideRecord queries make sure the the order of the query is guarenteed.
		 * @method compareRecords
		 * @param {Array | GlideRecord} a If using a queried GlideRecord, do NOT call next()
		 * @param {Array | GlideRecord} b If using a queried GlideRecord, do NOT call next()
		 * @return {Array | Object} Noting the fields that differ or null if they match.
		 * 		A difference is returned as an array where `diff[field][0] === a[field]`,
		 * 		and `diff[field][1] === b[field]`, where diff is the returned object.
		 */
		"compareRecords": function(a, b) {
			var result = [];
			
			if(a instanceof Array && b instanceof Array) {
				for(i=0; i<a.length; i++) {
					result.push(this.compareRecord(a, b));
				}
			} else if(a instanceof Array && b instanceof GlideRecord) {
				for(i=0; i<a.length; i++) {
					if(b.next()) {
						result.push(this.compareRecord(a, b));
					}
				}
			} else if(a instanceof GlideRecord && b instanceof Array) {
				for(i=0; i<b.length; i++) {
					if(a.next()) {
						result.push(this.compareRecord(a, b));
					}
				}
			} else if(a instanceof GlideRecord &&  b instanceof GlideRecord) {
				while(a.next()) {
					b.next();
					result.push(this.compareRecord(a, b));
				}
			}

			return result;
		},

		"compareRecord": function(a, b) {
			var keys = Object.keys(a),
				diff = {},
				c = 0,
				vA,
				vB,
				i;

			for (i = 0; i < keys.length; i++) {
				vA = a.getValue(keys[i])
				vB = b.getValue(keys[i]);
				if (!keys[i].startsWith("sys_") && vA != vB) {
					diff[keys[i]] = [vA, vB];
					c++;
				}
			}
			
			if(c) {
				diff.__a = this.getDirectURL(a);
				diff.__b = this.getDirectURL(b);
				return diff;
			}
			return null;
		},
		/**
		 * 
		 * @method isIndexedTable
		 * @param {String} name Of the table to check
		 * @return {Boolean}
		 */
		"isIndexedTable": function (name) {
			var table = new GlideRecord("sys_dictionary");
			table.addQuery("name", name);
			table.addQuery("attributes", "CONTAINS", "update_synch=true");
			table.query();
			return table.next();
		},
		/**
		 * 
		 * @method addToUpdateSet
		 * @param {GlideRecord} record 
		 */
		"addToUpdateSet": function (record) {
			var manager = new GlideUpdateManager2();
			manager.saveRecord(record);
		}
	};
})();
