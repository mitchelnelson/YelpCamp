if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const session = require('express-session');
const flash = require('connect-flash');
const mongoDBStore = require('connect-mongo')(session);

const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

// Allows for boilerplate.
const ejsMate = require('ejs-mate');
// Allows for custom error Class
const ExpressError = require('./utils/ExpressError');
// Allows for put/patch/delete/etc.
const methodOverride = require('method-override');

// Mongo sanitization to prevent $ or . in monog queries
const mongoSanitize = require('express-mongo-sanitize');

// Helmet for HTTP header configuration
const helmet = require('helmet');

// Requiring the routes for express.Router().
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

// Mongoose connection
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

// Mongoose to database connection.
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('database connected!');
});

// Setting up express.
const app = express();

// EJS setup.
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// execution of mongoSanitize to sanitize mongo queries.
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

const secret = process.env.SECRET || 'thisshouldbeasecret';

const store = new mongoDBStore({
	url: dbUrl,
	secret,
	touchAfter: 24 * 3600
});

// We are constructing a sessionConfig variable that we will pass into our middleware to set up the session. We can assign several options on it, and eventually secret will have its own unique, complex secret string.
const sessionConfig = {
	store,
	name: 'a0s',
	secret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		// here we are setting the cookie options. HTTPOnly is a security feature. Expires is one week from the time the cookie is sent. The max age of the cookies is the same number in ms.
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net'
];
//This is the array that needs added to
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://a.tiles.mapbox.com/',
	'https://b.tiles.mapbox.com/',
	'https://events.mapbox.com/'
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/dkdtpp6uy/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://images.unsplash.com/'
			],
			fontSrc: ["'self'", ...fontSrcUrls]
		}
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	if (!['/login', '/'].includes(req.originalUrl)) {
		req.session.returnTo = req.originalUrl;
	}
	res.locals.authUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.get('/fakeUser', async (req, res) => {
	const user = new User({
		email: 'mitchelnelson@live.ca',
		username: 'omgbeandip'
	});
	const newUser = await User.register(user, 'Oilerboy35%');
	res.send(newUser);
});

// Linkage middleware to the routes folder. I have prefixed these so in the router files we do not need to have long prefixes.
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

// If we stumble upon a new error that is not caught by the previously defined routes, we trigger a default Express Error 404.
app.all('*', (req, res, next) => {
	next(new ExpressError('Page not found :(', 404));
});

// Basic error handling.
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(statusCode).render('error', { err });
});

// listen
const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
