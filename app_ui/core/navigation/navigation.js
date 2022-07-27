// Prevent side-scroll navigation behaviors
document.body.addEventListener("mousewheel", function(e) {
	// TODO: Test with Firefox and Safari
	e.stopPropagation(); // This appears to work for chrome by itself
	/* The remaiing piece is from the StackOverflow solution:
	 * @see https://stackoverflow.com/questions/50616221/prevent-page-navigation-on-horizontal-scroll
	var max = this.scrollWidth - this.offsetWidth; // this might change if you have dynamic content, perhaps some mutation observer will be useful here

	if(this.scrollLeft + e.deltaX < 0 || this.scrollLeft + e.deltaX > max) {
		e.preventDefault();
		this.scrollLeft = Math.max(0, Math.min(max, this.scrollLeft + e.deltaX));
	}
	*/
}, false);
