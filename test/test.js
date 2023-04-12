require('dotenv').config();
let chai = require('chai');
let chaiHttp = require('chai-http');
const fs = require('fs');
const expect = chai.expect;
let should = chai.should();
var path = require('path');
const {
	ERROR_NO_USER,
	ERROR_TOKEN_LIFETIME_IS_OVER,
	ERROR_USER_NOT_VERIFICATION,
	ERROR_USER_ALREADY_VERIFIED,
	PASSWORD_SUCCESSFULLY_CHANGED,
	WATCHLIST_ADDRESS_ALREADY_EXIST,
	INVALID_NOTIFICATION_STATUS,
	OFF,
	ALL,
	ONLY_INCOMING,
	ERROR_WRONG_ADDRESS,
	ONLY_OUTGOING,
	WATCHLIST_ADDRESS_NOT_PROVIDED,
	WATCHLIST_ADDRESS_NOT_FOUND,
	TX_HASH_ALREADY_EXIST,
	TX_HASH_NOT_PROVIDED,
	TX_HASH_NOT_FOUND,
	ERROR_WRONG_TX_HASH,
	CURRENCY_NOT_PROVIDED,
} = require('../src/const/const.js');

chai.use(chaiHttp);
const server = `http://localhost`;
const port = +process.env.PORT || 7515;
const url = `${server}:${port}`;

let randString = () => {
	return `${Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, '')}${Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, '')}`;
};
let randPassWithProperties = () => {
	return `${randString()}F12)`;
};
let randEmail = () => {
	return `${randString()}@gmail.com`;
};
const email = randEmail();
const password = randPassWithProperties();
const login = randString();
let verificationToken;
let verificationTokenMasternode;
let authToken;
let authTokenMasternode;
let btcu = 'btcu';
let btcu_testnet = 'btcu_testnet';
const address1 = 'mhwjbp5bgKLub6vwEVNewePqaT25DzGzxf';
const address2 = 'mic54R1mfEY3keWx223YxGDGJVZ86Dadq7';
const address3 = 'n3SEsMgHnqsaJT5uPipjRMXC4EzNUsKN6B';
const wrongAddress = 'mhwjbp5bgKLub6vwEVNewePqaT25DzGzxfd';

const txHash1 = '73c6976c2b130b66e36b58aa86961e5ca89f947bafe20ffc81e1bacd48c8cd87';
const txHash2 = '8db3371e17673b69de5f8bd299b0ad6cbe9f0abdc809cbc2cfbc3e147feae37b';
const txHash3 = 'c8fe37e9f09dc8e08b84971f1eaf26ac378853662783a0e6f252daa330a51e96';
const wrongTxHash = 'c8fe37e9f09dc8e08b84971f1eaf26ac378853662783a0e6f252daa330a51e95';

describe('get all users from DB', () => {
	it('it should GET all users', (done) => {
		chai.request(url)
			.get('/api-user/user/allUsers')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.not.be.a('array');
				done();
			});
	});
});

describe('register a new user', function () {
	this.timeout(13000);

	it('test without masternode aaddress', (done) => {
		let body = {
			email,
			password: password,
			confirmPassword: password,
			login: login,
		};
		chai.request(url)
			.post('/api-user/auth/register')
			.type('form')
			.send(body)
			.end((err, res) => {
				console.log(url);
				console.log(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				verificationToken = res.body.message.slice(res.body.message.indexOf('token=') + 6, res.body.message.indexOf('token=') + 46);
				done();
			});
	});

	it('test with masternode aaddress', (done) => {
		let password = randPassWithProperties();
		let login = randString();
		let body = {
			email: randEmail(),
			password: password,
			confirmPassword: password,
			login: login,
			masterNodeAddress: address1,
		};

		chai.request(url)
			.post('/api-user/auth/register')
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				verificationTokenMasternode = res.body.message.slice(res.body.message.indexOf('token=') + 6, res.body.message.indexOf('token=') + 46);

				done();
			});
	});
});

describe('login before verify', function () {
	this.timeout(10000);
	it('should return the error wirh message "ERROR_USER_NOT_VERIFICATION"', (done) => {
		let body = {
			email,
			password,
		};
		chai.request(url)
			.post('/api-user/auth/login/')
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(401);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(ERROR_USER_NOT_VERIFICATION);
				done();
			});
	});
});

