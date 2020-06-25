import * as http from 'http';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import * as childProcess from 'child_process';
import { Transform } from 'stream';

import * as WebSocket from 'ws';

import * as utils from '../node/utils.js';

// Web server response transform stream

class Rewrite extends Transform {

	constructor(replace) {
		super();
		this.replace = replace;
		this.chunks = [];
	}

	_transform(chunk, encoding, callback) { // eslint-disable-line no-underscore-dangle
		if (this.replace) {
			this.chunks.push(chunk);
			callback();
		} else {
			this.push(chunk);
			callback();
		}
	}

	_flush(callback) { // eslint-disable-line no-underscore-dangle
		if (this.chunks.length) {
			const source = this.chunks.join('').toString('utf8');
			const target = this.replace(source);
			this.push(target);
		}
		if (callback) callback();
	}

}

utils.getAvailablePort(3000).then(async (web) => {

	const socket = await utils.getAvailablePort(web + 1);

	// Web server
	const root = '/lib/test/';
	const mediatypes = {
		js: 'application/javascript',
		json: 'application/json',
		htm: 'text/html',
		css: 'text/css',
		jpg: 'image/jpg',
		svg: 'image/svg+xml',
	};
	const server = http.createServer((request, response) => {
		switch (request.headers.host) {
		default:
			if (request.url === '/') {
				response.writeHead(302, { Location: root });
				response.end();
			} else {
				let fileUrl = url.parse(request.url).pathname;
				fileUrl = /\/$/.test(fileUrl) ? `${fileUrl}index.htm` : fileUrl;
				const filePath = path.resolve(process.cwd(), `.${fileUrl}`);
				const mediatype = path.extname(filePath).substring(1);
				try {
					fs.statSync(filePath);
					response.writeHead(200, { 'Content-Type': mediatypes[mediatype] });
					// Inject websocket code for html
					const rewrite = new Rewrite(/htm/i.test(mediatype) ? (data) => {
						const modules = ['test', 'common', 'browser']
							.reduce((files, folder) => files.concat(utils.getFiles(path.resolve(process.cwd(), `./lib/${folder}`), /spec.js$/)), [])
							.map((file) => file.replace(process.cwd(), ''))
							.concat(['../browser/context.js']);
						let html = data;
						html = html.replace(/<\/head>/i, `<script>
							var ws = new WebSocket("ws://localhost:${socket}");
							ws.onclose = function() {
								window.close(); 
							};
						</script>
						</head>`);
						html = html.replace('modules = [];', `modules = ['${modules.join("','")}'];`);
						return html;
					} : null);
					fs.createReadStream(filePath).pipe(rewrite).pipe(response);
				} catch (e) {
					Object.assign(response, { statusCode: 404 });
					response.end();
				}
			}
		}
	});
	server.listen(web);

	// Socket server
	const wss = new WebSocket.Server({ port: socket });
	wss.on('connection', (ws) => {
		Object.assign(ws, { isAlive: true });
		ws.on('pong', () => Object.assign(ws, { isAlive: true }));
	});
	setInterval(() => {
		if (wss.clients.size) {
			wss.clients.forEach((ws) => {
				if (ws.isAlive === false) return ws.terminate();
				Object.assign(ws, { isAlive: false });
				ws.ping(() => {});
				return ws;
			});
		} else {
			process.exit(0);
		}
	}, 500);

	let command = 'xdg-open';
	command = process.platform === 'darwin' ? 'open' : command;
	command = process.platform === 'win32' ? 'cmd' : command;
	let args = [`http://localhost:${web}${root}`];
	if (process.platform === 'win32') {
		args = args.map((value) => value.replace(/&/g, '^&'));
		args = ['/c', 'start', '""'].concat(args);
	}
	childProcess.execFile(command, args);

});
