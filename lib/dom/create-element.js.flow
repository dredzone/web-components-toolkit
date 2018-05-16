/* @flow */
import templateContent from './template-content.js';

export default (html: string): Node => {
  const template: HTMLTemplateElement = document.createElement('template');
  template.innerHTML = html.trim();
  const frag: DocumentFragment = templateContent(template);
  if (frag && frag.firstChild) {
    return frag.firstChild;
  }
  throw new Error(`Unable to createElement for ${html}`);
};
