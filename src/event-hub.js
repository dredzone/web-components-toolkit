/* @flow */
type TEventSubscribers = Map<number, TEventSubscriptions>;
type TEventSubscriptions = Map<string, TEventSubscriptionEvents>;
type TEventSubscriptionEvents = Array<Function>;

export type TEventHub = {
  publish(event: string, data: any): void,
  createSubscriber(): TEventHubSubscriber
};

export type TEventHubSubscriber = {
  on(context: any, event: string, callback: Function): void,
  off(context: any, event: string, callback: Function): void,
  destroy(context: any): void
};

const eventHubFactory = (): TEventHub => {
  const subscribers: TEventSubscribers = new Map();
  let subscriberCount = 0;

  //$FlowFixMe
  return {
    publish: function(event: string, ...args: Array<any>): void {
      subscribers.forEach(subscriptions => {
        (subscriptions.get(event) || []).forEach(callback => {
          callback(...args);
        });
      });
      return this;
    },
    createSubscriber: function() {
      let context = subscriberCount++;
      return {
        on: function(event: string, callback: Function): void {
          if (!subscribers.has(context)) {
            subscribers.set(context, new Map());
          }
          //$FlowFixMe
          const subscriber: TEventSubscriptions = subscribers.get(context);
          if (!subscriber.has(event)) {
            subscriber.set(event, []);
          }
          //$FlowFixMe
          subscriber.get(event).push(callback);
          return this;
        },
        off: function(event: string): void {
          //$FlowFixMe
          subscribers.get(context).delete(event);
          return this;
        },
        destroy: function(): void {
          subscribers.delete(context);
        }
      };
    }
  };
};

export default eventHubFactory;
