/* @flow */
import {mixinDedupe} from './mixin-dedupe.decorator';
import {mixinCached} from './mixin-cached.decorator';
import {mixinApply} from './mixin-apply.decorator';

export const mixin: Function = (fn: Function): Function => mixinCached(
	mixinDedupe(
		mixinApply(fn)
	)
);
