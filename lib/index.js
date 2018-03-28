/*  */

// AOP style decorators
export * from './advice-before.decorator';
export * from './advice-after.decorator';
export * from './advice-around.decorator';
export * from './advice-after-throw.decorator';

// DOM classList APIs utilities
export * from './class-list-contains.utility';
export * from './class-list-add.utility';
export * from './class-list-remove.utility';

// DOM commonly used set of utilities
export * from './element-siblings.utility';
export * from './create-element.utility';
export * from './closest-element.utility';
export * from './is-descendant-element.utility';
export * from './custom-events.utility';
export * from './template-content.utility';
export * from './selector-matches.utility';
export * from './global-scope.utility';
export * from './before-element.utility';
export * from './after-element.utility';
export * from './append-element.utility';
export * from './prepend-element.utility';
export * from './remove-element.utility';
export * from './element-children.utility';

// runtime type checking
export * from './is-type.utility';
export * from './is-number.utility';

// Object helpers
export * from './object-assign.utility';
export * from './object-nested-keys.utility';
export * from './object-deep-freeze.utility';
export * from './object-deep-merge.utility';

// general purpose set of utilities
export * from './unique-id.utility';
export * from './unique-string.utility';
export * from './debounce.utility';
export * from './throttle.utility';
export * from './function-name.utility';
export * from './create-storage.utility';
export * from './delay.utility';
export * from './document-ready.utility';

// class subfactories pattern utilities
export * from './class-builder.utility';
export * from './mixin.helper';
export * from './declare-mixin.decorator';
export * from './dedupe-mixin.decorator';
export * from './cache-mixin.decorator';
export * from './compose-mixin.decorator';

// ponyfills that don't pollute global space
export * from './map.ponyfill';
export * from './weakmap.ponyfill';
export * from './weakset.ponyfill';
export * from './set.ponyfill';
