/* @flow */
import is from '../is';

const merge: Function = (
  target: any,
  source: any,
  optionsArgument: Object
): Object | Array<any> => {
  const sourceIsArray: boolean = is.array(source);
  const targetIsArray: boolean = is.array(target);
  const sourceAndTargetTypesMatch: boolean = sourceIsArray === targetIsArray;
  const options: Object = optionsArgument || {
    arrayMerge: defaultArrayMerge
  };

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, optionsArgument);
  } else if (sourceIsArray) {
    let arrayMerge: Function = options.arrayMerge || defaultArrayMerge;
    return arrayMerge(target, source, optionsArgument);
  }
  return objectsMerge(target, source, optionsArgument);
};

export const all: Function = (
  array: Array<any>,
  optionsArgument: Object
): Object | Array<any> => {
  if (!is.array(array)) {
    throw new Error('first argument should be an array');
  }

  return array.reduce((prev, next) => {
    return merge(prev, next, optionsArgument);
  }, {});
};

export default merge;

function isMergeableObject(value: any): boolean {
  return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value: any): boolean {
  return value && is.object(value);
}

function isSpecial(value: any): boolean {
  return is.regexp(value) || is.date(value);
}

function emptyTarget(val: any): Object | Array<[]> {
  return is.array(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(
  value: any,
  optionsArgument: Object
): any {
  const clone = !optionsArgument || optionsArgument.clone !== false;
  return clone && isMergeableObject(value)
    ? merge(emptyTarget(value), value, optionsArgument)
    : value;
}

function defaultArrayMerge(
  target: Array<any>,
  source: Array<any>,
  optionsArgument: Object
): Array<any> {
  return target.concat(source).map(element => {
    return cloneUnlessOtherwiseSpecified(element, optionsArgument);
  });
}

function objectsMerge(
  target: any,
  source: any,
  optionsArgument: Object
): Object {
  let destination = {};
  if (isMergeableObject(target)) {
    Object.keys(target).forEach(key => {
      destination[key] = cloneUnlessOtherwiseSpecified(
        target[key],
        optionsArgument
      );
    });
  }
  Object.keys(source).forEach(key => {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneUnlessOtherwiseSpecified(
        source[key],
        optionsArgument
      );
    } else {
      destination[key] = merge(target[key], source[key], optionsArgument);
    }
  });

  return destination;
}
