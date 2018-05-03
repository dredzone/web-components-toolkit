/* @flow */
import declare from './declare-decorator';
import dedupe from './dedupe-decorator';
import cache from './cache-decorator';

export default (mixin: Function): Function => dedupe(cache(declare(mixin)));
