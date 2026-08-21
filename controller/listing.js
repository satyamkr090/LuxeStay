const Listing = require("../models/listing");
const axios = require("axios");

// Show all listings, search listings and filter listings
module.exports.index = async (req, res) => {

    // Get search and category from URL
    let { q, category } = req.query;

    // Create MongoDB filter
    let filter = {};

    // Search title, description, location and country
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ];
    }

    // Filter listings by category
    if (category) {
        filter.category = category;
    }

    // Find matching listings
    const allListings = await Listing.find(filter);

    // Send listings to index page
    res.render("listings/index.ejs", { allListings, q, category });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show one listing
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    // Find listing and populate reviews and owner
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    // Handle missing listing
    if (!listing) {
        req.flash( "error",  "Listing you requested for does not exist!"  );
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

// Create new listing
module.exports.createListing = async (req, res, next) => {
    try {
        // Get location from form
        const location = req.body.listing.location;

        // Get coordinates from Geoapify
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/search",
            {
                params: {
                    text: location,
                    apiKey: process.env.MAP_API_KEY,
                    limit: 1
                }
            }
        );

        // Check whether location was found
        if ( !response.data.features || response.data.features.length === 0 ) {
            req.flash( "error", "Location could not be found!" );

            return res.redirect("/listings/new");
        }

        // Get GeoJSON geometry
        const geometry = response.data.features[0].geometry;

        // Get uploaded image information
        const url = req.file.path;
        const filename = req.file.filename;

        // Create new listing
        const newListing = new Listing(req.body.listing);

        // Set listing owner
        newListing.owner = req.user._id;

        // Set listing image
        newListing.image = { url, filename };

        // Save coordinates
        newListing.geometry = geometry;

        const savedListing = await newListing.save();

        console.log(savedListing);

        req.flash( "success", "New Listing Created!" );
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};


// Render edit form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    // Handle missing listing
    if (!listing) {
        req.flash( "error", "Listing you requested for does not exist!" );
        return res.redirect("/listings");
    }

    // Create smaller image URL
    let originalImageUrl = listing.image.url;

    originalImageUrl = originalImageUrl.replace( "/upload", "/upload/w_250" );
    
    // Render edit page
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};


// Update listing
module.exports.updateListing = async (req, res, next) => {
    try {
        let { id } = req.params;

        // Get new location
        const location = req.body.listing.location;

        // Get updated coordinates
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/search",
            {
                params: {
                    text: location,
                    apiKey: process.env.MAP_API_KEY,
                    limit: 1
                }
            }
        );
        // Check location
        if ( !response.data.features || response.data.features.length === 0 ) {
            req.flash( "error", "Location could not be found!" );
            return res.redirect( `/listings/${id}/edit` );
        }
        // Get updated geometry
        const geometry = response.data.features[0].geometry;

        // Update listing
        let listing = await Listing.findByIdAndUpdate(
            id,
            {
                ...req.body.listing, geometry: geometry
            },
            {
                returnDocument: 'after'
            }
        );
        if (typeof req.file !== "undefined") {

            let url = req.file.path;
            let filename = req.file.filename;

            listing.image = { url, filename };
            await listing.save();
        }
        req.flash( "success", "Listing Updated!" );
        res.redirect(`/listings/${id}`);

    } catch (err) {
        next(err);
    }
};


// Delete listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash( "success", "Listing Deleted!" );
    res.redirect("/listings");
};