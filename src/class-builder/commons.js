/* @flow */
import uniqueId from '../unique-id.js';

// used by wrap() and unwrap()
export const wrappedMixinKey: string = uniqueId('_wrappedMixin');

// used by apply() and isApplicationOf()
export const appliedMixinKey: string = uniqueId('_appliedMixin');
