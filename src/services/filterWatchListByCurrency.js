let filterWatchListByCurrency = async (watchListArr, coin) => {
	try {
		const result = watchListArr.filter((elem) => {
			return elem.currency === coin;
		});
		return result;
	} catch (error) {
		return Error('cannot paginate data');
	}
};

module.exports = { filterWatchListByCurrency };