describe('verify the user by verification link', function () {
	this.timeout(10000);
	it('verify the token from email', (done) => {
		let body = {
			token: verificationToken,
		};
		chai.request(url)
			.post('/api-user/auth/verify/')
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('token');
				if (res.body.token) authToken = res.body.token;
				done();
			});
	});
	it('verify the token from email user with masternode address', (done) => {
		let body = {
			token: verificationTokenMasternode,
		};
		chai.request(url)
			.post('/api-user/auth/verify/')
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('token');
				if (res.body.token) authTokenMasternode = res.body.token;
				done();
			});
	});
});

describe('try to verify the user by verification link twice', function () {
	this.timeout(10000);
	it('should return the error wirh message "ERROR_USER_ALREADY_VERIFIED"', (done) => {
		let body = {
			token: verificationToken,
		};
		chai.request(url)
			.post('/api-user/auth/verify/')
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(400);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(ERROR_USER_ALREADY_VERIFIED);
				done();
			});
	});
});

describe('login after verify', function () {
	this.timeout(10000);
	it('login after verify', (done) => {
		let body = {
			email,
			password,
		};
		chai.request(url)
			.post('/api-user/auth/login/')
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('token');
				if (res.body.token) {
					authToken = res.body.token;
				}
				done();
			});
	});
});

// Я пока не знаю что єто такое, спросить у Некита
// describe("reset password with parameters", function () {
//     this.timeout(10000);
//     it('reset password with parameters', (done) => {
//         let body = {
//             email,
//             password,
//             token: authToken
//         }
//         chai.request(url)
//             .post('/api-user/auth/reset//')
//             .type('form')
//             .send(body)
//             .end((err, res) => {
//                 console.log(res.body)
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property("token")
//                 if (res.body.token) authToken = res.body.token
//                 done();
//             });
//     });
// });

describe('change password', function () {
	this.timeout(10000);
	it('change password', (done) => {
		let newPassword = randPassWithProperties();
		let body = {
			oldPassword: password,
			password: newPassword,
			confirmPassword: newPassword,
		};
		chai.request(url)
			.put('/api-user/auth/changePassword/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(PASSWORD_SUCCESSFULLY_CHANGED);
				done();
			});
	});
});

describe('get user from DB by Auth token', () => {
	it('should return a user object', (done) => {
		chai.request(url)
			.get('/api-user/user/')
			.set('authorization', authToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('token');
				res.body.should.have.property('jwtCreatedAt');
				res.body.should.have.property('_id');
				res.body.should.have.property('avatar');
				res.body.should.have.property('email');
				res.body.should.have.property('login');
				res.body.email.length.should.not.equal(0);
				res.body.login.length.should.not.equal(0);
				res.body.isVerified.should.equal(true);
				res.body.should.have.property('name');
				res.body.should.have.property('lastName');
				res.body.should.have.property('publicProfileBio');
				res.body.should.have.property('isVerified');
				res.body.should.have.property('masterNodeAddress');

				done();
			});
	});
});

describe('upload image', function () {
	this.timeout(10000);
	it('upload image', (done) => {
		// let newPassword = randPassWithProperties()
		// let body = {
		//     oldPassword: password,
		//     password: newPassword,
		//     confirmPassword: newPassword,
		// }
		chai.request(url)
			.put('/api-user/user/upload')
			// .field('customKey', 'customValue')
			.set('authorization', authToken)
			// .set('Content-Type', "multipart/form-data")
			// .attach('avatar', fs.readFileSync(__dirname, 'mario.jpeg'))
			.attach('avatar', fs.readFileSync(path.join(__dirname, './mario.jpeg')), 'mario.jpeg')
			.type('form')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('avatar');
				res.body.avatar.length.should.not.equal(0);
				done();
			});
	});
});

describe('delete avatar', function () {
	this.timeout(10000);
	it('delete avatar', (done) => {
		chai.request(url)
			.delete('/api-user/user/upload')
			.set('authorization', authToken)
			.type('form')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('avatar');
				res.body.avatar.length.should.equal(0);
				done();
			});
	});
});

