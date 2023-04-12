let paginateData = async (req, res, watchList) => {
	try {
		// const supportedPagination = ['10', '25', '50', '100'];
		const currentPageNumber = +req.params.currentPageNumber;
		const numItemsPerPage = +req.params.numItemsPerPage;
		// if (!supportedPagination.includes(req.params.numItemsPerPage)) return res.status(403).json({ message: 'invalid pagination number' });
		const totalTransactionCount = watchList.length;
		const offset = currentPageNumber > 1 ? numItemsPerPage * (currentPageNumber - 1) : 0;
		let paginatedArr = [];
		for (let i = 0; i < totalTransactionCount; i++) {
			const element = watchList[offset + i];
			if (i >= numItemsPerPage || i >= totalTransactionCount - offset) break;
			paginatedArr.push(element);
		}
		return {
			currentPageNumber: currentPageNumber,
			totalCount: totalTransactionCount,
			numItemsPerPage: numItemsPerPage,
			items: paginatedArr,
		};
	} catch (error) {
		return Error('cannot paginate data');
	}
};

module.exports = { paginateData };

