export function testAction(node) {
	// setup work goes here...
	console.log(node);

	return {
		destroy() {
			// ...cleanup goes here
		}
	};
}