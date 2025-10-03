# Money Splitter - Expense Tracking & Splitting App

A full-stack MERN (MongoDB, Express, React, Node.js) application for tracking and splitting expenses among friends and groups.

## Features

- User authentication (register/login)
- Create and manage groups
- Add expenses and split them among group members
- Track who owes whom
- Dashboard with expense summary
- Detailed expense views
- Responsive design with Bootstrap

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Bootstrap 5
- Axios
- FontAwesome Icons
- Vite (build tool)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt for password hashing

## Project Structure

```
money-splitter/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (AuthContext)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/              # Backend API (not included in this repo)
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    ├── middleware/      # Auth middleware
    └── server.js
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/money-splitter.git
cd money-splitter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (if needed):
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:3002`

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Start the server:
```bash
npm start
```

The API will run on `http://localhost:5000`

## Usage

1. **Register**: Create a new account
2. **Login**: Sign in with your credentials
3. **Create Group**: Start a new group for splitting expenses
4. **Add Members**: Invite friends to your group
5. **Add Expenses**: Record expenses and specify how they should be split
6. **View Dashboard**: See your balance and settlement suggestions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Groups
- `GET /api/groups` - Get all user groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Luckyy Lalwani

## Acknowledgments

- Bootstrap for the UI components
- React Router for navigation
- MongoDB for database
- Express.js for the backend API