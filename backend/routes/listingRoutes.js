const express = require('express');
const {
  createListing,
  getListings,
  getMyListings,
  getListingById,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getListings);
router.post('/', protect, createListing);
router.get('/my', protect, getMyListings); // must come before /:id
router.get('/:id', getListingById);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
