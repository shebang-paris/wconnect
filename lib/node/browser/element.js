/* eslint-disable max-classes-per-file */

const interfaces = {};

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
	HTMLTemplateElement: ['template'],
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
 * Default HTMLElement interface
 */

class HTMLElement {

	constructor() {
		this.tagName = '';
		this.attributes = [];
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
		if (!found) {
			this.attributes.push({ name, value });
		} else {
			Object.assign(found, { value });
		}
		return true;
	}

	removeAttribute(name) {
		const found = this.attributes.find(hasName(name));
		const index = found ? this.attributes.indexOf(found) : -1;
		if (index !== -1) this.attributes.splice(index, 1);
	}

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

class HTMLUnknownElement extends HTMLElement {}
interfaces.HTMLUnknownElement = HTMLUnknownElement;

module.exports = interfaces;