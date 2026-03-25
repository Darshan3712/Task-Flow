# Task Flow — Backend Server

Node.js + Express + MongoDB API backend for the Task Flow application.

## Setup (First Time)

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Configure environment
Edit `server/.env` and fill in your values:
```
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/taskflow
JWT_SECRET=your_random_secret_here
PORT=5000
```

> Get a free MongoDB URI from https://www.mongodb.com/atlas

### 3. Create the admin account (run once)
After the server starts, call the setup endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/setup-admin
```
Or open it in your browser: http://localhost:5000/api/auth/setup-admin (POST)

This creates the default admin: **username: admin / password: admin123**

> You can also use the Postman or Thunder Client extension in VS Code.

### 4. Start the server
```bash
npm run dev      # Development mode (auto-reloads with nodemon)
npm start        # Production mode
```

The server runs on http://localhost:5000

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login — returns JWT token |
| POST | `/api/auth/setup-admin` | ❌ | Create admin (first-time only) |
| GET | `/api/projects` | ✅ | List all projects |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| GET | `/api/employees` | ✅ | List all employees |
| POST | `/api/employees` | Admin | Create employee |
| PUT | `/api/employees/:id` | Admin | Update employee |
| DELETE | `/api/employees/:id` | Admin | Delete employee |
| GET | `/api/services` | ✅ | List all services |
| POST | `/api/services` | Admin | Create service |
| PUT | `/api/services/:id` | Admin | Update service |
| DELETE | `/api/services/:id` | Admin | Delete service |
| GET | `/api/tasks?projectId=&date=` | ✅ | Get tasks for a project+date |
| GET | `/api/tasks/all?projectId=` | ✅ | Get all tasks for a project |
| POST | `/api/tasks` | ✅ | Save/update tasks |
| DELETE | `/api/tasks?projectId=&date=` | ✅ | Delete tasks |

---

## Running Frontend + Backend Together

**Terminal 1 (Backend):**
```bash
cd server && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd .. && npm run dev
```

The frontend's `.env.local` file already points `VITE_API_URL` to `http://localhost:5000/api`.
