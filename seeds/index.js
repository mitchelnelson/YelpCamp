const mongoose = require('mongoose');
const cities = require('./canadacities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
	await Campground.deleteMany({});
	for (let i = 0; i < 200; i++) {
		const random1738 = Math.floor(Math.random() * 1738);
		const price = Math.floor(Math.random() * 15) + 10;
		const camp = new Campground({
			author: '6016cc2e7fbdb3431766054e',
			location: `${cities[random1738].city}, ${cities[random1738]
				.province_name}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1738].lng, cities[random1738].lat]
			},
			images: [
				{
					url:
						'https://res.cloudinary.com/dkdtpp6uy/image/upload/v1612398034/YelpCamp/tmatxkl704ee87ow99qh.jpg',
					filename: 'YelpCamp/tmatxkl704ee87ow99qh'
				}
			],
			description: `A lovely campground situated in the beautiful region of Canada`,
			price
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
