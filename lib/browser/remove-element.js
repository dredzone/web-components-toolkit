/*  */
export default (element) => {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
};
