const { interfaces } = require('./element');
const Document = require('./document');

/**
 * Template interface
 */

class HTMLTemplateElement extends interfaces.HTMLElement {

	constructor() {
		super();
		const document = new Document();
		this.content = document.createDocumentFragment();
		this.content.ownerDocument = document;
	}

	get innerHTML() {
		return this.content.innerHTML;
	}

	set innerHTML(html) {
		this.content.innerHTML = html;
	}

	static get tagNames() {
		return ['template'];
	}

}
interfaces.HTMLTemplateElement = HTMLTemplateElement;

module.exports = HTMLTemplateElement;
