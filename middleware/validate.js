const mongoose = require('mongoose');
const Genre = require('../models/Genre');

const createValidationError = (field, message) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.field = field;
  return error;
};

const normalizeSlug = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ensureStringField = (payload, fieldName, options = {}) => {
  const { required = true, allowEmpty = false } = options;
  const value = payload[fieldName];

  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, message: `${fieldName} is required.` };
    }

    return { valid: true, value };
  }

  if (typeof value !== 'string') {
    return { valid: false, message: `${fieldName} must be a string.` };
  }

  const trimmedValue = value.trim();

  if (!allowEmpty && trimmedValue.length === 0) {
    return { valid: false, message: `${fieldName} cannot be empty.` };
  }

  return { valid: true, value: trimmedValue };
};

const validateGenre = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const isUpdate = req.method === 'PUT';
    const errors = [];

    if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'name')) {
      const checkName = ensureStringField(payload, 'name');
      if (!checkName.valid) {
        errors.push({ field: 'name', message: checkName.message });
      } else {
        payload.name = checkName.value;
      }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'slug')) {
      const checkSlug = ensureStringField(payload, 'slug', { required: false, allowEmpty: false });
      if (checkSlug.valid && checkSlug.value !== undefined && checkSlug.value !== null) {
        const normalizedSlug = normalizeSlug(checkSlug.value);
        if (!normalizedSlug) {
          errors.push({ field: 'slug', message: 'slug cannot be empty.' });
        } else if (checkSlug.value !== normalizedSlug) {
          errors.push({ field: 'slug', message: 'slug must be lowercase, URL-safe text.' });
        } else {
          payload.slug = normalizedSlug;
        }
      }
    }

    if (payload.name && (!payload.slug || !Object.prototype.hasOwnProperty.call(payload, 'slug'))) {
      payload.slug = normalizeSlug(payload.name);
    }

    if (errors.length > 0) {
      return next(createValidationError(errors[0].field, errors[0].message));
    }

    req.body = payload;
    next();
  } catch (error) {
    next(error);
  }
};

const validateBook = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const isUpdate = req.method === 'PUT';
    const errors = [];

    const requiredFields = ['title', 'author', 'isbn', 'description', 'coverImage'];

    for (const fieldName of requiredFields) {
      if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, fieldName)) {
        const check = ensureStringField(payload, fieldName);
        if (!check.valid) {
          errors.push({ field: fieldName, message: check.message });
        } else {
          payload[fieldName] = check.value;
        }
      }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'totalCopies')) {
      if (typeof payload.totalCopies !== 'number' || !Number.isFinite(payload.totalCopies) || !Number.isInteger(payload.totalCopies) || payload.totalCopies < 0) {
        errors.push({ field: 'totalCopies', message: 'totalCopies must be a non-negative integer.' });
      }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'availableCopies')) {
      if (typeof payload.availableCopies !== 'number' || !Number.isFinite(payload.availableCopies) || !Number.isInteger(payload.availableCopies) || payload.availableCopies < 0) {
        errors.push({ field: 'availableCopies', message: 'availableCopies must be a non-negative integer.' });
      }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'genre')) {
      if (typeof payload.genre !== 'string' || !mongoose.Types.ObjectId.isValid(payload.genre)) {
        errors.push({ field: 'genre', message: 'genre must be a valid Mongo ObjectId string.' });
      } else {
        const genreExists = await Genre.exists({ _id: payload.genre });
        if (!genreExists) {
          errors.push({ field: 'genre', message: 'genre must reference an existing genre.' });
        }
      }
    }

    if (
      payload.totalCopies !== undefined &&
      payload.totalCopies !== null &&
      payload.availableCopies !== undefined &&
      payload.availableCopies !== null &&
      payload.availableCopies > payload.totalCopies
    ) {
      errors.push({ field: 'availableCopies', message: 'availableCopies cannot exceed totalCopies.' });
    }

    if (errors.length > 0) {
      return next(createValidationError(errors[0].field, errors[0].message));
    }

    req.body = payload;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateGenre,
  validateBook,
};
