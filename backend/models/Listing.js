// If a field name changes, update ALLOWED_FIELDS in controllers/listingController.js too.
const mongoose = require('mongoose');

const LISTING_TYPES = ['sale', 'rent', 'trade', 'service'];
const CATEGORIES = ['textbook', 'furniture', 'electronics', 'clothing', 'school supplies', 'digital', 'other'];
const PRICE_UNITS = ['fixed', 'hour', 'day', 'week', 'month'];
const CONDITIONS = ['new', 'like new', 'good', 'fair'];
const STATUSES = ['available', 'rented', 'traded', 'sold'];

// Which "finished" status makes sense for each listing type
const STATUSES_BY_TYPE = {
  sale: ['available', 'sold'],
  rent: ['available', 'rented'],
  trade: ['available', 'traded'],
  service: ['available', 'sold'],
};

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title must be 120 characters or less'],
    },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    listingType: {
      type: String,
      enum: { values: LISTING_TYPES, message: 'listingType must be one of: ' + LISTING_TYPES.join(', ') },
      default: 'sale',
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'category must be one of: ' + CATEGORIES.join(', ') },
      required: [true, 'Category is required'],
    },
    price: { type: Number, min: [0, 'Price cannot be negative'] }, // CA$; required unless trade (see below)
    priceUnit: {
      type: String,
      enum: { values: PRICE_UNITS, message: 'priceUnit must be one of: ' + PRICE_UNITS.join(', ') },
      default: 'fixed',
    },
    tradeFor: { type: String, trim: true }, // what the poster wants in return (trade only)
    condition: {
      type: String,
      enum: { values: CONDITIONS, message: 'condition must be one of: ' + CONDITIONS.join(', ') },
      default: 'good',
    },
    images: [{ type: String }], // image URLs
    location: { type: String, trim: true }, // campus / pickup spot
    status: {
      type: String,
      enum: { values: STATUSES, message: 'status must be one of: ' + STATUSES.join(', ') },
      default: 'available',
    },

    // Optional textbook-only fields
    isbn: { type: String, trim: true },
    courseCode: { type: String, trim: true },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Rules that depend on listingType. Runs on create and on every save (update).
listingSchema.pre('validate', function () {
  if (this.listingType === 'trade') {
    // Trades have no money involved
    this.price = 0;
    this.priceUnit = 'fixed';
    if (!this.tradeFor) this.invalidate('tradeFor', 'tradeFor is required for trade listings');
  } else {
    this.tradeFor = undefined;
    if (this.price === undefined || this.price === null) {
      this.invalidate('price', 'Price is required');
    }
    // A sale is always a one-time price; rent and service can be per hour/day/week/month
    if (this.listingType === 'sale') this.priceUnit = 'fixed';
  }

  const allowed = STATUSES_BY_TYPE[this.listingType];
  if (allowed && !allowed.includes(this.status)) {
    this.invalidate('status', `status for a ${this.listingType} listing must be one of: ${allowed.join(', ')}`);
  }
});

module.exports = mongoose.model('Listing', listingSchema);
