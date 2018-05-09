/*  */

let prevTimeId = 0;
let prevUniqueId = 0;

export default (prefix) => {
  let newUniqueId = Date.now();
  if (newUniqueId === prevTimeId) {
    ++prevUniqueId;
  } else {
    prevTimeId = newUniqueId;
    prevUniqueId = 0;
  }

  let uniqueId = `${String(newUniqueId)}${String(prevUniqueId)}`;
  if (prefix) {
    uniqueId = `${prefix}_${uniqueId}`;
  }
  return uniqueId;
};
