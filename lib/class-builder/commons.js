/*  */
import uniqueId from '../unique-id';

// used by wrap() and unwrap()
export const wrappedMixinKey = uniqueId('_wrappedMixin');

// used by apply() and isApplicationOf()
export const appliedMixinKey = uniqueId('_appliedMixin');
