/*  */



const eventHubFactory = () => {
  const subscribers = new Map();
  let subscriberCount = 0;

  //$FlowFixMe
  return {
    publish: function(event, ...args) {
      subscribers.forEach((subscriptions) => {
        (subscriptions.get(event) || []).forEach((callback) => {
          callback(...args);
        })
      });
      return this;
    },
    createSubscriber: function() {
      let context = subscriberCount++;
      return {
        on: function(event, callback) {
          if (!subscribers.has(context)) {
            subscribers.set(context, new Map());
          }
          //$FlowFixMe
          const subscriber = subscribers.get(context);
          if (!subscriber.has(event)) {
            subscriber.set(event, []);
          }
          //$FlowFixMe
          subscriber.get(event).push(callback);
          return this;
        },
        off: function(event) {
            //$FlowFixMe
            subscribers.get(context).delete(event);
            return this;
        },
        destroy: function() {
            subscribers.delete(context);
        }
      }
    }
  }
};

export default eventHubFactory;
