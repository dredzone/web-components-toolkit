/*  */
import templateContent from './template-content.js';

export default (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const frag = templateContent(template);
  if (frag && frag.firstChild) {
    return frag.firstChild;
  }
  throw new Error(`Unable to createElement for ${html}`);
};
