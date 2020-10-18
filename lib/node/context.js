/**
 * Node context
 */

const requireESM = require('esm')(module);
const context = requireESM('../common/context.js').default;

const client = require('./client');
Object.assign(context, { client });

const events = require('./events');
Object.assign(context, { events });

const { window } = require('./browser');
Object.assign(context, { window });

module.exports = context;
