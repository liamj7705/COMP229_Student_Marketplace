// Seed script – fills the database with sample users and listings for testing and the demo.
// Run from the backend folder:  npm run seed
//
// Safe to run more than once: it only deletes the sample accounts it created before
// (emails ending in .seed@my.centennialcollege.ca) and their listings.
// It does NOT touch anyone else's data.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');

const SEED_EMAIL = /\.seed@my\.centennialcollege\.ca$/;
const SEED_PASSWORD = 'password123';

const users = [
  { name: 'Alex Chen', email: 'alex.seed@my.centennialcollege.ca', program: 'Software Engineering Technology' },
  { name: 'Priya Patel', email: 'priya.seed@my.centennialcollege.ca', program: 'Business Administration' },
  { name: 'Jordan Smith', email: 'jordan.seed@my.centennialcollege.ca', program: 'Game Programming' },
  { name: 'Admin User', email: 'admin.seed@my.centennialcollege.ca', program: 'Staff', role: 'admin' },
];

// "seller" is the index of the user above who posted the listing
const listings = [
  {
    seller: 0, title: 'Intro to Java Programming (12th ed.)', listingType: 'sale',
    category: 'textbook', price: 45, condition: 'good', courseCode: 'COMP122',
    isbn: '9780136520238', location: 'Progress Campus Library',
    description: 'Some highlighting in the first three chapters. Otherwise clean.',
  },
  {
    seller: 1, title: 'IKEA desk, white', listingType: 'sale', category: 'furniture',
    price: 30, condition: 'fair', location: 'Scarborough, pickup only',
    description: 'Sturdy desk, a few scratches on top. Fits a laptop and monitor.',
  },
  {
    seller: 2, title: 'TI-84 Plus graphing calculator', listingType: 'rent', category: 'electronics',
    price: 10, priceUnit: 'week', condition: 'like new', location: 'Progress Campus',
    description: 'Rent it for exam week. Batteries included.',
  },
  {
    seller: 0, title: 'Java and web dev tutoring', listingType: 'service', category: 'other',
    price: 25, priceUnit: 'hour', location: 'Online or Progress Campus',
    description: 'Help with COMP229, COMP122 and assignments. First session half price.',
  },
  {
    seller: 1, title: 'Winter jacket (size M)', listingType: 'trade', category: 'clothing',
    tradeFor: 'A size L jacket or a backpack', condition: 'good', location: 'Story Arts Centre',
    description: 'Warm winter jacket that is a little too small for me.',
  },
  {
    seller: 2, title: 'COMP229 study notes (PDF)', listingType: 'sale', category: 'digital',
    price: 5, courseCode: 'COMP229',
    description: 'Organized notes for every week, including Express and MongoDB examples.',
  },
  {
    seller: 0, title: 'Scientific calculator and geometry set', listingType: 'sale',
    category: 'school supplies', price: 12, condition: 'good', status: 'sold',
    location: 'Progress Campus',
    description: 'Already sold. Kept as an example of a closed listing.',
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Remove old sample data only
  const oldUsers = await User.find({ email: SEED_EMAIL }).select('_id');
  const oldIds = oldUsers.map((u) => u._id);
  await Listing.deleteMany({ seller: { $in: oldIds } });
  await User.deleteMany({ _id: { $in: oldIds } });
  console.log(`Removed ${oldIds.length} old sample users and their listings`);

  // User.create runs the pre-save hook, so passwords get hashed
  const createdUsers = await User.create(users.map((u) => ({ ...u, password: SEED_PASSWORD })));
  console.log(`Created ${createdUsers.length} users`);

  const createdListings = await Listing.create(
    listings.map((l) => ({ ...l, seller: createdUsers[l.seller]._id }))
  );
  console.log(`Created ${createdListings.length} listings`);

  console.log(`\nDone. Log in with any sample email and the password: ${SEED_PASSWORD}`);
};

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
