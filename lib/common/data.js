/**
 * Default data source class and data sources controller
 * @module common/data
 */

import context from './context.js';

// Elements / sources registry
const elements = new Map();

// Components / sources registry
const components = new Map();

/**
 * Default source interface
 * @const Source
 * @type {Class}
 * @property {Function} attachTo Method to attach source to an element
 * @property {Function} setData Source data setter that dispatch a loaded event
 * @property {Function} getData Source data getter for given element
 * @property {Function} load Method to initiate given element data loading from source
 * @property {Function} isLoaded Method to check if given element data is loaded
 * @property {Function} reset Method to reset source state
 * @property {Boolean} loading Whether source is loading or not
 * @property {Boolean} defer Component event type upon which data loading should be deferred
 * @instance
 */

export default class Source {

	constructor() {
		this.defer = false;
		this.reset();
	}

	setData(value) {
		this.loaded = true;
		this.loading = false;
		if (!this.data) this.data = {};
		Object.assign(this.data, value);
		getElements(this).forEach((element) => context.events.dispatchEvent(element, 'sourceloaded', this)); // eslint-disable-line no-use-before-define
		context.events.dispatchEvent(this, 'loaded');
	}

	attachTo(element) {
		addSource(element, this); // eslint-disable-line no-use-before-define
	}

	load(element) { // eslint-disable-line no-unused-vars, class-methods-use-this
		if (context.client && this.url) context.client.get(this.url);
	}

	getData(element) { // eslint-disable-line no-unused-vars
		return this.data; // Return global data or data related to element parameter
	}

	isLoaded(element) { // eslint-disable-line no-unused-vars
		return this.loaded; // Return global loaded status or given element loaded status
	}

	reset() { // eslint-disable-line no-unused-vars, class-methods-use-this
		this.loading = false;
		this.loaded = false;
		this.data = null;
		this.url = null;
	}

}

/**
 * Get elements to which a source is attached
 * @function getSources
 * @param {Source} source The source
 * @returns {HTMLElement[]} The elements to which a source is attached
 * @private
 */

const getElements = (source) => Array.from(elements.keys()).reduce((found, element) => {
	if (Object.values(elements.get(element)).reduce((arr, item) => arr.concat(item), []).indexOf(source) !== -1) {
		found.push(element);
	}
	return found;
}, []);

/**
 * Get element source
 * @function getSources
 * @param {HTMLElement} element The element
 * @returns {Source[]} The element data sources
 * @private
 */

const getSources = (element, defer) => (defer ? elements.get(element)[defer] : Object.values(elements.get(element)).reduce((arr, item) => arr.concat(item), []));

/**
 * Source load event listener
 * @function onLoadSource
 * @param {CustomEvent} e The sourceloaded custom event
 * @private
 */

const onLoadSource = (e) => {
	const element = e.target;
	const source = e.detail;
	const sources = getSources(element, source.defer || 'loaddata');
	const loaded = sources.filter((src) => !src.isLoaded(element)).length === 0;
	if (!loaded) return; // Wait for all sources to be loaded
	const data = getSources(element).map((src) => src.getData(element)).filter((obj) => obj).reduce((obj, item) => Object.assign(obj, item), {});
	context.events.dispatchEvent(element, 'data', data, true);
};

/**
 * Add source to element
 * @function addSource
 * @param {HTMLElement} element The element
 * @param {Source} source The source element
 * @private
 */

const addSource = (element, source) => {
	const key = source.defer || 'loaddata';
	// Register source for element
	if (!elements.has(element)) {
		elements.set(element, { [key]: [source] });
	} else if (!elements.get(element)[key]) {
		Object.assign(elements.get(element), { [key]: [source] });
	} else if (elements.get(element)[key].indexOf(source) === -1) {
		elements.get(element)[key].push(source);
	}
	// Load source or defer loading
	context.events.addEventListener(element, 'sourceloaded', onLoadSource);
	if (source.isLoaded(element)) {
		context.events.addEventListener(element, key, (e) => {
			if (e.defaultPrevented) return;
			context.events.dispatchEvent(element, 'sourceloaded', { element, source });
		}, { 'once': true }); // eslint-disable-line quote-props
	} else {
		context.events.addEventListener(element, key, (e) => {
			if (e.defaultPrevented) return;
			if (!source.isLoaded(element)) source.load(element);
		}, { 'once': true }); // eslint-disable-line quote-props
	}
};
