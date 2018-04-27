/* @flow */
import declare from './mixin/declare';
import dedupe from './mixin/dedupe';
import cache from './mixin/cache';

export default (mixin: Function): Function => dedupe(cache(declare(mixin)));
