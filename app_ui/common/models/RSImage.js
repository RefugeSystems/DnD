/**
 *
 * @class RSImage
 * @extends RSObject
 * @constructor
 * @module Common
 * @param {Object} details
 */
class RSImage extends RSObject {

	constructor(details, universe) {
		super(details, universe);

		if(this.data) {
			try {
				this._blob = this.base64toBlob(this.data, this.content_type);
			} catch(exception) {
				console.warn(exception);
			}
		}
	}

	base64toBlob(base64Data, contentType) {
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

	/**
	 *
	 * @property data
	 * @type String
	 */

	/**
	 *
	 * @property path
	 * @type String
	 */

	/**
	 *
	 * @property height
	 * @type Integer
	 */

	/**
	 *
	 * @property width
	 * @type Integer
	 */

	/**
	 *
	 * @property aspect
	 * @type Number
	 */

	/**
	 *
	 * @property data
	 * @type String
	 */
}
