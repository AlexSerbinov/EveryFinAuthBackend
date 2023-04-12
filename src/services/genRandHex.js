const genRandHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

module.exports = { genRandHex };
