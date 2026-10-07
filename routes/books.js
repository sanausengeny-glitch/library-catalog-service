const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const { validateBook } = require('../middleware/validate');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { genre, search, page = '1', limit = '10' } = req.query;
    const filters = {};

    if (genre) {
      if (!mongoose.Types.ObjectId.isValid(String(genre))) {
        const error = new Error('genre must be a valid Mongo ObjectId.');
        error.statusCode = 400;
        throw error;
      }

      filters.genre = new mongoose.Types.ObjectId(String(genre));
    }

    if (search && String(search).trim()) {
      const trimmedSearch = String(search).trim();
      filters.$or = [
        { title: { $regex: trimmedSearch, $options: 'i' } },
        { author: { $regex: trimmedSearch, $options: 'i' } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      const error = new Error('page must be a positive integer.');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(limitNumber) || limitNumber < 1) {
      const error = new Error('limit must be a positive integer.');
      error.statusCode = 400;
      throw error;
    }

    const totalBooks = await Book.countDocuments(filters);
    const totalPages = totalBooks === 0 ? 0 : Math.ceil(totalBooks / limitNumber);

    const books = await Book.find(filters)
      .populate('genre', 'name slug')
      .sort({ title: 1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      success: true,
      data: books,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalBooks,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Book id must be a valid Mongo ObjectId.');
      error.statusCode = 400;
      return next(error);
    }

    const book = await Book.findById(id).populate('genre', 'name slug');

    if (!book) {
      const error = new Error('Book not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBook, async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    const populatedBook = await Book.findById(book._id).populate('genre', 'name slug');

    res.status(201).json({ success: true, data: populatedBook });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBook, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Book id must be a valid Mongo ObjectId.');
      error.statusCode = 400;
      return next(error);
    }

    const book = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('genre', 'name slug');

    if (!book) {
      const error = new Error('Book not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Book id must be a valid Mongo ObjectId.');
      error.statusCode = 400;
      return next(error);
    }

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      const error = new Error('Book not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
