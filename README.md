# Menú del Día App

A location-based platform for residents and tourists in Tenerife to discover daily lunch offers (Menú del Día) from nearby restaurants.

## Features

- **Location-based discovery**: Find restaurants offering Menú del Día near you
- **Smart filtering**: Search by cuisine, price, dietary preferences, and more
- **Menu uploads**: Restaurants can upload their daily menus via photo (OCR) or manual input
- **Social features**: Save favorites, share menus, and leave reviews
- **Restaurant dashboard**: Easy menu management for restaurant owners
- **Notifications**: Get alerts about new menus from your favorite spots

## Tech Stack

### Frontend
- React Native (iOS, Android, Web)
- React Navigation
- Expo
- React Native Maps
- Axios

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Google Cloud Vision (OCR)
- OpenAI (menu parsing)
- Firebase Cloud Messaging (notifications)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Expo CLI

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/menu-del-dia.git
cd menu-del-dia
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLOUD_CREDENTIALS=path_to_credentials_file
OPENAI_API_KEY=your_openai_api_key
FIREBASE_CREDENTIALS=path_to_firebase_credentials
```

4. Install frontend dependencies
```
cd ../frontend
npm install
```

5. Start the development servers
```
# In backend directory
npm run dev

# In frontend directory
npm start
```

## Project Structure

```
menu-del-dia/
├── backend/
│   ├── api/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── App.js
│   └── package.json
└── README.md
```

## License

This project is licensed under the ISC License.
