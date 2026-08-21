const Joi = require("joi");

const allowedCategories = [
    "Trending", "Rooms", "Iconic Cities", "Castles",
    "Mountains", "Amazing Pools", "Camping", "Farm",
    "Arctic", "Beaches"
];

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.string().required().valid(...allowedCategories),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null),
        }).allow("", null),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

module.exports.allowedCategories = allowedCategories;