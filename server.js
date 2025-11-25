const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const codeRoutes = require('./routes/codeRoutes');
const mongooseConnection = require('./models/mongooseConnection');

const app = express();
const PORT = process.env.PORT || 3000;

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

const startServer = async () => {
  try {
    await mongooseConnection.connect();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
