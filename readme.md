<!-- Banner -->
<div align="center">

# EasyRL: A URL Shortener

### Shorten. Share. Simplify.

A fast, minimal, and developer-friendly URL shortener built to make long URLs short.

</div>

## Objective

This project is built as a **hands-on learning experience** while studying **Backend Development with Node.js**.
The goal was to understand and implement real-world backend concepts by building a fully functional URL Shortener from scratch.

### Through this project, I learned and implemented:

- Building RESTful routes using **Express.js v5**
- Database design and management with **MySQL** & **Drizzle ORM**
- User authentication using **JWT** & **express-session**
- OAuth 2.0 social login with **Google** & **GitHub**
- Password hashing with **Argon2** & **Bcrypt**
- Sending transactional emails using **Nodemailer** & **Resend**
- Designing responsive email templates with **MJML**
- File uploads with **Multer**
- Input validation using **Zod**
- Server-side rendering with **EJS**
- Session & cookie management
- Password reset & email verification flows
- MVC architecture & clean project structure

> This project is a reflection of my learning journey in backend development. It may not be perfect, but it represents real progress and practical understanding of core backend concepts.

## Technical Features

- **Unique Short Code Generation** — Uses Node.js `crypto` module to generate collision-free unique short codes.
- **MVC Architecture** — Follows the `Model-View-Controller` design pattern for organized and scalable code.
- **MySQL Database with Drizzle ORM** — Persistent data storage using `MySQL` managed via `Drizzle ORM` for type-safe queries, migrations, and seeding.
- **OAuth 2.0 Authentication** — Google & GitHub social login implemented using `Arctic` for seamless third-party authentication.
- **Password Hashing** — Secure password storage using `Argon2` and `Bcrypt` hashing algorithms.
- **JWT Authentication** — Token-based authentication using `jsonwebtoken` for secure API access.
- **Session Management** — Server-side session handling via `express-session` with `cookie-parser` for cookie management.
- **Flash Messages** — User-friendly error/success notifications using `connect-flash`.
- **Profile Photo Upload** — File upload functionality powered by `Multer` for user profile photos.
- **Email Services** — Transactional email support using `Nodemailer` and `Resend`, with beautiful email templates built using `MJML`.
- **Input Validation & Sanitization** — Schema-based input validation using `Zod` to protect against malformed data and injection attacks.
- **Server-Side Rendering** — Dynamic HTML rendering using `EJS` templating engine.
- **IP Tracking** — Client IP detection using `request-ip` for analytics and security.
- **Environment Configuration** — Supports `.env` files via `dotenv` for environment-specific configurations.
- **Asynchronous Operations** — Fully asynchronous request handling using `async/await` for non-blocking I/O.
- **Middleware Integration** — Custom middleware for logging, validation, authentication, and error handling.
- **Express 5** — Built on the latest `Express.js v5` framework for modern routing and improved error handling.

## Tech Stack

### Backend

- **Node.js** — JavaScript runtime environment
- **Express.js v5** — Web application framework
- **EJS** — Server-side templating engine
- **JSON Web Token (JWT)** — Token-based authentication
- **Arctic** — OAuth 2.0 (Google & GitHub login)
- **Argon2 / Bcrypt** — Password hashing
- **express-session** — Session management
- **cookie-parser** — Cookie handling
- **connect-flash** — Flash messages
- **Multer** — File/image upload handling
- **Nodemailer / Resend** — Email delivery services
- **MJML** — Responsive email templates
- **Zod** — Input validation & schema enforcement
- **request-ip** — Client IP detection
- **dotenv** — Environment variable management
- **crypto** — Unique short code generation

### Database

- **MySQL** — Relational database for data storage
- **Drizzle ORM** — Type-safe SQL query builder & migrations
- **Drizzle Kit** — Database migration & management tool
- **drizzle-seed** — Database seeding utility

### Frontend

- **HTML5** — Markup structure
- **CSS3** — Styling and layout
- **JavaScript** — Client-side interactivity
- **EJS** — Dynamic server-side rendered pages

### Tools & Platforms

- **Git** — Version control
- **GitHub** — Code hosting & collaboration
- **VS Code** — Code editor
- **Postman** — API testing
- **npm** — Package manager

