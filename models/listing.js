const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({

    title: {
        type: String,
        required: true,
    },

    description: String,

    image: {
        url: String,
        filename: String,
    },

    price: Number,

    location: String,

    country: String,
    
    // Listing category used by filters
    category: {
        type: String,
        enum: [
            "Trending",
            "Rooms",
            "Iconic Cities",
            "Castles",
            "Mountains",
            "Amazing Pools",
            "Camping",
            "Farm",
            "Arctic",
            "Beaches"
        ],
        required: true
    },

    // Reviews belonging to this listing
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    // Owner of the listing
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    // GeoJSON location coordinates
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
        },

        coordinates: {
            type: [Number],
        }
    }
});

// Delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {

    if (listing) {
        await Review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        });
    }

});

// Create Listing model
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;