/* @flow */
import { browser } from '../environment.js';
import templateContent from './template-content.js';

export default browser((html: string): Node => {
  const template: HTMLTemplateElement = document.createElement('template');
  template.innerHTML = html.trim();
  const frag: DocumentFragment = templateContent(template);
  if (frag && frag.firstChild) {
    return frag.firstChild;
  }
  throw new Error(`Unable to createElement for ${html}`);
});
