/* @flow */
import nan from './nan';
import infinite from './infinite';

export default (n: any): boolean => !(infinite(n) || nan(n));
