# Skill Mint Server (Node.js)

Express.js API server for Skill Mint application with MVC architecture pattern.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run the server
npm start

# Run in development mode with auto-reload
npm run dev
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
skill_mint-server/
├── controllers/           # Business logic layer
│   └── authController.js
├── models/               # Data validation models
│   └── loginModel.js
├── routes/               # API route definitions
│   └── authRoutes.js
├── server.js             # Main application entry point
├── package.json          # Node.js dependencies
├── render.yaml          # Render.com deployment config
└── .env                 # Environment variables
```

## 📡 API Endpoints

### Login
- **URL:** `http://localhost:3000/skill-mint/login`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "email": "kesavan081999@gmail.com",
    "password": "efrgrergt"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "status": "success"
  }
  ```

## 🌐 Deploy to Render.com

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and sign in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect the configuration
6. Click "Create Web Service"

Your API will be available at: `https://your-app-name.onrender.com/skill-mint/login`

## 🧪 Testing

**To run the server:**
```bash
npm start
```

**Server runs on:** `http://localhost:3000/skill-mint/login`

## ✨ Features

- ✅ Express.js with MVC pattern
- ✅ CORS enabled
- ✅ Email validation
- ✅ Ready for Render.com deployment
