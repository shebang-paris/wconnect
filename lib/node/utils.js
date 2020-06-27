const net = require('net');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Get available port
 * @function getAvailablePort
 * @param {Number} start The starting port number
 * @param {Number} max The max port number
 * @returns {Promise}
 */

const getAvailablePort = (start, max) => new Promise((resolve, reject) => {
	if (typeof start !== 'number') {
		reject(new Error('Invalid starting port'));
	} else {
		const end = max || 65535;
		const server = net.createServer();
		server.listen(start, () => {
			server.once('close', () => {
				resolve(start);
			});
			server.close();
		});
		server.on('error', () => {
			if (start + 1 < end) {
				getAvailablePort(start + 1, end).then(resolve);
			} else {
				reject(new Error(`No available port found between ${start} and ${end}`));
			}
		});
	}
});

/**
 * Create simple local HTTP server
 * @function createHTTPServer
 * @param {Function} requestListener Server request listener
 * @returns {Promise}
 */

const createHTTPServer = (requestListener) => new Promise((resolve) => {
	getAvailablePort(3000).then((port) => {
		const server = http.createServer(requestListener);
		server.listen(port);
		server.baseUrl = new URL(`http://localhost:${port}/`);
		resolve(server);
	});
});

/**
 * Get folder files list with nested subfolders
 * @function getFiles
 * @param {string} base Folder path
 */

const getFiles = (base, pattern) => {
	const mask = pattern || /^[^.]+/;
	if (!base || !fs.existsSync(base)) throw new Error('Invalid folder');
	const files = fs.readdirSync(base);
	const result = files.filter((file) => !/\.DS_Store/.test(file)).reduce((list, file) => {
		const filepath = path.resolve(base, file);
		const stats = fs.statSync(filepath);
		if (stats.isDirectory()) {
			Array.prototype.push.apply(list, getFiles(filepath, pattern));
		} else if (mask.test(file)) {
			list.push(filepath);
		}
		return list;
	}, []);
	return result;
};

module.exports = {
	getAvailablePort,
	createHTTPServer,
	getFiles,
};
