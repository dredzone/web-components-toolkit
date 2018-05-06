/* @flow */
import declare from './declare.js';
import dedupe from './dedupe.js';
import cache from './cache.js';

export default (mixin: Function): Function => dedupe(cache(declare(mixin)));
