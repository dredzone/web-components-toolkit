/* @flow */
import declare from './declare';
import dedupe from './dedupe';
import cache from './cache';

export default (mixin: Function): Function => dedupe(cache(declare(mixin)));
