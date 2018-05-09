/*  */
export default (
  creator = Object.create.bind(null, null, {})
) => {
  let store = new WeakMap();
  return (obj) => {
    let value = store.get(obj);
    if (!value) {
      store.set(obj, (value = creator(obj)));
    }
    return value;
  };
};
