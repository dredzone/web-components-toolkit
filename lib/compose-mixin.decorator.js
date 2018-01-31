/*  */
import {dedupeMixin} from './dedupe-mixin.decorator';
import {cacheMixin} from './cache-mixin.decorator';
import {declareMixin} from './declare-mixin.decorator';

export const composeMixin = (mixin) => dedupeMixin(
	cacheMixin(
		declareMixin(mixin)
	)
);
