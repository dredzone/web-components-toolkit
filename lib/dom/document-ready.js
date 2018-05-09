/*  */
export default (passThrough) => {
  if (document.readyState === 'loading') {
    return new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', () => resolve(passThrough));
    });
  }

  return Promise.resolve(passThrough);
};
