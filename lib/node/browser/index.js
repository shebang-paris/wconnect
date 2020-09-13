const interfaces = require('./element');
const Node = require('./node');

/**
 * Default window interface
 */

const window = {};

/**
 * Custom elements registry
 */

const customElements = {};

const CustomElementRegistry = {
	define: (name, constructor, options) => {
		if (customElements[name] instanceof Function) customElements[name]();
		customElements[name] = { constructor, options };
	},
	get: (name) => customElements[name] && customElements[name].constructor,
	upgrade: () => {
		// TODO
	},
	whenDefined: (name) => {
		if (customElements[name]) return Promise.resolve();
		return new Promise((resolve) => {
			customElements[name] = resolve;
		});
	},
};

window.customElements = CustomElementRegistry;

/**
 * Document
 */

const document = new Node();
document.defaultView = window;
window.document = document;

/**
 * Nodes
 */

window.Node = Node;

/**
 * New element creation
 * @function createElement
 * @param {String} tagName A string representing the event type to remove
 * @param {Object} [options] Options object
 * @returns {HTMLElement} The new created element
 */

const createElement = (tagName, options) => {
	const constructor = CustomElementRegistry.get(tagName) || Object.keys(interfaces)
		.reduce((found, name) => (interfaces[name].tagNames.indexOf(tagName) !== -1 ? interfaces[name] : found), interfaces.HTMLUnknownElement);
	const element = new constructor();
	element.nodeName = tagName;
	element.ownerDocument = document;
	return element;
};

document.createElement = createElement;
document.documentElement = createElement('html');
document.head = document.documentElement.appendChild(createElement('head'));
document.body = document.documentElement.appendChild(createElement('body'));

Object.keys(interfaces).forEach((name) => {
	window[name] = interfaces[name];
});

module.exports = { window };
