try {
	var RSSearch = require("../../app_ui/common/RSSearch.js");

	describe("RSCore UI RSSearch Modeling", function() {
		var universeShim = {
			"index": {
				"fields": {
					"name": {

					},
					"description": {

					},
					"referenced": {

					}
				}
			}
		};

		it("exists and runs", function() {
			console.log("Search: ", RSSearch);
			expect(RSSearch).toBeDefined();
		});

		it("parses a basic query", function() {
			var search = new RSSearch("test", true, universeShim);
			expect(search.base).toEqual(["test"]);
		});

		it("parses a basic query and finds a matching object", function() {
			var search = new RSSearch("test", true, universeShim),
				findme = {};
			findme._search = "test data";
			expect(search.isFound(findme)).toEqual(true);
		});

		it("parses a basic query and fails to 'find' an object correctly", function() {
			var search = new RSSearch("test", true, universeShim),
				findme = {};
			findme._search = "data nothing";
			expect(search.isFound(findme)).toEqual(false);
		});


		it("parses an advanced query", function() {
			var search = new RSSearch("test name:me", true, universeShim);
			expect(search.base).toEqual(["test"]);
			expect(search.field.name).toEqual(["me"]);
		});

		it("parses a basic advanced and finds a matching object", function() {
			var search = new RSSearch("test name:me", true, universeShim),
				findme = {};
			findme._search = "data";
			findme.name = "me";
			expect(search.isFound(findme)).toEqual(true);
		});

		it("parses a advanced query and fails to 'find' an object correctly", function() {
			var search = new RSSearch("test name:me", true, universeShim),
				findme = {};
			findme._search = "data";
			findme.name = "notit";
			expect(search.isFound(findme)).toEqual(false);
		});
	});
} catch(e) {
	console.log(e);
}