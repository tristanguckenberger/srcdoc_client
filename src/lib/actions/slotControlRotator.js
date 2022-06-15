export function slotControlRotator(node, width) {
    // setup work goes here...
    if (width <= 30) {
        node.style.transform = 'rotate(90deg)';
    } else {
        node.style.transform = 'rotate(0deg)';
    }
    // const handleClick = (event) => {
	// 	if (node.contains(event.target)) {
	// 		// node.dispatchEvent(new CustomEvent("outclick"));
            
    //         console.log()
    //         // node.style.transorm = 'rotate(90deg)';
            
	// 	}
    //     console.log(node.style);
    //     // console.log(event)
	// };

	// document.addEventListener("click", handleClick, true);

	

	return {
		destroy() {
			// ...cleanup goes here
            // document.removeEventListener("click", handleClick, true);
		}
	};
}