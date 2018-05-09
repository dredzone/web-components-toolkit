/*  */

export default (
  target,
  type,
  listener,
  capture = false
) => {
  return parse(target, type, listener, capture);
};

function addListener(
  target,
  type,
  listener,
  capture
) {
  if (target.addEventListener) {
    target.addEventListener(type, listener, capture);
    return {
      remove: function() {
        this.remove = () => {};
        target.removeEventListener(type, listener, capture);
      }
    };
  }
  throw new Error('target must be an event emitter');
}

function parse(
  target,
  type,
  listener,
  capture
) {
  if (type.indexOf(',') > -1) {
    let events = type.split(/\s*,\s*/);
    let handles = events.map(function(type) {
      return addListener(target, type, listener, capture);
    });
    return {
      remove() {
        this.remove = () => {};
        let handle;
        while ((handle = handles.pop())) {
          handle.remove();
        }
      }
    };
  }
  return addListener(target, type, listener, capture);
}
