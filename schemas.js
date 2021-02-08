const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// Defining an extension on joi.string() called .escapeHTML()
const extension = joi => ({
	type: 'string',
	base: joi.string(),
	messages: {
		'string.escapeHTML': '{{#label}} must not include HTML!'
	},
	rules: {
		// This is our method we want to append
		escapeHTML: {
			// Joi will call the validate function automatically with the value it receives
			validate (value, helpers) {
				// Here we call sanitizeHtml from the npm package we required earlier. It takes in a value and we can set options on it
				const clean = sanitizeHtml(value, {
					// Here, no tags are allowed (no bold, no italics, no anything).
					allowedTags: [],
					// Here, no attributes are allowed (no scripts, etc.)
					allowedAttributes: {}
				});
				// If there has been some sort of sanitation, an error is evoked with the messages object defined earlier in reference to the value
				if (clean !== value)
					return helpers.error('string.escapeHTML', { value });
				// If no sanitation occurred, just return the same text to Joi.
				return clean;
			}
		}
	}
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
	campground: Joi.object({
		title: Joi.string().required().escapeHTML(),
		price: Joi.number().required().min(0),
		location: Joi.string().required().escapeHTML(),
		description: Joi.string().required().escapeHTML()
	}).required(),
	deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		rating: Joi.number().required().min(1).max(5),
		body: Joi.string().required().escapeHTML()
	}).required()
});
