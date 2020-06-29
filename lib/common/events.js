/**
 * Event utility functions for unified event handling width objects and DOM elements
 * @module common/events
 */

/**
 * Attached event listener registry
 * @const attachedListeners
 * @private
 */

const attachedListeners = [];

/**
 * Get all event listeners for a given target (DOM element or javascript object)
 * @function getListeners
 * @param {HTMLElement|Object} target DOM element or javascript object
 * @returns {Object} An object with event types as keys and target event listeners arrays as values
 * @private
 */

export const getListeners = (target) => attachedListeners.reduce((result, item) => {
	if (item.target === target) return item.listeners;
	return result;
}, null);

/**
 * Register an event listener on a target (DOM element or javascript object) for a specific event type
 * @function addEventListener
 * @param {HTMLElement|Object} target DOM element or javascript object
 * @param {String} type A string representing the event type to listen for
 * @param {Function} listener The event listener function that receives a notification when an event of the specified type occurs
 * @param {Boolean|Object} [opts] The event listener options or true to use capture
 * @returns {Object} The corresponding registry entry
 * @instance
 */

export const addEventListener = (target, type, listener, opts) => {
	let targetListeners = getListeners(target);
	if (!targetListeners) {
		const entry = { target, listeners: {} };
		attachedListeners.push(entry);
		targetListeners = entry.listeners;
	}
	if (targetListeners[type] === undefined) {
		targetListeners[type] = [];
	}
	const found = targetListeners[type].reduce((result, item) => (item.listener === listener && item) || result, false);
	if (found) return found;
	const options = typeof opts === 'boolean' ? { 'capture': opts } : (opts || {}); // eslint-disable-line quote-props
	const eventListener = { listener, options };
	targetListeners[type].push(eventListener);
	return eventListener;
};

/**
 * Remove one (or all) event listener(s) of a given target (DOM element or javascript object)
 * @function removeEventListener
 * @param {HTMLElement|Object} target DOM element or javascript object
 * @param {String} [type] A string representing the event type to remove
 * @param {Function} [listener] The event listener function to remove from the event target
 * @returns {Object[]} The corresponding registry entries
 * @instance
 */

export const removeEventListener = (target, type, listener) => {
	const targetListeners = getListeners(target);
	const removedListeners = [];
	if (targetListeners) {
		let names = Object.keys(targetListeners);
		if (type) names = names.filter((name) => name === type);
		names.forEach((name) => {
			let eventListeners = targetListeners[name].slice();
			if (listener) eventListeners = eventListeners.filter((entry) => entry.listener === listener);
			eventListeners.forEach((eventListener) => {
				removedListeners.push(eventListener);
				targetListeners[name].splice(targetListeners[name].indexOf(eventListener), 1);
			});
			if (targetListeners[name].length === 0) delete targetListeners[name];
		});
		if (Object.keys(targetListeners).length === 0) {
			for (let i = attachedListeners.length - 1; i >= 0; i -= 1) {
				if (attachedListeners[i].target === target) attachedListeners.splice(i, 1);
			}
		}
	}
	return removedListeners;
};

/**
 * Dispatch an event at the specified target (DOM element or javascript object)
 * @function dispatchEvent
 * @param {HTMLElement|Object} target DOM element or javascript object
 * @param {String} type A string representing the event type to dispatch
 * @param {Object} [data] Any data attached to the event
 * @instance
 */

export const dispatchEvent = (target, type, data) => {
	const targetListeners = getListeners(target);
	if (targetListeners && targetListeners[type]) {
		targetListeners[type].slice(0).forEach((entry) => {
			entry.listener.call(undefined, { target, detail: data });
			if (entry.options.once) removeEventListener(target, type, entry.listener);
		});
	}
};
