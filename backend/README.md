# COLTCART – Backend

Express + MongoDB (Mongoose) backend using the MVC structure, with JWT authentication.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in `MONGO_URI` (local MongoDB or MongoDB Atlas) and `JWT_SECRET`.
3. `npm run dev` (auto-restart) or `npm start`
4. Open http://localhost:5000 to check that the API is running.

## Folder structure
```
config/db.js                  MongoDB connection
models/User.js                User schema (password hashed with bcrypt)
models/Listing.js             Listing schema (DRAFT – Database Programmer to finalize)
controllers/authController.js register, login, me
controllers/userController.js user CRUD
controllers/listingController.js listing CRUD + filters
middleware/auth.js            protect (JWT check), authorize (roles)
routes/                       authRoutes.js, userRoutes.js, listingRoutes.js
server.js                     app entry point
```

## API endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create account, returns token |
| POST | /api/auth/login | Public | Login, returns token |
| GET | /api/auth/me | Logged in | Current user |
| GET | /api/users | Admin | All users |
| GET | /api/users/:id | Logged in | One user |
| PUT | /api/users/:id | Owner / Admin | Update user |
| DELETE | /api/users/:id | Owner / Admin | Delete user |
| POST | /api/listings | Logged in | Create listing |
| GET | /api/listings | Public | Browse listings (filters below) |
| GET | /api/listings/my | Logged in | Current user's listings (incl. sold) |
| GET | /api/listings/:id | Public | One listing |
| PUT | /api/listings/:id | Seller / Admin | Update listing or mark sold (`{"status":"sold"}`) |
| DELETE | /api/listings/:id | Seller / Admin | Delete listing |

**Listing filters:** `category`, `condition`, `status` (default `available`), `minPrice`, `maxPrice`, `search` (title, description, course code, ISBN), `page`, `limit`
Example: `/api/listings?category=textbook&maxPrice=50&search=calculus`

Protected routes need the header: `Authorization: Bearer <token>`

## Testing
Import `COLTCART.postman_collection.json` into Postman. Run the requests top to bottom: **Register** or **Login** first (the token is saved automatically), then **Listings**, then **Users** (the last request deletes the test account).

## Next steps
- Confirm `Listing` fields with the Database Programmer
- Share the endpoint table above with the Frontend Developer
