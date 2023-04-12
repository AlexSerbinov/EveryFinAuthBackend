let deleteFields = async (object, ...fields) => {
	try {
		let newArrObj = [];
		if (object.length >= 1) {
			for (const iterator of object) {
				let deepCopy = JSON.parse(JSON.stringify(iterator));
				for (const elem of fields) {
					delete deepCopy[elem];
				}
				newArrObj.push(deepCopy);
			}
			return newArrObj;
		} else {
			let deepCopy = JSON.parse(JSON.stringify(object));
			for (const elem of fields) {
				delete deepCopy[elem];
			}
			return deepCopy;
		}
	} catch (error) {
		console.error(error);
		return Error('cannot delete field');
	}
};

module.exports = { deleteFields };