describe('update info', function () {
	this.timeout(10000);
	it('update name', (done) => {
		let body = {
			name: 'testname',
		};
		chai.request(url)
			.put('/api-user/user')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('name');
				res.body.name.should.equal('testname');
				done();
			});
	});
	it('update masterNodeAddress', (done) => {
		let body = {
			masterNodeAddress: 'testMasterNodeAddress',
		};
		chai.request(url)
			.put('/api-user/user')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('masterNodeAddress');
				res.body.masterNodeAddress.should.equal('testMasterNodeAddress');
				done();
			});
	});
	it('update lastName', (done) => {
		let body = {
			lastName: 'testlastName',
		};
		chai.request(url)
			.put('/api-user/user')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('lastName');
				res.body.lastName.should.equal('testlastName');
				done();
			});
	});
	it('update email', (done) => {
		const email = randEmail();
		let body = {
			email,
		};
		chai.request(url)
			.put('/api-user/user')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('email');
				res.body.email.should.equal(email);
				done();
			});
	});
	it('update login', (done) => {
		const login = randString();
		let body = {
			login,
		};
		chai.request(url)
			.put('/api-user/user')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('login');
				res.body.login.should.equal(login);
				done();
			});
	});
});

describe('get watchlist object for some user BEFORE ading them', () => {
	it('should return a user object', (done) => {
		const itemPerPage = 25;
		const page = 1;
		chai.request(url)
			.get(`/api-user/watchlist/${btcu}/${itemPerPage}/${page}`)
			.set('authorization', authToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('watchListArr');
				res.body.watchListArr.should.have.property('currentPageNumber');
				res.body.watchListArr.should.have.property('totalCount');
				res.body.watchListArr.should.have.property('numItemsPerPage');
				res.body.watchListArr.should.have.property('grandTotal');
				res.body.watchListArr.should.have.property('grandTotalUSD');
				res.body.watchListArr.should.have.property('items');
				res.body.watchListArr.items.length.should.equal(0);
				res.body.watchListArr.numItemsPerPage.should.equal(itemPerPage);
				res.body.watchListArr.currentPageNumber.should.equal(page);
				res.body.watchListArr.grandTotal.should.equal(0);
				res.body.watchListArr.grandTotalUSD.should.equal(0);
				done();
			});
	});
});

describe('add address to watch list', function () {
	this.timeout(3000);
	it('ad one watch list object to db', (done) => {
		let body = {
			address: address1,
			notificationStatus: 'ALL',
			description: 'this is a test case',
			tag: 'test tag',
			currency: btcu,
		};
		chai.request(url)
			.post('/api-user/watchlist')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.watchList[0].should.have.property('address');
				res.body.watchList[0].notificationStatus.should.equal('ALL');
				res.body.watchList[0].description.should.equal('this is a test case');
				res.body.watchList[0].tag.should.equal('test tag');
				done();
			});
	});
	it('ad second watch list object to db', (done) => {
		let body = {
			address: address2,
			currency: btcu,
			// notificationStatus: "Ff",
			// description: "this is a test case",
			// tag: "test tag"
		};
		chai.request(url)
			.post('/api-user/watchlist')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.watchList[1].should.have.property('address');
				// res.body.watchList[0].description.should.equal("this is a test case")
				// res.body.watchList[0].tag.should.equal("test tag")
				done();
			});
	});
	it('ad the same watch list address object to db', (done) => {
		let body = {
			address: address2,
			currency: btcu,
		};
		chai.request(url)
			.post('/api-user/watchlist')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(500);
				res.body.message.should.equal(WATCHLIST_ADDRESS_ALREADY_EXIST);
				done();
			});
	});

	it('ad watch list address object without tag and description and notif status', (done) => {
		let body = {
			address: address3,
			currency: btcu,
		};
		chai.request(url)
			.post('/api-user/watchlist')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.watchList[2].should.have.property('address');
				res.body.watchList[2].notificationStatus.should.equal('OFF');
				res.body.watchList[2].description.should.equal('');
				res.body.watchList[2].tag.should.equal('');
				done();
			});
	});
});

