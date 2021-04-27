global.mock = global.mock || {};
global.mock.Anomaly = function() {
	var mock = jasmine.createSpy("Anomaly");
	mock.and.callFake(function(code, component, message, level, details, cause) {
		expect(typeof code).toBe("string");
		expect(typeof component === "string" || typeof component === "object").toBe(true);
		expect(typeof message).toBe("string");
		expect(typeof (level || 30)).toBe("number");
		expect(typeof (details || {})).toBe("object");
		expect(typeof (cause || {})).toBe("object");
		return {
			"code": code,
			"cause": cause
		};
	});
	return mock;
};
