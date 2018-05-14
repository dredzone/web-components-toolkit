/*  */

export default (fetch) => {
	return (...args) => {
		return fetch(...args)
			.then((response) => {
				try {
					return response.json();
				} catch (err) {
					return response;
				}
			});
	}
}