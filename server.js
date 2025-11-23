const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const mongooseConnection = require('./models/mongooseConnection');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:3000','https://bejewelled-alpaca-18236b.netlify.app'], // Allow Vite dev server, React and deployed app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true, // Important for cookies
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/skill-mint', authRoutes);
app.use('/api/resume', resumeRoutes);

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
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 API endpoint: http://localhost:${PORT}/skill-mint/login`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
