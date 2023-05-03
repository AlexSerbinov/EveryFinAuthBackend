const fetch = require('node-fetch');
require('dotenv').config();


exports.joeTokenlists = async (req, res) => {
    try {
            const url = 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/mc.tokenlist.json';   
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
		res.status(200).send({
			data: data
		});
            } catch (error) {
                console.error('An error occurred while fetching the data:', error);
            }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.getTokenBalancesByAddress = async (req, res) => {
    try {
        const address = req.params.address;
        const key = process.env.COVALENT_API_KEY; 
        if(!address) res.status(404).json({ success: false, message: "Please provide address" });

        let queryParams = req.query;
        if(!queryParams['quote-currency']) queryParams['quote-currency'] = 'USD';
        if(!queryParams['no-nft-fetch']) queryParams['no-nft-fetch'] = 'true';

        const queryString = Object.keys(queryParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
            .join('&');
            
            const url = `https://api.covalenthq.com/v1/43114/address/${address}/balances_v2/?key=${key}`+ 
            (queryString ? `&${queryString}` : '');
            
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            res.status(200).send({
                data: data
            });
        } catch (error) {
            console.error('An error occurred while fetching the data:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.getPortfolioByAddress = async (req, res) => {
    try {
        const address = req.params.address;
        const key = process.env.COVALENT_API_KEY; 
        if(!address) res.status(404).json({ success: false, message: "Please provide address" });

        let queryParams = req.query;
        const queryString = Object.keys(queryParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
            .join('&');
        console.log(queryString);
        
        const url = `https://api.covalenthq.com/v1/43114/address/${address}/portfolio_v2/?key=${key}`+
        (queryString ? `&${queryString}` : '');
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            res.status(200).send({
                data: data
            });
        } catch (error) {
            console.error('An error occurred while fetching the data:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



