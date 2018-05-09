/*  */
export default (evt) => {
  if (evt.stopPropagation) {
    evt.stopPropagation();
  }
  evt.preventDefault();
};
