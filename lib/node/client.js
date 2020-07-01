const http = require('http');
const https = require('https');
const URL = require('url');
const requireESM = require('esm')(module);

const Client = requireESM('../common/client.js').default;
const CustomError = requireESM('../common/error.js').default;

/**
 * Default client module for HTTP request
 * @module node/client
 */

const requester = (url, method, data, options) => new Promise((resolve, reject) => {
	try {
		const query = data ? JSON.stringify(data) : null;
		const headers = {};
		const parts = URL.parse(url);
		const ssl = parts.protocol === 'https';
		const opts = {
			hostname: parts.hostname,
			port: parts.port,
			path: parts.pathname,
			method,
			headers: Object.assign(headers, (options || {}).headers),
		};
		if (query) Object.assign(opts.headers, { 'Content-Length': query.length });
		const req = ((ssl && https) || http).request(opts, (res) => {
			const chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				if (/^(4|5)[0-9]{2}$/i.test(res.statusCode)) { // Either client or server error
					reject(new CustomError({ code: res.statusCode }));
				} else {
					const responseText = Buffer.concat(chunks).toString();
					resolve(responseText ? JSON.parse(responseText) : null);
				}
			});
		});
		req.on('error', (e) => {
			reject(e);
		});
		req.end(query);
	} catch (e) {
		reject(e);
	}
});

const client = new Client(requester);

module.exports = client;
