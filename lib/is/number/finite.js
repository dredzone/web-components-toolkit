/*  */
import nan from './nan';
import infinite from './infinite';

export default (n) => !(infinite(n) || nan(n));
