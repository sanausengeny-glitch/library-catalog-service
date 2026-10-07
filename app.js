require('dotenv').config();

const express = require('express');
const genreRoutes = require('./routes/genres');
const bookRoutes = require('./routes/books');

const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running.' });
});

app.use('/genres', genreRoutes);
app.use('/books', bookRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found.' },
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode >= 500 ? 'Internal server error.' : err.message || 'Request failed.';

  const response = {
    success: false,
    error: {
      message,
    },
  };

  if (err.field) {
    response.error.field = err.field;
  }

  return res.status(statusCode).json(response);
});

module.exports = app;