## How to Run

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v18 or above) — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (local installation or cloud) — [Download](https://dev.mysql.com/downloads/)
- **Git** — [Download](https://git-scm.com/)
- **Google OAuth Credentials** — [Google Cloud Console](https://console.cloud.google.com/)
- **GitHub OAuth Credentials** — [GitHub Developer Settings](https://github.com/settings/developers)
- **Resend API Key** — [Resend Dashboard](https://resend.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/ankitsharma34/EasyRL_URL-Shortener.git
cd EasyRL_URL-Shortener
```

### 2️. Install Dependencies

```bash
npm install
```

### 3️. Set Up Environment Variables

Create a .env file in the root directory.

Open the .env file and fill in your credentials:

```env
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE_NAME=easyrl

# MySQL
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
DATABASE_NAME=easyrl_db
DATABASE_URL=mysql://root:your_mysql_password@localhost:3306/easyrl_db

# JWT
JWT_SECRET=your_jwt_secret_key

# Express Session
SESSION_SECRET=your_session_secret_key

# Resend (Email Service)
RESEND_API_KEY=re_your_resend_api_key

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth 2.0
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4️. Set Up the Database

Create the MySQL database:

```sql
CREATE DATABASE easyrl_db;
```

Run Drizzle commands one by one:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

(Optional) Seed the database:

```bash
npm run db:seed
```

### 5️. Run the Application

Run in development mode (with auto-reload):

```bash
npm run dev
```

### 6️. Access the Application

Open your browser and navigate to:

```text
http://localhost:3000
```

## API Endpoints

### URL Shortener Routes

| Method | Endpoint      | Description                  |
| :----: | ------------- | ---------------------------- |
| `GET`  | `/`           | Home page                    |
| `POST` | `/`           | Shorten a new URL            |
| `GET`  | `/links`      | View all shortened URLs      |
| `GET`  | `/:shortCode` | Redirect to the original URL |
| `GET`  | `/edit/:id`   | Edit shortened URL page      |
| `POST` | `/edit/:id`   | Update shortened URL         |
| `POST` | `/delete/:id` | Delete a shortened URL       |

---

### Authentication Routes

| Method | Endpoint    | Description         |
| :----: | ----------- | ------------------- |
| `GET`  | `/register` | Registration page   |
| `POST` | `/register` | Register a new user |
| `GET`  | `/login`    | Login page          |
| `POST` | `/login`    | Login user          |
| `GET`  | `/logout`   | Logout user         |

---

### Profile Routes

| Method | Endpoint           | Description                         |
| :----: | ------------------ | ----------------------------------- |
| `GET`  | `/me`              | Get current logged-in user          |
| `GET`  | `/profile`         | User profile page                   |
| `GET`  | `/edit-profile`    | Edit profile page                   |
| `POST` | `/edit-profile`    | Update profile (with avatar upload) |
| `GET`  | `/change-password` | Change password page                |
| `POST` | `/change-password` | Update password                     |
| `GET`  | `/set-password`    | Set password page (OAuth users)     |
| `POST` | `/set-password`    | Set a new password (OAuth users)    |

---

### Email Verification Routes

| Method | Endpoint                    | Description               |
| :----: | --------------------------- | ------------------------- |
| `GET`  | `/verify-email`             | Email verification page   |
| `GET`  | `/verify-email-token`       | Verify email via token    |
| `POST` | `/resend-verification-link` | Resend verification email |

---

### Password Reset Routes

| Method | Endpoint                 | Description               |
| :----: | ------------------------ | ------------------------- |
| `GET`  | `/forgot-password`       | Forgot password page      |
| `POST` | `/forgot-password`       | Send password reset email |
| `GET`  | `/reset-password/:token` | Reset password page       |
| `POST` | `/reset-password/:token` | Reset password with token |

---

### OAuth 2.0 Routes

| Method | Endpoint           | Description                   |
| :----: | ------------------ | ----------------------------- |
| `GET`  | `/google`          | Initiate Google OAuth login   |
| `GET`  | `/google/callback` | Google OAuth callback handler |
| `GET`  | `/github`          | Initiate GitHub OAuth login   |
| `GET`  | `/github/callback` | GitHub OAuth callback handler |

## Credits

This project was built by following the amazing tutorial series by **Thapa Technical** on YouTube.

- 🎥 **YouTube Channel:** [Thapa Technical](https://www.youtube.com/@taborethapaTechnical)
- 📺 **Playlist:** [URL Shortener Full Tutorial Series](https://www.youtube.com/playlist?list=PLwGdqUZWnOp3KELplHtc-RnJ5xTUPqdgH)

A huge thanks to **Thapa Technical** for providing such high-quality, free educational content!
