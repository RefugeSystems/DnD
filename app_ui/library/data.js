/**
 *
 *
 * @class DataUtility
 * @constructor
 * @static
 */
var DataUtility = (function() {

	return {
		/**
		 *
		 * @method readFile
		 * @param  {File} file
		 * @return {Promise}
		 */
		"readFile": function(file) {
			// console.warn("Read File: ", file);
			return new Promise(function(done, fail) {
				var reader = new FileReader();
				reader.onload = function (e) {
					done({
						"data": e.currentTarget.result,
						"name": file.name,
						"size": file.size
					});
				};
				reader.onerror = fail;
				reader.readAsText(file);
			});
		},
		/**
		 *
		 * @method encodeFile
		 * @param  {File} file
		 * @return {Promise}
		 */
		"encodeFile": function(file) {
			// console.warn("Encoding File: ", file);
			return new Promise(function(done, fail) {
				var reader = new FileReader();
				reader.onload = function (e) {
					done({
						"data": e.currentTarget.result,
						"name": file.name,
						"size": file.size
					});
				};
				reader.onerror = fail;
				reader.readAsDataURL(file);
			});
		},

		"": function() {

		},


		/**
		 *
		 * @method base64toBlob
		 * @param {String} base64Data  [description]
		 * @param {String} contentType [description]
		 * @return {Blob}
		 */
		"base64toBlob": function(base64Data, contentType) {
			contentType = contentType || "";
			var sliceSize = 1024;
			var byteCharacters = atob(base64Data);
			var bytesLength = byteCharacters.length;
			var slicesCount = Math.ceil(bytesLength / sliceSize);
			var byteArrays = new Array(slicesCount);

			for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
				var begin = sliceIndex * sliceSize;
				var end = Math.min(begin + sliceSize, bytesLength);

				var bytes = new Array(end - begin);
				for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
					bytes[i] = byteCharacters[offset].charCodeAt(0);
				}
				byteArrays[sliceIndex] = new Uint8Array(bytes);
			}
			return new Blob(byteArrays, { type: contentType });
		}
	};
})();
