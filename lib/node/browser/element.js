/* eslint-disable max-classes-per-file */
const Node = require('./node');
const MutationObserver = require('./observer');

const interfaces = {};

const VOID = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

/**
 * DOM elements constructor / tag names mapping
 */

const ELEMENTS = {
	HTMLElement: ['abbr', 'address', 'article', 'aside', 'b', 'bdi', 'bdo', 'cite', 'code', 'col', 'colgroup', 'dd', 'dfn', 'dt', 'em', 'figcaption', 'figure', 'footer', 'header', 'i', 'kbd', 'main', 'mark', 'nav', 'noscript', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'small', 'strong', 'sub', 'summary', 'sup', 'u', 'var', 'wbr'],
	HTMLAnchorElement: ['a'],
	HTMLAppletElement: ['applet'],
	HTMLAreaElement: ['area'],
	HTMLAttachmentElement: ['attachment'],
	HTMLAudioElement: ['audio'],
	HTMLBRElement: ['br'],
	HTMLBaseElement: ['base'],
	HTMLBodyElement: ['body'],
	HTMLButtonElement: ['button'],
	HTMLCanvasElement: ['canvas'],
	HTMLContentElement: ['content'],
	HTMLDListElement: ['dl'],
	HTMLDataElement: ['data'],
	HTMLDataListElement: ['datalist'],
	HTMLDetailsElement: ['details'],
	HTMLDialogElement: ['dialog'],
	HTMLDirectoryElement: ['dir'],
	HTMLDivElement: ['div'],
	HTMLEmbedElement: ['embed'],
	HTMLFieldSetElement: ['fieldset'],
	HTMLFontElement: ['font'],
	HTMLFormElement: ['form'],
	HTMLFrameElement: ['frame'],
	HTMLFrameSetElement: ['frameset'],
	HTMLHRElement: ['hr'],
	HTMLHeadElement: ['head'],
	HTMLHeadingElement: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
	HTMLHtmlElement: ['html'],
	HTMLIFrameElement: ['iframe'],
	HTMLImageElement: ['img'],
	HTMLInputElement: ['input'],
	HTMLKeygenElement: ['keygen'],
	HTMLLIElement: ['li'],
	HTMLLabelElement: ['label'],
	HTMLLegendElement: ['legend'],
	HTMLLinkElement: ['link'],
	HTMLMapElement: ['map'],
	HTMLMarqueeElement: ['marquee'],
	HTMLMediaElement: ['media'],
	HTMLMenuElement: ['menu'],
	HTMLMenuItemElement: ['menuitem'],
	HTMLMetaElement: ['meta'],
	HTMLMeterElement: ['meter'],
	HTMLModElement: ['del', 'ins'],
	HTMLOListElement: ['ol'],
	HTMLObjectElement: ['object'],
	HTMLOptGroupElement: ['optgroup'],
	HTMLOptionElement: ['option'],
	HTMLOutputElement: ['output'],
	HTMLParagraphElement: ['p'],
	HTMLParamElement: ['param'],
	HTMLPictureElement: ['picture'],
	HTMLPreElement: ['pre'],
	HTMLProgressElement: ['progress'],
	HTMLQuoteElement: ['blockquote', 'q', 'quote'],
	HTMLScriptElement: ['script'],
	HTMLSelectElement: ['select'],
	HTMLShadowElement: ['shadow'],
	HTMLSlotElement: ['slot'],
	HTMLSourceElement: ['source'],
	HTMLSpanElement: ['span'],
	HTMLStyleElement: ['style'],
	HTMLTableCaptionElement: ['caption'],
	HTMLTableCellElement: ['td', 'th'],
	HTMLTableColElement: ['col', 'colgroup'],
	HTMLTableElement: ['table'],
	HTMLTableRowElement: ['tr'],
	HTMLTableSectionElement: ['thead', 'tbody', 'tfoot'],
	HTMLTextAreaElement: ['textarea'],
	HTMLTimeElement: ['time'],
	HTMLTitleElement: ['title'],
	HTMLTrackElement: ['track'],
	HTMLUListElement: ['ul'],
	HTMLUnknownElement: ['unknown', 'vhgroupv', 'vkeygen'],
	HTMLVideoElement: ['video'],
};

/**
 * Test if DOM element has given tag name
 * @function hasName
 * @param {Object} element The DOM element to test
 * @returns {Boolean} Whether element is custom element
 */

const hasName = (name) => (item) => item.name === name;

/**
 * Return a DOMStringMap interface for given element
 * @function getDOMStringMap
 * @param {Object} element The DOM element
 * @returns {Object} The DOMStringMap interface
 */

const getDOMStringMap = (element) => ({
	get: (obj, name) => (name === Symbol.toStringTag ? '[object Object]' : (element.getAttribute(`data-${name}`) || undefined)),
	set: (obj, name, value) => element.setAttribute(`data-${name}`, value),
	deleteProperty: (obj, name) => element.removeAttribute(`data-${name}`) || true,
	ownKeys: () => element.attributes.filter((attr) => /^data/i.test(attr.name)).map((attr) => attr.name.replace('data-', '')),
	getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
});

