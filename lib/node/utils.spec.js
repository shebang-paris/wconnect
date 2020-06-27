import * as path from 'path';
import * as http from 'http';
import * as net from 'net';

import * as data from '../test/data.js';

import * as utils from './utils.js';

describe('Node utility module', () => {

	it('Method getAvailablePort should be defined and require a starting port number', (done) => {
		expect(utils.getAvailablePort).to.be.instanceOf(Function);
		utils.getAvailablePort().catch((e) => {
			expect(e).to.be.instanceof(Error);
			expect(e.message).to.equal('Invalid starting port');
			done();
		});
	});

	it('Method getAvailablePort should return the first available port inside a given range', (done) => {
		const start = 3000;
		const end = 4000;
		utils.getAvailablePort(start, end).then((port) => {
			expect(port).to.be.a('number');
			expect(port).to.be.at.least(start);
			expect(port).to.be.at.most(end);
			const server = net.createServer();
			server.listen(port);
			utils.getAvailablePort(port, end).then((newport) => {
				expect(newport).to.be.at.least(port + 1);
				server.close();
				done();
			});
		});
	});

	it('Method getAvailablePort should reject if no available port is found inside the given range', (done) => {
		utils.getAvailablePort(3000, 4000).then((port) => {
			const server = net.createServer();
			server.listen(port);
			utils.getAvailablePort(port, port).catch((e) => {
				expect(e).to.be.instanceof(Error);
				expect(e.message).to.equal(`No available port found between ${port} and ${port}`);
				server.close();
				done();
			});
		});
	});

	it('Method createHTTPServer should be defined', (done) => {
		let server;
		utils.createHTTPServer((request, response) => {
			if (request.url === '/') {
				response.end();
				server.close();
				done();
			}
		}).then((srv) => {
			server = srv;
			http.get(server.baseUrl);
		});
	});

	it('Method getFiles should be defined and return folder files', (done) => {
		expect(utils.getFiles).to.be.instanceof(Function);
		expect(() => utils.getFiles('')).to.throw('Invalid folder');
		expect(() => utils.getFiles(data.getRandomID())).to.throw('Invalid folder');
		expect(() => utils.getFiles(__dirname)).to.not.throw();
		const folder = path.resolve(__dirname, '../test/files');
		expect(utils.getFiles(folder)).to.be.instanceof(Array);
		expect(utils.getFiles(folder).length).to.equal(10);
		let files = utils.getFiles(folder, /file\.txt/i);
		expect(files).to.be.instanceof(Array);
		expect(files.length).to.equal(2);
		expect(files).to.include(`${folder}/file.txt`);
		expect(files).to.include(`${folder}/nested/file.txt`);
		files = utils.getFiles(folder, /^\./i);
		expect(files).to.be.instanceof(Array);
		expect(files.length).to.equal(1);
		expect(files).to.include(`${folder}/.dotfile`);
		files = utils.getFiles(folder, /\.txt$/i);
		expect(files).to.be.instanceof(Array);
		expect(files.length).to.equal(2);
		expect(files).to.include(`${folder}/file.txt`);
		expect(files).to.include(`${folder}/nested/file.txt`);
		done();
	});

});
