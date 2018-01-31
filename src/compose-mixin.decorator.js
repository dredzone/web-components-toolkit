/* @flow */
import {dedupeMixin} from './dedupe-mixin.decorator';
import {cacheMixin} from './cache-mixin.decorator';
import {declareMixin} from './declare-mixin.decorator';

export const composeMixin: Function = (mixin: Function): Function => dedupeMixin(
	cacheMixin(
		declareMixin(mixin)
	)
);
