const isEmail = (value) => !/[a-z0-9.]+@[a-z]+\.[a-z]+/.test(value.toLowerCase().trim());
const oneLowercaseChar = (value) => !/^(?=.*[a-z])/.test(value);
const oneUppercaseChar = (value) => !/^(?=.*[A-Z])/.test(value);
const singlePasswordRegEx = (value) => !/^(?=.*\d)(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*\W)(?=.*[a-zA-Z]).{8,32}$/.test(value);
const oneNumber = (value) => !/^(?=.*[0-9])/.test(value);
const oneSpecialChar = (value) => !/^(?=.*\W)/.test(value);
const notEmpty = (value) => value.length === 0;
const isEthereumAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value);

module.exports = { isEmail, oneLowercaseChar, oneUppercaseChar, singlePasswordRegEx, oneNumber, oneSpecialChar, notEmpty, isEthereumAddress};

