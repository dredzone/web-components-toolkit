/* @flow */
import { browser } from '../../environment.js';
import before from '../../advice/before.js';
import elementChildren from '../element-children.js';
import type { ICustomElement } from './custom-element-mixin.js';

export type SlotsData = {
  [key: string]: Node,
  default: Array<Node>
};

export interface ISlots {
  slots: SlotsData;

  slotsAssigned(): void;
}

type InType = HTMLElement & ICustomElement;
type OutType = InType & ISlots;

export default browser((baseClass: Class<InType>): Class<OutType> => {
  return class Slots extends baseClass implements ISlots {
    slots: SlotsData;

    static finalizeClass(): void {
      super.finalizeClass();
      before(createBeforeRenderAdvice(), '_onRender')(this);
    }

    construct(): void {
      super.construct();
      this.slots = { default: [] };
    }

    slotsAssigned(): void {}
  };

  function createBeforeRenderAdvice(): Function {
    const hypenRegEx: RegExp = /-([a-z])/g;

    return function(firstRender: boolean): void {
      const context: HTMLElement & ISlots = this;
      if (firstRender) {
        const children: Array<Element> = elementChildren(context);
        children.forEach((child: Element) => {
          const attribute: mixed = child.getAttribute
            ? child.getAttribute('slot')
            : null;
          if (typeof attribute === 'string' && attribute.length > 0) {
            const slot: string = attribute.replace(hypenRegEx, match =>
              match[1].toUpperCase()
            );
            context.slots[slot] = child;
          } else {
            context.slots.default.push(child);
          }
        });
        context.slotsAssigned();
      }
    };
  }
});
