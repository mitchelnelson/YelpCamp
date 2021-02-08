const mongoose = require('mongoose');
const camps = require('./CanadaCamp');
const Campground = require('../models/campground');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('database connected!');
});

const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
	await Campground.deleteOne({ title: 'Kimball Lake Campground' });
	for (let i = 0; i < 200; i++) {
		const random1104 = Math.floor(Math.random() * 1104);
		const price = Math.floor(Math.random() * 15) + 10;
		const camp = new Campground({
			author: '6016cc2e7fbdb3431766054e',
			location: `${camps[random1104].location}, ${camps[random1104]
				.province}`,
			title: `${camps[random1104].campground}`,
			geometry: {
				type: 'Point',
				coordinates: [camps[random1104].lng, camps[random1104].lat]
			},
			images: [
				{
					url:
						'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
					filename: 'defaultPhoto'
				}
			],
			description: 'Campground',
			price
		});
		// console.log(camp);
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
