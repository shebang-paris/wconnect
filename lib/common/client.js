/**
 * Default client module for HTTP request
 * @module common/client
 */

/**
 * Default client interface
 * @const Client
 * @type {Class}
 * @instance
 */

export default class Client {

	constructor(request) {
		this.request = request;
	}

	get(url, data, options) {
		return this.request(url, 'GET', data, options);
	}

	post(url, data, options) {
		return this.request(url, 'POST', data, options);
	}

	put(url, data, options) {
		return this.request(url, 'PUT', data, options);
	}

	delete(url, data, options) {
		return this.request(url, 'DELETE', data, options);
	}

}
