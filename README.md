# Book Catalog

This project defines the MongoDB schema for a small library catalog and includes a seed script to populate the database with realistic sample data.

## Setup

1. Install dependencies:
   npm install
2. Copy `.env.example` to `.env` and set your MongoDB connection string:
   cp .env.example .env
3. Run the seed script:
   npm run seed

## Schema Design

### Book fields

#### `title`
This is a plain embedded string field because the title belongs directly to one book and is not shared across other documents. Keeping it on the `Book` document gives the simplest reads and writes for a catalog screen.

#### `author`
The author is also stored as a plain embedded string field because each book has a single primary author in this schema. If the application later grows into a full author directory with biographies and cross-book metadata, a separate `Author` collection could be justified, but for a basic library catalog it adds unnecessary complexity.

#### `isbn`
`isbn` is stored as a plain string on the `Book` document because it uniquely identifies a book edition and is used as a lookup value. The `unique: true` constraint makes it easy to detect duplicate records without creating a separate reference table.

#### `description`
This is an embedded text field because the summary belongs to the book itself and is not shared with other books. Keeping it alongside the rest of the title metadata keeps the record self-contained and faster to load in one query.

#### `coverImage`
The cover image URL is a direct property of a single book. It is an external asset reference, not a reusable entity, so storing it as a string on the book avoids unnecessary joins or object duplication.

#### `totalCopies`
`totalCopies` and `availableCopies` are embedded numeric fields because they describe the inventory state of a single book record, not a shared dictionary object. A library typically tracks these values together on the same title, so keeping them with the book is simpler and more consistent than normalizing them into a second collection.

#### `availableCopies`
This is also a direct embedded number because it is a property of the current inventory state of a specific book. The app can quickly check whether the book is available without needing to join across collections. The seed script enforces `availableCopies <= totalCopies` to prevent invalid catalog data.

#### `genre`
`genre` is intentionally stored as a reference using `ObjectId` and `ref: 'Genre'` instead of being embedded. A genre such as "Science Fiction" is reused across many books, so embedding it into every book would repeat the same values and create data duplication. A reference keeps the genre list normalized, enables consistent naming and slug values, and makes future updates like renaming a genre easier to manage.

### Why the reference is better for genre

Using a real reference is the right choice here because genres are a controlled lookup table shared across many books. The trade-off is an extra lookup when reading a book, but the gain is cleaner data and lower duplication. In a larger catalog, this is a better long-term design than embedding the same genre name repeatedly on every book.

## Data Model Summary

- `Genre`: stores the reusable genre metadata (`name` and `slug`), with unique constraints on both fields.
- `Book`: stores item-level metadata and inventory counts, plus a `genre` reference to one `Genre` document.

## Seed Script

The seed script connects using the `MONGODB_URI` environment variable, clears any existing books and genres, inserts at least four genres and fifteen books, and logs a summary when complete.

This repository is ready to be pushed to GitHub and re-seeded safely whenever a fresh MongoDB database is configured.
