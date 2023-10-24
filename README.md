# Opentalks-backend

Welcome to the backend repository of OpenTalks.moto, a forum website designed to connect and engage university students.

## Description

Welcome to the backend repository of Opentalks Forum. This backend powers the Opentalks website, a forum designed for university students to enhance their learning experience. It provides a robust API for user management, forum creation, posts, and much more.

**Important Note**: This project is private and intended for use with permission. You may not use, modify, distribute, or reproduce any part of this project without explicit written permission from the project owner, Jaskaran Singh.

## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running the Backend](#running-the-backend)
- [Dependencies](#dependencies)
- [License](#license)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org)
- [npm](https://www.npmjs.com) or [Yarn](https://yarnpkg.com)
- Database System (MongoDB)

### Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/opentalks-forum-backend.git
```

2. Navigate to the Project Directory:

```bash
cd opentalks-backend
```

3. Install project dependencies:

```bash
npm install
```

### Project Structure

The backend is organized as follows:

- `/CONTROLLERS`: Contains controllers for handling HTTP requests and business logic.
- `/MODELS`: Includes database models and schema definitions.
- `/ROUTES`: Defines API route endpoints.
- `/MIDDLEWARES`: Houses custom middleware functions.
- `/CONFIG`: Contains configuration files, including database setup.

## Configuration

- Create a `config.env` file based on the `.env.example` template.
- Set environment variables, including database connection details. (PORT, DATABASE_PATH AND SECRET_KEY)

## Running the Backend

To start the development server, use the following command:

```bash
npm run start
```

## Dependencies

- bcrypt - For password hashing and verification.
- cors - Middleware for handling CORS.
- dotenv - For loading environment variables.
- express - Web application framework.
- jsonwebtoken - For JWT-based authentication.
- mongoose - Elegant MongoDB object modeling.
- multer - Middleware for handling file uploads.
- uuid - For generating UUIDs.

## License

This project is private and intended for use with permission. All rights are reserved by the project owner, Jaskaran Singh. You may not use, modify, distribute, or reproduce any part of this project without explicit written permission.

For inquiries or permissions, please [Email me](mailto:dhillonjaskaran4486@gmail.com).
