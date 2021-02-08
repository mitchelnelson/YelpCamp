const express = require('express');
const router = express.Router({ mergeParams: true });
const campgrounds = require('../controllers/campgrounds');
const wrapAsync = require('../utils/wrapAsync');
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

router
	.route('/')
	.get(wrapAsync(campgrounds.index))
	.post(
		isLoggedIn,
		upload.array('image'),
		validateCampground,
		wrapAsync(campgrounds.createCampground)
	);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(wrapAsync(campgrounds.showCampground))
	.put(
		isLoggedIn,
		isAuthor,
		upload.array('image'),
		validateCampground,
		wrapAsync(campgrounds.updateCampground)
	)
	.delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground));

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	wrapAsync(campgrounds.renderEditForm)
);

module.exports = router;
