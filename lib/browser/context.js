/**
 * Browser context
 */

import context from '../common/context.js';
import client from './client.js';

Object.assign(context, {
	location: window['location'], // eslint-disable-line dot-notation
	client,
});

export default context;
