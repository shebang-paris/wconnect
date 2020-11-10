const elements = new Map();

const DEFAULT_OPTIONS = {
	childList: false,
	attributes: false,
	characterData: false,
	subtree: false,
	attributeOldValue: false,
	characterDataOldValue: false,
	attributeFilter: [],
};

/**
 * MutationObserver
 */

class MutationObserver {

	constructor(callback) {
		this.callback = callback;
	}

	observe(element, parameters) {
		const options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), parameters); // eslint-disable-line prefer-object-spread
		if (options.attributeFilter.length || options.attributeOldValue) Object.assign(options, { attributes: true });
		if (options.characterDataOldValue) Object.assign(options, { characterData: true });
		if (options.characterData) Object.assign(options, { subtree: true });
		if (elements.has(element)) {
			elements.get(element).set(this, options);
		} else {
			elements.set(element, new Map([[this, options]]));
		}
	}

	disconnect() {
		elements.forEach((observers) => observers.delete(this));
	}

	static trigger(target, type, parameters) {
		if (elements.size === 0) return;
		const ancestors = [target];
		let parent = target;
		while (parent.parentNode) {
			parent = parent.parentNode;
			ancestors.push(parent);
		}
		ancestors.filter((ancestor) => elements.has(ancestor)).forEach((ancestor) => {
			elements.get(ancestor).forEach((options, observer) => {
				const { addedNodes = [], removedNodes = [], previousSibling = null, nextSibling = null, attributeName = null, attributeNamespace = null, oldValue = null } = parameters;
				const isAncestor = ancestor !== target;
				if (options[type] === true && (options.subtree === isAncestor || ancestor === target)) {
					if (type === MutationObserver.ATTRIBUTE && options.attributeFilter.length && !options.attributeFilter.includes(attributeName)) {
						return;
					}
					const mutation = {
						type,
						target,
						addedNodes,
						removedNodes,
						previousSibling,
						nextSibling,
						attributeName,
						attributeNamespace,
						oldValue: null,
					};
					if ((type === MutationObserver.ATTRIBUTE && options.attributeOldValue) || (type === MutationObserver.CONTENT && options.characterDataOldValue)) {
						Object.assign(mutation, { oldValue });
					}
					observer.callback([mutation], observer);
				}
			});
		});
	}

}
MutationObserver.CHILD = 'childList';
MutationObserver.ATTRIBUTE = 'attributes';
MutationObserver.CONTENT = 'characterData';

module.exports = MutationObserver;
