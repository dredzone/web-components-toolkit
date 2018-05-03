/*  */
import declare from './declare-decorator';
import dedupe from './dedupe-decorator';
import cache from './cache-decorator';

export default (mixin) => dedupe(cache(declare(mixin)));
