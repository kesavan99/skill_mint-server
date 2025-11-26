const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

async function connect() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'skill-mint';

    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set.');
    }

    await mongoose.connect(uri, {
      dbName: dbName,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });

    isConnected = true;
    console.log('Successfully connected to MongoDB with Mongoose (pooled)!');

    await initializeDatabase();

    return mongoose.connection;
  } catch (error) {
    console.error('Mongoose connection error:', error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    const Teacher = require('./schemas/teacherSchema');

    const adminExists = await Teacher.findOne({ user: 'admin' });

    if (!adminExists) {
      await Teacher.create({
        user: 'admin',
        password: 'admin'
      });
      console.log('Default admin teacher created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

async function disconnect() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Database connection closed');
  }
}

function getConnection() {
  return mongoose.connection;
}

module.exports = {
  connect,
  disconnect,
  getConnection,
};
