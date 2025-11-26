const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const codeRoutes = require('./routes/codeRoutes');
const mongooseConnection = require('./models/mongooseConnection');
const serverless = require('serverless-http');

const app = express();

const corsOptions = {
  origin: [
    'https://skillhubtools.store',
    'http://skillhubtools.store',
    'https://www.skillhubtools.store'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/skill-mint', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/code', codeRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Skill Mint Server is running',
    version: '1.0.0'
  });
});

// Connect to MongoDB on cold start (pooled connection will be reused by serverless)
mongooseConnection.connect().catch((err) => {
  console.error('Initial MongoDB connection error:', err);
});

module.exports = app;
module.exports.handler = serverless(app);
