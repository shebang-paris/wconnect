/**
 * Browser context
 */

import context from '../common/context.js';
import client from './client.js';
import * as events from './events.js';

Object.assign(context, {
	window,
	location: window['location'], // eslint-disable-line dot-notation
	client,
	events,
});

export default context;