describe('get watchlist object for some user after adding 2 items', function () {
	this.timeout(5000);
	it('should return a 3 watch list object', (done) => {
		const itemPerPage = 25;
		const page = 1;
		chai.request(url)
			.get(`/api-user/watchlist/${btcu}/${itemPerPage}/${page}`)
			.set('authorization', authToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('watchListArr');
				res.body.watchListArr.should.have.property('currentPageNumber');
				res.body.watchListArr.should.have.property('totalCount');
				res.body.watchListArr.should.have.property('numItemsPerPage');
				res.body.watchListArr.should.have.property('items');
				res.body.watchListArr.should.have.property('totalCount');
				res.body.watchListArr.should.have.property('totalTags');
				res.body.watchListArr.items.length.should.equal(3);
				res.body.watchListArr.numItemsPerPage.should.equal(itemPerPage);
				res.body.watchListArr.currentPageNumber.should.equal(page);
				res.body.watchListArr.totalCount.should.equal(3);
				res.body.watchListArr.totalTags.should.equal(1);
				done();
			});
	});

	it('should return a 3 watch list object WITH BALANCES', (done) => {
		const itemPerPage = 25;
		const page = 1;
		chai.request(url)
			.get(`/api-user/watchlist/${btcu}/${itemPerPage}/${page}`)
			.set('authorization', authToken)
			.end((err, res) => {
				console.log('-=-=-=-=-=-=-=- balances -=-=-=-=-=-=-=-=-=-');
				console.log(res.body.watchListArr.items[0].balance);
				console.log(res.body.watchListArr.items[1].balance);
				console.log(res.body.watchListArr.items[2].balance);
				console.log('-=-=-=-=-=-=-=- balances -=-=-=-=-=-=-=-=-=-');
				res.body.should.have.property('watchListArr');
				res.body.watchListArr.should.have.property('grandTotal');
				res.body.watchListArr.should.have.property('grandTotalUSD');
				res.body.watchListArr.should.have.property('items');
				res.body.watchListArr.items.length.should.equal(3);
				res.body.watchListArr.grandTotal.should.not.equal(0);
				res.body.watchListArr.grandTotalUSD.should.not.equal('');
				done();
			});
	});
});

describe('change watch list address', function () {
	this.timeout(1000);
	it('change one watch list address', (done) => {
		const status = ONLY_INCOMING;
		const description = 'changed description';
		const tag = 'changed tag';
		let body = {
			address: address1,
			notificationStatus: status,
			description: description,
			tag: tag,
			currency: btcu,
		};
		chai.request(url)
			.put('/api-user/watchlist/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.body.should.be.a('object');
				res.body.watchList[0].should.have.property('notificationStatus');
				res.body.watchList[0].should.have.property('description');
				res.body.watchList[0].should.have.property('tag');
				res.body.watchList[0].notificationStatus.should.equal(status);
				res.body.watchList[0].description.should.equal(description);
				res.body.watchList[0].tag.should.equal(tag);
				done();
			});
	});

	it('change one watch list address without properties (should be "")', (done) => {
		let body = {
			address: address1,
			currency: btcu,
		};
		chai.request(url)
			.put('/api-user/watchlist/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.body.should.be.a('object');
				res.body.watchList[0].should.have.property('notificationStatus');
				res.body.watchList[0].should.have.property('description');
				res.body.watchList[0].should.have.property('tag');
				res.body.watchList[0].notificationStatus.should.equal('OFF');
				res.body.watchList[0].description.should.equal('');
				res.body.watchList[0].tag.should.equal('');
				done();
			});
	});

	it('try to change watch list object without address', (done) => {
		let body = {
			// address: address1,
		};
		chai.request(url)
			.put('/api-user/watchlist/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(WATCHLIST_ADDRESS_NOT_PROVIDED);
				done();
			});
	});

	it('try to change watch list object with wrong address', (done) => {
		let body = {
			address: wrongAddress,
			currency: btcu,
		};
		chai.request(url)
			.put('/api-user/watchlist/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(WATCHLIST_ADDRESS_NOT_FOUND);
				done();
			});
	});
});

describe('delete watch list address', function () {
	this.timeout(10000);

	it('delete one watch list address', (done) => {
		let body = {
			address: address1,
			currency: btcu,
		};
		chai.request(url)
			.delete('/api-user/watchlist/')
			.set('authorization', authToken)
			.send(body)
			.type('form')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('watchList');
				res.body.watchList.length.should.equal(2);
				done();
			});
	});
	it('delete one watch list address without setiing address', (done) => {
		chai.request(url)
			.delete('/api-user/watchlist/')
			.set('authorization', authToken)
			.type('form')
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(WATCHLIST_ADDRESS_NOT_PROVIDED);
				done();
			});
	});

	it('delete one watch list address by wrong address', (done) => {
		let body = {
			address: wrongAddress,
			currency: btcu,
		};
		chai.request(url)
			.delete('/api-user/watchlist/')
			.set('authorization', authToken)
			.send(body)
			.type('form')
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(WATCHLIST_ADDRESS_NOT_FOUND);
				done();
			});
	});
	it('delete one watch list address without set the currency', (done) => {
		let body = {
			address: wrongAddress,
		};
		chai.request(url)
			.delete('/api-user/watchlist/')
			.set('authorization', authToken)
			.send(body)
			.type('form')
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(CURRENCY_NOT_PROVIDED);
				done();
			});
	});
});

