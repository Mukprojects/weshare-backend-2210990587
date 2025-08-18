# File Sharing App (Like WeTransfer)

A full-stack file sharing application that allows users to upload files and share them via unique, temporary download links. Built with Node.js, Express, MongoDB, and includes email notifications.

## 🚀 Features

- **Easy File Upload**: Upload any file type with drag-and-drop interface
- **Unique Shareable Links**: Each upload gets a unique, unguessable UUID-based link
- **Email Notifications**: Send download links directly via email
- **Automatic Expiry**: Files automatically expire after 24 hours (configurable)
- **Download Tracking**: Track download counts and access logs
- **User Authentication**: Optional user accounts to manage uploaded files
- **Auto Cleanup**: Expired files are automatically deleted from server
- **Security**: Rate limiting, file size limits, and secure file handling

## 🛠 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB with Mongoose
- Multer for file uploads
- UUID for unique link generation
- Nodemailer for email notifications
- JWT authentication with Passport.js
- Node-cron for cleanup tasks

**Security & Utilities:**
- Helmet for security headers
- CORS for cross-origin requests
- Rate limiting
- bcryptjs for password hashing
- Moment.js for date handling

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (running locally on default port 27017)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd file-sharing-app
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your settings:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/file-sharing-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development

# Ethereal Email Configuration (Free SMTP for testing)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-username
SMTP_PASS=your-ethereal-password

# App Configuration
APP_URL=http://localhost:3000
FILE_EXPIRY_HOURS=24
MAX_FILE_SIZE=100
CLEANUP_INTERVAL_HOURS=1
```

### 3. Setup Ethereal Email (Free SMTP Testing)

1. Go to [https://ethereal.email/](https://ethereal.email/)
2. Click "Create Ethereal Account"
3. Copy the SMTP credentials to your `.env` file
4. All emails will be captured and viewable in the Ethereal interface

### 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### File Operations

#### Upload File
```http
POST /api/files/upload
Content-Type: multipart/form-data

Form fields:
- file: (required) The file to upload
- senderEmail: (optional) Sender's email address
- receiverEmail: (optional) Recipient's email address
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "document.pdf",
    "fileSize": 1024000,
    "downloadLink": "http://localhost:3000/api/files/download/123e4567-e89b-12d3-a456-426614174000",
    "expiryTime": "2024-01-02T12:00:00.000Z",
    "emailSent": true
  }
}
```

#### Download File
```http
GET /api/files/download/:uuid
```

#### Get File Info
```http
GET /api/files/info/:uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "document.pdf",
    "originalName": "My Document.pdf",
    "fileSize": 1024000,
    "uploadTime": "2024-01-01T12:00:00.000Z",
    "expiryTime": "2024-01-02T12:00:00.000Z",
    "downloadCount": 5,
    "isExpired": false,
    "timeRemaining": 86400000
  }
}
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Files (Authenticated)
```http
GET /api/files/my-files
Authorization: Bearer <jwt-token>
```

## 🗂 Project Structure

```
file-sharing-app/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── multer.js            # File upload configuration
│   └── passport.js          # Authentication strategies
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── fileController.js    # File operations logic
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Global error handling
├── models/
│   ├── User.js              # User schema
│   ├── File.js              # File metadata schema
│   └── DownloadLog.js       # Download tracking schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── fileRoutes.js        # File operation routes
├── services/
│   ├── emailService.js      # Email sending service
│   └── cleanupService.js    # File cleanup service
├── uploads/                 # File storage directory
├── .env.example             # Environment variables template
├── server.js                # Main application entry point
└── README.md
```

## 🧪 Testing with Postman

Import the provided Postman collection to test all endpoints:

### Example Requests

1. **Upload a file:**
   - Method: POST
   - URL: `http://localhost:3000/api/files/upload`
   - Body: form-data
     - file: [select a file]
     - senderEmail: sender@example.com
     - receiverEmail: recipient@example.com

2. **Download a file:**
   - Method: GET
   - URL: `http://localhost:3000/api/files/download/{uuid}`

3. **Register a user:**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body: JSON
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"
   }
   ```

## 🔧 Configuration Options

### Environment Variables

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FILE_EXPIRY_HOURS`: Hours before files expire (default: 24)
- `MAX_FILE_SIZE`: Maximum file size in MB (default: 100)
- `CLEANUP_INTERVAL_HOURS`: How often to run cleanup (default: 1)
- `APP_URL`: Base URL for download links

### File Storage

Files are stored in the `uploads/` directory with UUID-based filenames to prevent conflicts and ensure security.

### Email Configuration

The app uses Ethereal Email for testing, which captures all emails without actually sending them. For production, replace with a real SMTP service like SendGrid, Mailgun, or Gmail SMTP.

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with request limits
- **File Size Limits**: Configurable maximum file size
- **Secure Headers**: Helmet.js adds security headers
- **UUID Links**: Unguessable download links
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Configurable cross-origin policies

## 🧹 Automatic Cleanup

The app automatically:
- Deletes expired files from disk and database
- Runs cleanup every hour (configurable)
- Removes old download logs
- Cleans up inactive file records

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a real SMTP service for emails
3. Configure MongoDB Atlas or a production MongoDB instance
4. Set up proper file storage (AWS S3, etc.)
5. Use a reverse proxy (nginx)
6. Set up SSL/TLS certificates
7. Configure proper logging
8. Set up monitoring and backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check the connection string in `.env`

2. **File Upload Fails**
   - Check file size limits
   - Ensure `uploads/` directory exists and is writable

3. **Email Not Sending**
   - Verify Ethereal Email credentials
   - Check SMTP configuration in `.env`

4. **Authentication Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Check token format in Authorization header

### Logs

The application logs important events to the console. In production, consider using a proper logging service like Winston or Morgan.

---

**Happy file sharing! 🎉**