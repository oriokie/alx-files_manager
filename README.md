# Files Manager

## Project Overview

Files Manager is a comprehensive file storage and management system built with Node.js. It provides a robust API for user authentication, file uploads, permissions management, and image processing.

## Features

- User authentication (signup, login, logout)
- File upload and management
- Public/private file permissions
- Image thumbnail generation
- Pagination for file listing
- Redis for caching and session management
- MongoDB for data persistence
- Background processing with Bull for thumbnail generation and welcome emails

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Redis
- Bull (for job queues)
- image-thumbnail (for image processing)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v12.x.x or later)
- MongoDB
- Redis

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/oriokie/alx-files_manager.git
   cd alx-files_manager
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=27017
   DB_DATABASE=files_manager
   FOLDER_PATH=/tmp/files_manager
   ```

## Usage

To start the server:

```
npm run start-server
```

To start the worker for background jobs:

```
npm run start-worker
```

## API Endpoints

- `POST /users` - Create a new user
- `GET /connect` - Sign in the user
- `GET /disconnect` - Sign out the user
- `GET /users/me` - Get the current user
- `POST /files` - Upload a file
- `GET /files/:id` - Get a file by ID
- `GET /files` - Get all files (paginated)
- `PUT /files/:id/publish` - Set a file to public
- `PUT /files/:id/unpublish` - Set a file to private
- `GET /files/:id/data` - Get the content of a file

## Testing

To run the test suite:

```
npm test
```

## Authors

- Edwin Orioki Kenyansa
- Clifford Karimi Muriuki Karimi