describe('get privateNodeList object for some user BEFORE ading them', () => {
	it('should return a user object', (done) => {
		const itemPerPage = 25;
		const page = 1;
		chai.request(url)
			.get(`/api-user/privateNodeList/${btcu}/${itemPerPage}/${page}`)
			.set('authorization', authToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('privateNodeListArr');
				res.body.privateNodeListArr.should.have.property('currentPageNumber');
				res.body.privateNodeListArr.should.have.property('totalCount');
				res.body.privateNodeListArr.should.have.property('numItemsPerPage');
				res.body.privateNodeListArr.should.have.property('items');
				res.body.privateNodeListArr.items.length.should.equal(0);
				res.body.privateNodeListArr.numItemsPerPage.should.equal(itemPerPage);
				res.body.privateNodeListArr.currentPageNumber.should.equal(page);
				done();
			});
	});
});

describe('add txHash to private node list', function () {
	this.timeout(3000);
	it('ad one private node list object to db', (done) => {
		let body = {
			txHash: txHash1,
			description: 'this is a test case',
			currency: btcu,
		};
		chai.request(url)
			.post('/api-user/privateNodeList')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.privateNodeList[0].should.have.property('txHash');
				res.body.privateNodeList[0].description.should.equal('this is a test case');
				done();
			});
	});
	it('ad second private node list object to db', (done) => {
		let body = {
			txHash: txHash2,
			currency: btcu,
		};
		chai.request(url)
			.post('/api-user/privateNodeList')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.privateNodeList[1].should.have.property('txHash');
				done();
			});
	});
	it('ad the same private node list txHash object to db', (done) => {
		let body = {
			txHash: txHash2,
			currency: btcu,
		};
		chai.request(url)
			.post('/api-user/privateNodeList')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(500);
				res.body.message.should.equal(TX_HASH_ALREADY_EXIST);
				done();
			});
	});

	it('ad private node list txHash object without description', (done) => {
		let body = {
			txHash: txHash3,
			currency: btcu,
		};
		chai.request(url)
			.post('/api-user/privateNodeList')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.privateNodeList[2].should.have.property('txHash');
				res.body.privateNodeList[2].description.should.equal('');
				done();
			});
	});
});

describe('get privateNodeList object for some user after adding 2 items', () => {
	it('should return a 3 private node list object', (done) => {
		const itemPerPage = 25;
		const page = 1;
		chai.request(url)
			.get(`/api-user/privateNodeList/${btcu}/${itemPerPage}/${page}`)
			.set('authorization', authToken)
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('privateNodeListArr');
				res.body.privateNodeListArr.should.have.property('currentPageNumber');
				res.body.privateNodeListArr.should.have.property('numItemsPerPage');
				res.body.privateNodeListArr.should.have.property('items');
				res.body.privateNodeListArr.should.have.property('totalCount');
				res.body.privateNodeListArr.totalCount.should.equal(3);
				res.body.privateNodeListArr.items.length.should.equal(3);
				res.body.privateNodeListArr.numItemsPerPage.should.equal(itemPerPage);
				res.body.privateNodeListArr.currentPageNumber.should.equal(page);
				done();
			});
	});
});

