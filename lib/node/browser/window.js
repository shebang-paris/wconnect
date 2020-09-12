/**
 * Default window interface
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

const window = { customElements: CustomElementRegistry };

module.exports = window;
