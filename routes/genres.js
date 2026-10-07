const express = require('express');
const mongoose = require('mongoose');
const Genre = require('../models/Genre');
const Book = require('../models/Book');
const { validateGenre } = require('../middleware/validate');

const router = express.Router();

const slugify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

router.get('/', async (req, res, next) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.json({ success: true, data: genres });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Genre id must be a valid Mongo ObjectId.');
      error.statusCode = 400;
      return next(error);
    }

    const genre = await Genre.findById(id);

    if (!genre) {
      const error = new Error('Genre not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: genre });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateGenre, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      slug: req.body.slug || slugify(req.body.name),
    };

    const genre = await Genre.create(payload);
    res.status(201).json({ success: true, data: genre });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateGenre, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Genre id must be a valid Mongo ObjectId.');
      error.statusCode = 400;
      return next(error);
    }

    const payload = {
      ...req.body,
      slug: req.body.slug || slugify(req.body.name),
    };

    const genre = await Genre.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!genre) {
      const error = new Error('Genre not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: genre });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('Genre id must be a valid Mongo ObjectId.');
      error.statusCode = 400;
      return next(error);
    }

    const booksUsingGenre = await Book.countDocuments({ genre: id });

    if (booksUsingGenre > 0) {
      const error = new Error('Cannot delete genre because books still reference it.');
      error.statusCode = 400;
      return next(error);
    }

    const genre = await Genre.findByIdAndDelete(id);

    if (!genre) {
      const error = new Error('Genre not found.');
      error.statusCode = 404;
      return next(error);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
