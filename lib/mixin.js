/*  */
import declare from './mixin/declare';
import dedupe from './mixin/dedupe';
import cache from './mixin/cache';

export default (mixin) => dedupe(cache(declare(mixin)));
