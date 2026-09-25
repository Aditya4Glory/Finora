# Finora - Personal Finance & Expense Tracker

Finora is a full-stack personal finance management web application that allows users to securely track income and expenses, organize transactions by category, monitor financial metrics, filter and search logs, and visualize spending through interactive charts.

Designed with clean architecture, robust JWT authentication, database-level user isolation, and a modern financial dashboard UI.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [API Documentation](#api-documentation)
- [Automated Testing](#automated-testing)
- [Production Deployment](#production-deployment)
- [Future Improvements](#future-improvements)

---

## Features

- **User Authentication & Security**:
  - Secure registration and login with bcrypt password hashing.
  - JWT (JSON Web Token) authentication with protected API endpoints.
  - Strict user data isolation (each user can only view, edit, or delete their own transactions).
- **Dashboard & Real-Time Analytics**:
  - Real-time calculation of Total Balance, Total Income, Total Expenses, and Transaction count.
  - Interactive charts powered by Recharts:
    - **Expense by Category**: Donut chart with category color coding and tooltips.
    - **Income vs. Expense**: Monthly comparison bar chart.
    - **Monthly Spending Trend**: Spending trajectory line chart.
  - Recent transactions overview.
- **Transaction Management**:
  - Add, edit, and delete income and expense transactions.
  - Validation preventing zero or negative values.
  - Destructive action confirmation dialogs.
  - Predefined categorized workflows (Food, Shopping, Transport, Bills, Salary, Freelance, etc.).
- **Search, Filter & Sorting**:
  - Instant search across transaction titles and descriptions.
  - Filter by transaction type (Income / Expense).
  - Filter by category.
  - Filter by date ranges (Start Date to End Date).
  - Sort by Newest, Oldest, Amount: High to Low, Amount: Low to High.
  - Clean pagination for transaction logs.
- **Modern Responsive UI**:
  - Built with Tailwind CSS and Lucide icons.
  - Fully responsive across mobile, tablet, laptop, and desktop viewports.
  - Dynamic loading spinners, custom non-intrusive toast notifications, and empty states.

---

## Tech Stack

### Frontend
- **Framework**: React.js (v18)
- **Bundler & Dev Server**: Vite
- **Routing**: React Router (v6)
- **HTTP Client**: Axios (with authorization & response interceptors)
- **Data Visualization**: Recharts
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (JavaScript)
- **Server Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Security & Utilities**: `bcryptjs`, `cors`, `dotenv`
- **Testing**: `mongodb-memory-server`

---

## Project Architecture

```
Finora/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── assets/             # Images and styles
│   │   ├── components/         # Reusable UI components (StatCard, Modals, EmptyState, etc.)
│   │   ├── context/            # AuthContext & ToastContext providers
│   │   ├── hooks/              # Custom hooks (useAuth, useToast)
│   │   ├── layouts/            # DashboardLayout (Sidebar, Navbar, Quick Add)
│   │   ├── pages/              # Application views (Dashboard, Transactions, Profile, Auth)
│   │   ├── services/           # Axios API client and service endpoints
│   │   ├── utils/              # Formatters, constants, and color maps
│   │   ├── App.jsx             # Route definitions and ProtectedRoute guards
│   │   ├── main.jsx            # React root mounting
│   │   └── index.css           # Tailwind directives and typography
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json             # SPA rewrites for Vercel deployment
│   └── .env.example
├── server/                     # Backend Express.js API
│   ├── config/
│   │   └── db.js               # MongoDB connection with zero-config fallback
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me, Profile update
│   │   └── transactionController.js # CRUD, filtering, pagination, summary stats
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT token protection
│   │   └── errorMiddleware.js  # Central error handler & 404 handler
│   ├── models/
│   │   ├── User.js             # User Mongoose schema & methods
│   │   └── Transaction.js      # Transaction schema & validation
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth endpoints
│   │   └── transactionRoutes.js # /api/transactions endpoints
│   ├── utils/
│   │   └── generateToken.js    # JWT generation helper
│   ├── test/
│   │   └── api.test.js         # End-to-end integration test suite
│   ├── server.js               # Express application entry point
│   ├── package.json
│   └── .env.example
├── package.json                # Root package for convenient workspace scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Documentation
```

---

## Environment Variables

### Server Configuration (`server/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port for Express server | `5001` |
| `MONGODB_URI` | MongoDB connection URI (Atlas or local) | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/finora` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_super_secret_jwt_key_here_min_32_chars` |
| `CLIENT_URL` | Allowed origin for CORS in production | `http://localhost:5173` |
| `NODE_ENV` | Application environment | `development` / `production` |

> **Note**: If `MONGODB_URI` is left blank in local development, Finora automatically initializes an in-memory MongoDB instance for instant zero-configuration local runs!

### Client Configuration (`client/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5001/api` |

---

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x, v20.x, or v22.x)
- [npm](https://www.npmjs.com/) (v9.x or higher)
- Optional: MongoDB Atlas account or local MongoDB daemon (if not using automatic in-memory fallback)

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/Finora.git
cd Finora
```

### Step 2: Install Dependencies

You can install all dependencies from the root directory:
```bash
npm run install-all
```
*Or install individually:*
```bash
cd server && npm install
cd ../client && npm install
```

### Step 3: Configure Environment Variables

1. **Server**:
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` if you want to provide your own MongoDB Atlas URI and JWT Secret.

2. **Client**:
   ```bash
   cd ../client
   cp .env.example .env
   ```

### Step 4: Run the Application

#### Option A: Running from individual directories

1. **Start the backend server**:
   ```bash
   cd server
   npm run dev
   ```
   *Server will run at `http://localhost:5001`.*

2. **In a new terminal window, start the frontend**:
   ```bash
   cd client
   npm run dev
   ```
   *Frontend will run at `http://localhost:5173`.*

#### Option B: Running from root

```bash
# Terminal 1:
npm run server

# Terminal 2:
npm run client
```

Open your browser at `http://localhost:5173` to start using Finora.

---

## API Documentation

All protected routes require the `Authorization` header: `Bearer <jwt_token>`.

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (name, email, password, confirmPassword) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current authenticated user profile |
| `PUT` | `/api/auth/profile` | Protected | Update profile name |

### Transaction Endpoints (`/api/transactions`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/transactions` | Protected | Create income or expense transaction |
| `GET` | `/api/transactions` | Protected | Fetch transactions (supports `search`, `type`, `category`, `startDate`, `endDate`, `sort`, `page`, `limit`) |
| `GET` | `/api/transactions/summary` | Protected | Aggregate total income, expense, balance, category breakdown, & monthly trends |
| `GET` | `/api/transactions/:id` | Protected | Get single transaction details by ID |
| `PUT` | `/api/transactions/:id` | Protected | Update existing transaction |
| `DELETE` | `/api/transactions/:id` | Protected | Delete transaction |

### Health Check

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and timestamp |

---

## Automated Testing

Finora includes an automated integration test suite that tests the entire API end-to-end against an isolated database:

```bash
npm test
```
*Or from the server folder:*
```bash
cd server && npm test
```

### What the test suite covers:
1. System health check.
2. User registration and password hashing.
3. Duplicate email prevention.
4. Invalid login credentials rejection.
5. Successful login & JWT issuance.
6. Profile retrieval & profile name update.
7. Income creation.
8. Validation rejection for negative or zero amounts and invalid categories.
9. Multiple expense creation across categories.
10. Transaction update.
11. Transaction deletion.
12. Search query matching.
13. Category and type filtering.
14. Dashboard statistical aggregation (balance, income, expenses, count).
15. Multi-tenant security & user isolation (verifying User 2 cannot access, edit, or delete User 1 data).

---

## Production Deployment

### 1. Database Setup: MongoDB Atlas
1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 Sandbox** cluster.
3. Under **Database Access**, create a database user with username and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Render can connect.
5. Click **Connect** -> **Connect your application** (Driver: Node.js) and copy the connection string. Replace `<username>` and `<password>` with your database user credentials.

---

### 2. Complete Render Deployment (Option A - Recommended: Single Full-Stack Web Service)

Finora is pre-configured with a unified full-stack architecture where a single Render Web Service serves both the Express REST API and the compiled React SPA on the exact same domain. This avoids CORS configuration, keeps everything on one URL, and runs entirely within Render's free tier!

#### Via Render Blueprint (1-Click with `render.yaml`):
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your `Finora` repository.
5. Render will automatically detect [`render.yaml`](file:///Users/adityamishra/Desktop/Finora/render.yaml) and configure:
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Auto-generated JWT Secret**
6. Enter your `MONGODB_URI` when prompted.
7. Click **Apply**. Render will install dependencies, build the client, and deploy the full-stack app.

#### Manual Configuration on Render:
1. Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `finora` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Closest to you (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank — defaults to repository root)*
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<A secure random 32+ character string>`
5. Click **Create Web Service**.
6. Once deployed, open your Render URL (e.g. `https://finora.onrender.com`). You will see the complete application with working authentication, dashboard, transactions, and charts!

---

### 3. Separate Deployment (Option B: Backend on Render, Frontend on Vercel)

If you prefer deploying the frontend and backend on separate platforms:

#### Backend on Render:
1. Create a **Web Service** on Render.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Secret>`
   - `CLIENT_URL`: `https://your-finora-app.vercel.app`
6. Deploy and copy your backend URL (e.g. `https://finora-api.onrender.com`).

#### Frontend on Vercel:
1. Sign in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
2. Import the `Finora` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://finora-api.onrender.com/api`
5. Click **Deploy**. The included `client/vercel.json` ensures SPA routes work seamlessly.

---

## Screenshots

*(Add screenshots of your Finora deployment here)*

| Dashboard Overview | Transactions Management |
| :---: | :---: |
| *(Dashboard screenshot)* | *(Transactions list screenshot)* |

| Add/Edit Modal | Spending Analytics |
| :---: | :---: |
| *(Modal screenshot)* | *(Recharts visualization screenshot)* |

---

## Future Improvements

- Recurring transactions (subscriptions, scheduled salary).
- Export transactions to CSV / PDF reports.
- Multi-currency conversion via real-time exchange rates.
- Budget goals with threshold warnings.

---

## License

This project is licensed under the [MIT License](LICENSE).
