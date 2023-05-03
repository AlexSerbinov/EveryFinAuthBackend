const fetch = require('node-fetch');

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



