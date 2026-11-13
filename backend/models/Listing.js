// DRAFT: Database Programmer may finalize these fields. If a field name changes,
// update ALLOWED_FIELDS in controllers/listingController.js too.
const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['textbook', 'furniture', 'other'],
      required: [true, 'Category is required'],
    },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    condition: { type: String, enum: ['new', 'good', 'fair'], default: 'good' },
    images: [{ type: String }], // image URLs
    location: { type: String, trim: true }, // campus / pickup spot
    status: { type: String, enum: ['available', 'sold'], default: 'available' },

    // Optional textbook-only fields
    isbn: { type: String, trim: true },
    courseCode: { type: String, trim: true },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
