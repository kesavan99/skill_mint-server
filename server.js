const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { normalLimiter, strictLimiter } = require('./middleware/rate-limiter');
const helmet = require("helmet");
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
app.use(helmet());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());  
app.use(normalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'bejewelled-alpaca-18236b.netlify.app','skillhubtools.store'],
    },
  })
);
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.noCache());
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  })
);
app.use(
  helmet({
    frameguard: false
  })
);

app.use(ratelimitter);
app.use('/skill-mint', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/code', codeRoutes);

app.get('/', (req, res) => {
  console.log(`Server is wake up`);
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
