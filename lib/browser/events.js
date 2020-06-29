/**
 * Event utility functions for event handling width DOM elements
 * @module browser/events
 */

import * as events from '../common/events.js';

// Passive event listeners and once event listener option support

let passiveEvents = false;
let onceEvents = false; // eslint-disable-line no-unused-vars
try {
	class Options {
		get passive() { // eslint-disable-line class-methods-use-this
			passiveEvents = true;
			return true;
		}
		get once() { // eslint-disable-line class-methods-use-this,lines-between-class-members
			onceEvents = true;
			return true;
		}
	}
	const opts = new Options();
	window.addEventListener('testPassive', null, opts);
	window.removeEventListener('testPassive', null, opts);
} catch (e) {} // eslint-disable-line no-empty

/**
 * Get {@link https://developers.google.com/web/updates/2016/10/addeventlistener-once|DOM listener options} parameter according to the registered listener options
 * @function getDOMListenerOptions
 * @param {Object} listener The listener registry entry
 * @returns {Object} An object to be used with DOM addEventListener method
 * @private
 */

const getDOMListenerOptions = (listener) => (!passiveEvents ? (listener.options.capture || false) : listener.options);

/**
 * Event listener registry
 * @const listeners
 * @private
 */

const listeners = [];

/**
 * Get registered listener for element and event type
 * @function getListener
 * @param {HTMLElement} element The element
 * @param {String} type The event type
 * @returns {Function|null} The listener function or null
 * @instance
 */

export const getListener = (element, type) => listeners.reduce((found, entry) => (entry.element === element && entry.type === type ? entry.listener : found), null);

/**
 * Register a listener for element and event type
 * @function register
 * @param {HTMLElement} element The element
 * @param {String} type The event type
 * @param {Function} fn The listener function
 * @instance
 */

export const register = (element, type, fn) => {
	let listener = getListener(element, type);
	if (!listener) {
		listener = fn;
		listeners.push({ element, type, listener });
	}
	return listener;
};

/**
 * Unregister a listener
 * @function unregister
 * @param {Function} listener The listener function
 * @instance
 */

export const unregister = (listener) => {
	const item = listeners.reduce((found, entry) => (entry.listener === listener ? entry : found), null);
	if (item) listeners.splice(listeners.indexOf(item), 1);
};

/**
 * Register an event listener on a target (DOM element or javascript object) for a specific event type
 * @function addEventListener
 * @param {HTMLElement|Object} target DOM element or javascript object
 * @param {String} type A string representing the event type to listen for
 * @param {Function} listener The event listener function that receives a notification when an event of the specified type occurs
 * @param {Boolean|Object} [opts] The event listener options or true to use capture
 * @instance
 */

export const addEventListener = (target, type, listener, opts) => {
	let fn = listener;
	const options = typeof opts === 'boolean' ? { 'capture': opts } : (opts || {}); // eslint-disable-line quote-props
	// Once option support
	if (options.once === true) {
		const func = fn;
		fn = (e) => {
			func.call(undefined, e);
			removeEventListener(target, type, listener); // eslint-disable-line no-use-before-define
		};
	}
	const eventListener = events.addEventListener(target, type, listener, options);
	const source = listeners.reduce((result, entry) => (entry.listener === listener ? entry.element : result), null);
	Object.assign(eventListener, { type, fn, source });
	if (!(target instanceof EventTarget)) return;
	if ([document, window].indexOf(target) !== -1 && source) {
		// Registered event listeners for the same event and global target should be called according to associated elements hierarchy and order
		const sorted = events.getListeners(target)[type].filter((item) => item.source);
		sorted.sort((a, b) => 3 - (a.source.compareDocumentPosition(b.source) & 6)); // eslint-disable-line no-bitwise
		sorted.forEach((item) => target.removeEventListener(type, item.fn, getDOMListenerOptions(item)));
		sorted.forEach((item) => target.addEventListener(type, item.fn, getDOMListenerOptions(item)));
	} else if (target.addEventListener) {
		target.addEventListener(type, eventListener.fn, getDOMListenerOptions(eventListener));
	}
};

/**
 * Remove one (or all) event listener(s) of a given target (DOM element or javascript object)
 * @function removeEventListener
 * @param {HTMLElement|Object} target DOM element or javascript object
 * @param {String} [type] A string representing the event type to remove
 * @param {Function} [listener] The event listener function to remove from the event target
 * @instance
 */

export const removeEventListener = (target, type, listener) => {
	const removedListeners = events.removeEventListener(target, type, listener);
	if (!(target instanceof EventTarget)) return;
	removedListeners.forEach((eventListener) => {
		target.removeEventListener(eventListener.type, eventListener.fn, getDOMListenerOptions(eventListener));
		unregister(eventListener.fn);
	});
};

/**
 * Dispatch an event at the specified target (DOM element or javascript object)
 * @function dispatchEvent
 * @param {HTMLElement|Object} target DOM element or javascript object
 * @param {String} type A string representing the event type to dispatch
 * @param {Object} [data] Any data attached to the event
 * @param {Boolean} [canBubble]  Whether the event bubbles up through the DOM or not (for DOM event only)
 * @param {Boolean} [cancelable] Whether the event is cancelable or not (for DOM event only)
 * @instance
 */

export const dispatchEvent = (target, type, data, canBubble, cancelable) => {
	if (target.dispatchEvent) {
		const event = new CustomEvent(type, { detail: data, bubbles: canBubble, cancelable });
		target.dispatchEvent(event);
	} else {
		events.dispatchEvent(target, type, data, canBubble, cancelable);
	}
};
