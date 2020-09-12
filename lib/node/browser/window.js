/* eslint-disable max-classes-per-file */

/**
 * Default window interface
 */

const window = {};

/**
 * DOM elements constructor / tag names mapping
 */

const ELEMENTS = {
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
	HTMLDocument: ['document'],
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

const HTMLElement = class HTMLElement {};
window.HTMLElement = HTMLElement;

class HTMLUnknownElement extends HTMLElement {}
window.HTMLUnknownElement = HTMLUnknownElement;

Object.keys(ELEMENTS).forEach((classname) => {
	class constructor extends HTMLElement {}
	window[classname] = constructor;
});

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

module.exports = window;
