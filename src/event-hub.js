/* @flow */

export type TEventHub = {
  emit(event: string, data: any): void,

  on(event: string, handler: Function): void,

  off(event: string, handler: Function): void
};

const eventHub = (): TEventHub => ({
  hub: Object.create(null),
  emit(event: string, ...args: Array<any>): void {
    (this.hub[event] || []).forEach(handler => handler(...args));
  },
  on(event: string, handler: Function): void {
    if (!this.hub[event]) this.hub[event] = [];
    this.hub[event].push(handler);
  },
  off(event: string, handler: Function): void {
    const i: number = (this.hub[event] || []).findIndex(h => h === handler);
    if (i > -1) this.hub[event].splice(i, 1);
  }
});

export default eventHub();
