/**
 *
 * @class Promise
 * @constructor
 * @param {Function} invoke(done,fail) Takes 2 Functions as arguments. The first is called to complete
 * 		this Promise and flows into the subsequent Function passed to `then`. The second is
 * 		optional to call when this Promise should be considered failed and goes to the
 * 		`catch` method function. Only invoke 1 argument and only invoke that argument once.
 */

/**
 *
 * @method then
 * @param {Function} then(method)
 * @return {Promise} Can be a Promise returned from this Promise's invoke function or this
 * 		Promise and is executed after this Promise finishes successfully. Specifically
 * 		following a call of the 1st argument of the `invoke` Function.
 */

/**
 *
 * @method catch
 * @param {Function} catcher(method)
 * @return {Promise} Can be a Promise returned from this Promise's invoke function or this
 * 		Promise and is executed after this Promise finishes unsuccessfully. Specifically
 * 		following a call of the 2nd argument of the `invoke` Function.
 */
