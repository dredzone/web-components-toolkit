import {MixinBuilder} from './mixin-builder';

export const mix = (superClass: Class<any>) => new MixinBuilder(superClass);
