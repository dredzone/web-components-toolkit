/* @flow */

let prevTimeId: number = 0;
let prevUniqueId: number = 0;

export default (prefix?: string): string => {
  let newUniqueId: number = Date.now();
  if (newUniqueId === prevTimeId) {
    ++prevUniqueId;
  } else {
    prevTimeId = newUniqueId;
    prevUniqueId = 0;
  }

  let uniqueId: string = `${String(newUniqueId)}${String(prevUniqueId)}`;
  if (prefix) {
    uniqueId = `${prefix}_${uniqueId}`;
  }
  return uniqueId;
};
