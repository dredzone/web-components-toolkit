/*  */
export default (
  obj,
  key,
  defaultValue = undefined
) => {
  if (key.indexOf('.') === -1) {
    return obj[key] ? obj[key] : defaultValue;
  }
  const parts = key.split('.');
  const length = parts.length;
  let object = obj;

  for (let i = 0; i < length; i++) {
    object = object[parts[i]];
    if (typeof object === 'undefined') {
      object = defaultValue;
      return;
    }
  }
  return object;
};
