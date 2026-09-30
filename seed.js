require('dotenv').config();

const mongoose = require('mongoose');
const Genre = require('./models/Genre');
const Book = require('./models/Book');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined. Add it to your .env file.');
}

const genreSeed = [
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Romance', slug: 'romance' },
  { name: 'Historical Fiction', slug: 'historical-fiction' },
];

const bookSeed = [
  { title: 'The Martian Chronicles', author: 'Ray Bradbury', isbn: '978-0-7432-5958-3', description: 'A classic collection of tales exploring life on Mars and the imagination of distant worlds.', coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353', totalCopies: 8, availableCopies: 5, genreName: 'Science Fiction' },
  { title: 'Dune', author: 'Frank Herbert', isbn: '978-0-441-17271-9', description: 'A spice-fueled epic set on a desert planet where politics, prophecy, and survival collide.', coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794', totalCopies: 10, availableCopies: 7, genreName: 'Science Fiction' },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '978-0-446-36252-4', description: 'A cyberpunk narrative that brings together rogue hackers, memory theft, and a fractured future.', coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f', totalCopies: 7, availableCopies: 4, genreName: 'Science Fiction' },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '978-0-553-29335-6', description: 'A mathematically driven saga about the collapse of an empire and the rebirth of civilization.', coverImage: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da', totalCopies: 9, availableCopies: 6, genreName: 'Science Fiction' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0-261-10221-7', description: 'A treasured adventure through Middle-earth, filled with treasure, danger, and unlikely heroes.', coverImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15', totalCopies: 11, availableCopies: 8, genreName: 'Fantasy' },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', isbn: '978-0-14-018893-1', description: 'A young mage learns the weight of true names and the balance of nature and power.', coverImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a', totalCopies: 6, availableCopies: 3, genreName: 'Fantasy' },
  { title: 'Mistborn', author: 'Brandon Sanderson', isbn: '978-0-7653-1991-5', description: 'In a land ruled by ash and tyranny, a girl with forbidden powers begins to challenge the empire.', coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765', totalCopies: 8, availableCopies: 5, genreName: 'Fantasy' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '978-0-7564-0674-4', description: 'A lyrical coming-of-age tale about a gifted young magician and the cost of ambition.', coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136', totalCopies: 10, availableCopies: 6, genreName: 'Fantasy' },
  { title: 'And Then There Were None', author: 'Agatha Christie', isbn: '978-0-06-207348-8', description: 'Ten strangers trapped on a remote island become the target of a mysterious killer.', coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66', totalCopies: 12, availableCopies: 9, genreName: 'Mystery' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '978-0-307-26918-3', description: 'A disgraced journalist and a brilliant hacker pursue a decades-old disappearance.', coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc', totalCopies: 9, availableCopies: 7, genreName: 'Mystery' },
  { title: 'Big Little Lies', author: 'Liane Moriarty', isbn: '978-0-393-07397-7', description: 'A sharp, darkly funny story of friendships, secrets, and the violence hidden behind perfection.', coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', totalCopies: 7, availableCopies: 4, genreName: 'Mystery' },
  { title: 'The Silent Patient', author: 'Alex Michaelides', isbn: '978-1-250-30154-6', description: 'A psychotherapist becomes obsessed with a patient who refuses to speak after a shocking murder.', coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d', totalCopies: 8, availableCopies: 5, genreName: 'Mystery' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-1-85326-000-7', description: 'An iconic romantic novel of manners, wit, and the slow unraveling of first impressions.', coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353', totalCopies: 6, availableCopies: 4, genreName: 'Romance' },
  { title: 'The Notebook', author: 'Nicholas Sparks', isbn: '978-0-446-60828-8', description: 'A tender, sweeping love story set against the backdrop of a changing coast.', coverImage: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090', totalCopies: 7, availableCopies: 3, genreName: 'Romance' },
  { title: 'Normal People', author: 'Sally Rooney', isbn: '978-0-374-53720-2', description: 'A modern love story tracing the intimate, complicated arc of two lives shaped by class and memory.', coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', totalCopies: 8, availableCopies: 5, genreName: 'Romance' },
  { title: 'The Book Thief', author: 'Markus Zusak', isbn: '978-0-375-83100-3', description: 'In Nazi Germany, a young girl discovers the power of words and the courage of ordinary people.', coverImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', totalCopies: 9, availableCopies: 6, genreName: 'Historical Fiction' },
  { title: 'The Nightingale', author: 'Kristin Hannah', isbn: '978-0-316-20216-0', description: 'Two sisters in occupied France each survive the war in profoundly different ways.', coverImage: 'https://images.unsplash.com/photo-1509266272358-7701da638078', totalCopies: 10, availableCopies: 8, genreName: 'Historical Fiction' },
  { title: 'The Secret History', author: 'Donna Tartt', isbn: '978-0-375-70315-8', description: 'An intellectual suspense tale about beauty, obsession, and the fragility of social order.', coverImage: 'https://images.unsplash.com/photo-1511108690759-009324a90311', totalCopies: 5, availableCopies: 2, genreName: 'Historical Fiction' },
  { title: 'The Book of Lost Names', author: 'Kristin Harmel', isbn: '978-1-250-27851-2', description: 'A gripping story of identity, survival, and the quiet bravery of a woman during wartime.', coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', totalCopies: 6, availableCopies: 4, genreName: 'Historical Fiction' },
];

async function seedDatabase() {
  await mongoose.connect(MONGODB_URI);

  await Genre.deleteMany({});
  await Book.deleteMany({});

  const savedGenres = await Genre.insertMany(genreSeed);
  const genreMap = Object.fromEntries(savedGenres.map((genre) => [genre.name, genre._id]));

  const booksToInsert = bookSeed.map((book) => ({
    ...book,
    genre: genreMap[book.genreName],
    availableCopies: Math.min(book.availableCopies, book.totalCopies),
  }));

  await Book.insertMany(booksToInsert);

  console.log(`Seeded ${savedGenres.length} genres and ${booksToInsert.length} books`);

  await mongoose.disconnect();
}

seedDatabase()
  .catch((error) => {
    console.error('Seeding failed:', error);
    mongoose.disconnect().finally(() => process.exit(1));
  });
