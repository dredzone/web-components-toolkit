/* @flow */
import declare from './declare-mixin-decorator';
import dedupe from './dedupe-mixin-decorator';
import cache from './cache-mixin-decorator';

export default (mixin: Function): Function => dedupe(cache(declare(mixin)));
