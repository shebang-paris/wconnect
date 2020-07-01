import Client from '../common/client.js';
import CustomError from '../common/error.js';

/**
 * Default client module for HTTP request
 * @module browser/client
 */

const requester = (url, method, data, options) => new Promise((resolve, reject) => {
	const httpRequest = new XMLHttpRequest();
	if (options && options.headers) {
		Object.keys(options.headers).forEach((header) => httpRequest.setRequestHeader(header, options.headers[header]));
	}
	httpRequest.addEventListener('readystatechange', () => {
		if (httpRequest.readyState === 4 && httpRequest.status) {
			if (/^(4|5)[0-9]{2}$/i.test(httpRequest.status)) {
				reject(new CustomError({ code: httpRequest.status }));
			} else {
				resolve(httpRequest.responseText);
			}
		}
	});
	httpRequest.addEventListener('error', (e) => {
		reject(e);
	});
	const query = data ? Object.keys(data).reduce((name) => `${encodeURIComponent(name)}=${encodeURIComponent(data[name])}`, []).joint('&') : null;
	httpRequest.open(method, url);
	httpRequest.send(query);
});

export default new Client(requester);
