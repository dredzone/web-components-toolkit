/*  */
import declare from './declare';
import dedupe from './dedupe';
import cache from './cache';

export default (mixin) => dedupe(cache(declare(mixin)));
