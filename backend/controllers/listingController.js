const Listing = require('../models/Listing');

// Fields a user is allowed to set on a listing (seller is always taken from the token)
const ALLOWED_FIELDS = [
  'title', 'description', 'category', 'price', 'condition',
  'images', 'location', 'status', 'isbn', 'courseCode',
];

const pickAllowed = (body) =>
  ALLOWED_FIELDS.reduce((obj, key) => {
    if (body[key] !== undefined) obj[key] = body[key];
    return obj;
  }, {});

const isOwnerOrAdmin = (req, listing) =>
  req.user.role === 'admin' || listing.seller.toString() === req.user._id.toString();

const handleError = (err, res, next) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  next(err);
};

// POST /api/listings  (logged in)
exports.createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({ ...pickAllowed(req.body), seller: req.user._id });
    res.status(201).json(listing);
  } catch (err) {
    handleError(err, res, next);
  }
};

// GET /api/listings  (public)
// Filters: ?category=textbook&condition=good&status=available&minPrice=10&maxPrice=50&search=calculus&page=1&limit=20
exports.getListings = async (req, res, next) => {
  try {
    // String() stops query-object injection like ?category[$ne]=x
    const q = (key) => (req.query[key] !== undefined ? String(req.query[key]) : undefined);
    const [category, condition, status, minPrice, maxPrice, search] =
      ['category', 'condition', 'status', 'minPrice', 'maxPrice', 'search'].map(q);
    const filter = {};

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    filter.status = status || 'available'; // show available items by default

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      // escape special regex characters so user input is treated as plain text
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { courseCode: regex }, { isbn: regex }];
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name program')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Listing.countDocuments(filter),
    ]);

    res.json({ total, page, pages: Math.ceil(total / limit), listings });
  } catch (err) {
    handleError(err, res, next);
  }
};

// GET /api/listings/my  (logged in) – all of the current user's listings, sold ones included
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    handleError(err, res, next);
  }
};

// GET /api/listings/:id  (public)
exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name email program');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    handleError(err, res, next);
  }
};

// PUT /api/listings/:id  (seller or admin) – also used to mark an item as sold
exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!isOwnerOrAdmin(req, listing)) {
      return res.status(403).json({ message: 'Not allowed to update this listing' });
    }

    Object.assign(listing, pickAllowed(req.body));
    await listing.save(); // runs schema validation
    res.json(listing);
  } catch (err) {
    handleError(err, res, next);
  }
};

// DELETE /api/listings/:id  (seller or admin)
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!isOwnerOrAdmin(req, listing)) {
      return res.status(403).json({ message: 'Not allowed to delete this listing' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    handleError(err, res, next);
  }
};