describe('change private node list description ', function () {
	this.timeout(1000);
	it('change one private node list description', (done) => {
		const description = 'changed description';
		let body = {
			txHash: txHash1,
			description: description,
			currency: btcu,
		};
		chai.request(url)
			.put('/api-user/privateNodeList/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.body.should.be.a('object');
				res.body.privateNodeList[0].should.have.property('description');
				res.body.privateNodeList[0].description.should.equal(description);
				done();
			});
	});

	it('change one private node list txHash without properties (should be "")', (done) => {
		let body = {
			txHash: txHash1,
			currency: btcu,
		};
		chai.request(url)
			.put('/api-user/privateNodeList/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.body.should.be.a('object');
				res.body.privateNodeList[0].should.have.property('description');
				res.body.privateNodeList[0].description.should.equal('');
				done();
			});
	});

	it('try to change private node list object without txHash', (done) => {
		chai.request(url)
			.put('/api-user/privateNodeList/')
			.set('authorization', authToken)
			.type('form')
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(TX_HASH_NOT_PROVIDED);
				done();
			});
	});

	it('try to change private node list object with wrong txHash', (done) => {
		let body = {
			txHash: wrongTxHash,
			currency: btcu,
		};
		chai.request(url)
			.put('/api-user/privateNodeList/')
			.set('authorization', authToken)
			.type('form')
			.send(body)
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(TX_HASH_NOT_FOUND);
				done();
			});
	});
});

describe('delete private node list txHash', function () {
	this.timeout(10000);

	it('delete one private node list txHash', (done) => {
		let body = {
			txHash: txHash1,
			currency: btcu,
		};
		chai.request(url)
			.delete('/api-user/privateNodeList/')
			.set('authorization', authToken)
			.send(body)
			.type('form')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('privateNodeList');
				res.body.privateNodeList.length.should.equal(2);
				done();
			});
	});
	it('delete one private node list txHash without setiing txHash', (done) => {
		chai.request(url)
			.delete('/api-user/privateNodeList/')
			.set('authorization', authToken)
			.type('form')
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(TX_HASH_NOT_PROVIDED);
				done();
			});
	});

	it('delete one private node list txHash by wrong txHash', (done) => {
		let body = {
			txHash: wrongTxHash,
			currency: btcu,
		};
		chai.request(url)
			.delete('/api-user/privateNodeList/')
			.set('authorization', authToken)
			.send(body)
			.type('form')
			.end((err, res) => {
				res.should.have.status(500);
				res.body.should.be.a('object');
				res.body.should.have.property('message');
				res.body.message.should.equal(TX_HASH_NOT_FOUND);
				done();
			});
	});
});

describe('delete user by token', function () {
	this.timeout(10000);
	it('delete user by token', (done) => {
		chai.request(url)
			.delete(`/api-user/user/`)
			.set('authorization', authToken)
			.type('form')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.message.should.equal('User has been deleted');

				// res.body.should.be.a('object');
				// res.body.should.have.property('avatar');
				// res.body.avatar.length.should.equal(0);
				done();
			});
	});
	it('delete user with masternode address', (done) => {
		chai.request(url)
			.delete(`/api-user/user/`)
			.set('authorization', authTokenMasternode)
			.type('form')
			.end((err, res) => {
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.message.should.equal('User has been deleted');

				// res.body.should.be.a('object');
				// res.body.should.have.property('avatar');
				// res.body.avatar.length.should.equal(0);
				done();
			});
	});
});

describe('TEST CONNECTING WITH CORE SERVICE', function () {
	this.timeout(5000);
	let url;
	if (process.env.ENVIRONMENT === 'development') {
		url = `${process.env.CORE_SERVICE_HOST_DEVELOPMENT}:${process.env.CORE_SERVICE_PORT_DEVELOPMENT}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_MAINNET_PATH}${address1}`;
		// else if(currency === btcu_testnet) url = `${process.env.CORE_SERVICE_HOST_DEVELOPMENT}:${process.env.CORE_SERVICE_PORT_DEVELOPMENT}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_TESTNET_PATH}${address1}`;
	} else if (process.env.ENVIRONMENT === 'production') {
		url = `${process.env.CORE_SERVICE_HOST_PRODUCTION}:${process.env.CORE_SERVICE_PORT_PRODUCTION}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_MAINNET_PATH}${address1}`;
		// else if(currency === btcu_testnet) url = `${process.env.CORE_SERVICE_HOST_PRODUCTION}:${process.env.CORE_SERVICE_PORT_PRODUCTION}${process.env.CORE_SERVICE_GET_ADDRESS_INFO_TESTNET_PATH}${address1}`;
	}
	it('should return not found', (done) => {
		chai.request(url)
			.get(url)
			.set('authorization', authToken)
			.end((err, res) => {
				res.res.statusMessage.should.equal('Not Found');
				done();
			});
	});
});
