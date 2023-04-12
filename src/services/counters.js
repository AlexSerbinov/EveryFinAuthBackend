let watchlistTagCounter = (watchList) => {
	try {
        let count = 0
        for (const element of watchList) {
            if(element.tag) count++
        }
		// console.log(count)
        return count
	} catch (error) {
		return {

		}
	}
};

module.exports = { watchlistTagCounter };
