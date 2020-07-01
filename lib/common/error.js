/**
 * Default client error
 * @const ClientError
 * @type {Class}
 * @instance
 */

export default class CustomError extends Error {

	constructor({ message, code }) {
		super(message);
		this.code = code;
	}

}
