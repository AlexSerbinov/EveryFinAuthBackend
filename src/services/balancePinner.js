const fetch = require('node-fetch');
const {btcu_testnet, btcu } = require('../const/const.js');

let fetchToCoreService = async (address, currency) => {
	try {
		let url;
		if (process.env.ENVIRONMENT === 'development') {
			if(currency === btcu) url = `${process.env.CORE_SERVICE_HOST_DEVELOPMENT}:${process.env.CORE_SERVICE_PORT_DEVELOPMENT}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_MAINNET_PATH}${address}`;
			else if(currency === btcu_testnet) url = `${process.env.CORE_SERVICE_HOST_DEVELOPMENT}:${process.env.CORE_SERVICE_PORT_DEVELOPMENT}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_TESTNET_PATH}${address}`;
		}
		else if (process.env.ENVIRONMENT === 'production') {
			if(currency === btcu) url = `${process.env.CORE_SERVICE_HOST_PRODUCTION}:${process.env.CORE_SERVICE_PORT_PRODUCTION}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_MAINNET_PATH}${address}`;
			else if(currency === btcu_testnet) url = `${process.env.CORE_SERVICE_HOST_PRODUCTION}:${process.env.CORE_SERVICE_PORT_PRODUCTION}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_TESTNET_PATH}${address}`;
		}
		// console.log(url);
		//  url = `http://core_service:3000/api/btcu/getaddressinfo/mmoKM64gzCSqqE6oimcPVAXS1mjPMTegeF`
		// console.log(url);
		let balance;
		await fetch(url)
			.then((res) => res.json())
			.then((json) => (balance = json.balance))
			.catch((err) => {
				balance = '';
				console.log('trouble with core service', new Date(Date.now()));
			});
		if (typeof balance !== 'number') return '';
		return balance;
	} catch (error) {
		console.error('ERROR: cannot get the balance from explorer', address);
		return '';
	}
};

let balancePinner = async (watchList, currency) => {
	try {
		await Promise.all(
			watchList.map(async (elem) => {
				if (elem.address) {
					elem.balance = await fetchToCoreService(elem.address, currency);
				}
			})
		);
	} catch (error) {
		console.error('ERROR: cannot pin the balance');
	}
};

let totalBalanceCounter = async (watchList) => {
	try {
		let grandTotal = 0;
		let grandTotalUSD = 0;
		for (const element of watchList) {
			grandTotal = grandTotal + +element.balance;
		}
		grandTotal ? (grandTotalUSD = 0) : (grandTotalUSD = 0); // here will be function wich get usd/btcu rate from coinsbit
		return { grandTotal, grandTotalUSD };
	} catch (error) {
		return {
			grandTotal: 0,
			grandTotalUSD: 0,
		};
	}
};

module.exports = { balancePinner, totalBalanceCounter };
