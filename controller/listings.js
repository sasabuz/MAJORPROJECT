const Listing = require("../models/listing");
const { listingSchema } = require("../schema.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "listing not found");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListings = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  let result = listingSchema.validate(req.body);
  let { title, description, image, price, country, location } = req.body;

  const newListing = new Listing({
    title,
    description,
    image,
    price,
    country,
    location,
  });
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "listing not found");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace(
    "/upload",
    "/upload/w_250,h_300,c_fill,q_auto,f_auto",
  );
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListings = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  // update basic fields
  listing.title = req.body.title;
  listing.description = req.body.description;
  listing.price = req.body.price;
  listing.country = req.body.country;
  listing.location = req.body.location;

  // 🔥 ONLY update image if new file uploaded
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();

  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`); // better UX
};
module.exports.updateListings = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  // update basic fields
  listing.title = req.body.title;
  listing.description = req.body.description;
  listing.price = req.body.price;
  listing.country = req.body.country;
  listing.location = req.body.location;

  // 🔥 ONLY update image if new file uploaded
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();

  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`); // better UX
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "listing deleted!");
  res.redirect("/listings");
};
