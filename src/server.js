console.log(`======================= label ===================`);
require('dotenv').config();

// const redis = require('redis');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
var bodyParser = require('body-parser');
const formData = require('express-form-data');

// const { redisConf } = require('./config/config.js');
// const redisController = require('./controllers/transactionScanner');

// Setting up port
const connUri = process.env.MONGO_LOCAL_CONN_URL;
let PORT = +process.env.PORT || 7515;

//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());

// for parsing application/json
app.use(express.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json);
//form-urlencoded

// const options = {
//   uploadDir: os.tmpdir(),
//   autoClean: true,
// };

// parse data with connect-multiparty.
app.use(formData.parse());
// app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream
app.use(formData.stream());
// union the body and the files
app.use(formData.union());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//=== 2 - SET UP DATABASE
//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;
mongoose.connect(connUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => console.log('\x1b[33m%s\x1b[0m', 'MongoDB --  database connection established successfully!'));
connection.on('error', (err) => {
	console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
	process.exit();
});

//=== 3 - INITIALIZE PASSPORT MIDDLEWARE
// app.use(passport.initialize());
// require("./middlewares/jwt")(passport);

//=== 4 - CONFIGURE ROUTES
//Configure Route
require('./routes/index')(app);

//=== 5 - START SERVER
app.listen(PORT, () => console.log('\x1b[33m%s\x1b[0m', 'Server running on http://localhost:' + PORT + '/'));

// try {

// 	const redisClient = redis.createClient(`redis://${redisConf.database}`);

// 	redisClient.on('connect', function () {
// 		console.log('\x1b[33m%s\x1b[0m', 'Redis --  Redis connection established successfully!"');
// 	});

// 	redisClient.on('error', (error) => {
// 		console.error(error);
// 	});

// 	redisClient.subscribe('balanceChange');

// 	redisClient.on('message', function (channel, message) {
// 		// код, который будет выполняться при получении сообщения о смене баланса
// 		// console.log('message recieved');
// 		redisController.entryPoint(channel, message);
// 	});
// } catch (error) {
// 	console.error(error)
// }