const LEADING_WHITESPACE = /^(\t|\n|\r)*/gm;
const TRAILING_WHITESPACE = /(\t|\n|\r)*$/gm;
const TEXT = /^([^<]+)/i;
const COMMENT = /^(<!--([^>]*)-->)/i;
const ELEMENT = /^<([^>]+)>/i;
const ATTRIBUTES = /([^=\s]+=["']{1}[^"']*["']{1})/ig;
const ATTRIBUTE = /([^=\s]+)=["']{1}([^"']*)["']{1}/i;

/**
 * Default Element interface
 */

class Element extends Node {

	constructor() {
		super();
		this.attributes = [];
		this.dataset = new Proxy({}, getDOMStringMap(this));
		this.nodeType = Node.ELEMENT_NODE;
	}

	get outerHTML() {
		const attrs = this.attributes.reduce((result, attr) => result.concat([`${attr.name}="${attr.value}"`]), []);
		const attributes = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
		if (!this.tagName) return this.innerHTML;
		const tag = this.tagName.toLowerCase();
		const isVoid = VOID.indexOf(tag) !== -1;
		return isVoid ? `<${tag}${attributes}/>` : `<${tag}${attributes}>${this.innerHTML}</${tag}>`;
	}

	get innerHTML() {
		return this.childNodes.map((child) => `${child}`).join('');
	}

	set innerHTML(html) {
		this.childNodes.slice(0).forEach((child) => this.removeChild(child));
		let tail = html;
		tail = tail.replace(LEADING_WHITESPACE, '');
		while (tail.length > 0) {
			if (TEXT.test(tail)) {
				let text = tail.match(TEXT)[1];
				text = text.replace(TRAILING_WHITESPACE, '');
				if (text) this.appendChild(this.ownerDocument.createTextNode(text));
				tail = tail.replace(TEXT, '');
			} else if (COMMENT.test(tail)) {
				const comment = tail.match(COMMENT)[2];
				this.appendChild(this.ownerDocument.createComment(comment));
				tail = tail.replace(COMMENT, '');
			} else if (ELEMENT.test(tail)) {
				const tag = tail.match(ELEMENT)[1];
				const tagName = tag.match(/^([\w-]+)/)[1];
				const attributes = ATTRIBUTES.test(tag) ? tag.match(ATTRIBUTES)
					.map((attribute) => attribute.match(ATTRIBUTE))
					.reduce((obj, attribute) => Object.assign(obj, { [attribute[1]]: attribute[2] }), {}) : {};
				tail = tail.replace(ELEMENT, '');
				const node = this.appendChild(this.ownerDocument.createElement(tagName));
				Object.keys(attributes).forEach((name) => node.setAttribute(name, attributes[name]));
				if (VOID.indexOf(tagName) === -1) {
					const closing = `</${tagName}>`;
					const index = tail.indexOf(closing);
					node.innerHTML = tail.substring(0, index);
					tail = tail.substring(index + closing.length);
				}
			}
		}
	}

	get innerText() {
		return this.childNodes.filter((child) => child.nodeType !== Node.COMMENT_NODE)
			.map((child) => `${child.textContent || child.innerText}`).join('');
	}

	set innerText(data) {
		this.childNodes.slice(0).forEach((child) => this.removeChild(child));
		if (data) this.appendChild(this.ownerDocument.createTextNode(data));
	}

	toString() {
		return this.outerHTML;
	}

	hasAttributes() {
		return this.attributes.length > 0;
	}

	hasAttribute(name) {
		return typeof this.attributes.find(hasName(name)) !== 'undefined';
	}

	getAttribute(name) {
		return this.hasAttribute(name) ? this.attributes.find(hasName(name)).value : null;
	}

	setAttribute(name, value) {
		const found = this.attributes.find(hasName(name));
		const oldValue = (found && found.value) || null;
		if (this.attributeChangedCallback && this.constructor.observedAttributes.indexOf(name) !== -1) {
			this.attributeChangedCallback(name, oldValue, value);
		}
		if (!found) {
			this.attributes.push({ name, value });
		} else {
			Object.assign(found, { value });
		}
		MutationObserver.trigger(this, MutationObserver.ATTRIBUTE, {
			attributeName: name,
			oldValue,
		});
		return true;
	}

	removeAttribute(name) {
		const found = this.attributes.find(hasName(name));
		const index = found ? this.attributes.indexOf(found) : -1;
		if (index !== -1) this.attributes.splice(index, 1);
	}

}

/**
 * Default HTMLElement interface
 */

class HTMLElement extends Element {

	static get tagNames() {
		return ELEMENTS.HTMLElement;
	}

}
interfaces.HTMLElement = HTMLElement;

/**
 * Others elements interfaces inheriting from HTMLElement
 */

Object.keys(ELEMENTS).slice(1).forEach((name) => {
	class constructor extends HTMLElement {
		static get tagNames() {
			return ELEMENTS[name];
		}
	}
	interfaces[name] = constructor;
});

/**
 * Invalid element interface
 */

class HTMLUnknownElement extends HTMLElement {

	static get tagNames() {
		return [];
	}

}
interfaces.HTMLUnknownElement = HTMLUnknownElement;

module.exports = { Element, interfaces };
