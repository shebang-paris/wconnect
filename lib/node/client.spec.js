import * as data from '../test/data.js';

import context from './context.js';
import { createHTTPServer } from './utils.js';

describe('Node HTTP client module', () => {

	it('Client class should be defined and instances have defined methods and properties', (done) => {
		const { client } = context;
		expect(client).to.respondTo('get');
		expect(client).to.respondTo('post');
		expect(client).to.respondTo('put');
		expect(client).to.respondTo('delete');
		done();
	});

	it('Client get method should return a promise', (done) => {
		const { client } = context;
		createHTTPServer((request, response) => { // eslint-disable-line global-require
			switch (request.headers.host) {
			default:
				response.statusCode = (request.url === '/') ? 200 : 404;
				response.end();
			}
		}).then((server) => {
			const location = server.baseUrl;
			const valid = location.href;
			const invalid = `https://${data.getRandomID()}`;
			const notfound = `${location.href}${data.getRandomID()}`;
			const success = spy();
			const request = client.get(valid)
				.then(() => client.get(invalid))
				.then(success, () => {
					client.get(notfound).then(success, (e) => {
						expect(e.code).to.equal(404);
						expect(success).to.not.have.been.called();
						server.close();
						done();
					});
				});
			expect(request).to.be.instanceOf(Promise);
		});
	});

});
