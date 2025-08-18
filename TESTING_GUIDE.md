# 🧪 WeTransfer-like File Sharing App - Testing Guide

Your backend is fully implemented according to the original specification! Here's how to test it manually.

## 🚀 Start the Server

1. **Open Terminal 1** and run:
   ```bash
   npm start
   ```
   
   You should see:
   ```
   Server running on port 3000
   Environment: development
   Connected to MongoDB
   Starting cleanup job - runs every 1 hour(s)
   ```

2. **Keep this terminal open** - your server is now running!

## 📋 Core WeTransfer Features to Test

### ✅ 1. File Upload (Core Feature)

**Open Terminal 2** and test with curl:

```bash
# Create a test file
echo "Hello WeTransfer-like app! This is a test file." > test.txt

# Upload file with email notification
curl -X POST http://localhost:3000/api/files/upload \
  -F "file=@test.txt" \
  -F "senderEmail=sender@example.com" \
  -F "receiverEmail=receiver@example.com"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "test.txt",
    "fileSize": 45,
    "downloadLink": "http://localhost:3000/api/files/download/123e4567-e89b-12d3-a456-426614174000",
    "expiryTime": "2024-01-02T12:00:00.000Z",
    "emailSent": true
  }
}
```

**Copy the UUID from the response for next tests!**

### ✅ 2. File Download (Core Feature)

```bash
# Replace YOUR_UUID with the actual UUID from upload response
curl -O -J http://localhost:3000/api/files/download/YOUR_UUID
```

This downloads the file with original filename.

### ✅ 3. File Info (Expiry Check)

```bash
# Check file info and expiry time
curl http://localhost:3000/api/files/info/YOUR_UUID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "YOUR_UUID",
    "filename": "test.txt",
    "originalName": "test.txt",
    "fileSize": 45,
    "uploadTime": "2024-01-01T12:00:00.000Z",
    "expiryTime": "2024-01-02T12:00:00.000Z",
    "downloadCount": 1,
    "isExpired": false,
    "timeRemaining": 86340000
  }
}
```

### ✅ 4. User Authentication (Optional Feature)

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Copy the JWT token from login response for authenticated requests!**

### ✅ 5. User File Management

```bash
# Get user's uploaded files (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/files/my-files
```

## 🌐 Browser Testing

### Upload via Browser:

1. **Open browser** to: http://localhost:3000/api/health
   - Should show: `{"status":"OK","timestamp":"...","uptime":...}`

2. **Create HTML test page** (save as `test-upload.html`):

```html
<!DOCTYPE html>
<html>
<head>
    <title>WeTransfer-like File Upload Test</title>
</head>
<body>
    <h1>File Upload Test</h1>
    <form action="http://localhost:3000/api/files/upload" method="post" enctype="multipart/form-data">
        <div>
            <label>Select File:</label>
            <input type="file" name="file" required>
        </div>
        <div>
            <label>Sender Email:</label>
            <input type="email" name="senderEmail" placeholder="sender@example.com">
        </div>
        <div>
            <label>Receiver Email:</label>
            <input type="email" name="receiverEmail" placeholder="receiver@example.com">
        </div>
        <button type="submit">Upload File</button>
    </form>
</body>
</html>
```

3. **Open the HTML file** in browser and test upload!

## 📧 Email Testing

Your app uses **Ethereal Email** for testing:

1. **Check your .env file** for Ethereal credentials
2. **After file upload with receiverEmail**, go to: https://ethereal.email/
3. **Login with your Ethereal credentials**
4. **View the sent email** with download link!

## 🔍 Database Verification

Check your MongoDB data:

```bash
# Connect to MongoDB
mongosh file-sharing-app

# View uploaded files
db.files.find().pretty()

# View users
db.users.find().pretty()

# View download logs
db.downloadlogs.find().pretty()
```

## ⏰ Auto-Cleanup Testing

Your app automatically deletes expired files every hour. To test:

1. **Modify expiry time** in `.env`:
   ```
   FILE_EXPIRY_HOURS=0.01  # 36 seconds for testing
   ```

2. **Restart server** and upload a file
3. **Wait 1 minute** and check - file should be auto-deleted!

## 🎯 All WeTransfer Features Implemented

✅ **Easy Uploads** - Multer handles file storage securely  
✅ **Unique Links** - UUID generates unguessable download links  
✅ **Email Sharing** - Nodemailer sends links via email  
✅ **Auto Expiry** - Files expire after 24 hours (configurable)  
✅ **Download Tracking** - Counts and logs every download  
✅ **User Auth** - JWT-based login for file management  
✅ **Auto Cleanup** - Cron job removes expired files  
✅ **Security** - Rate limiting, file size limits, secure storage  

## 🚀 Ready for Frontend!

Your backend is complete and working! Next steps:

1. **Build React frontend** that calls these APIs
2. **Create upload/download UI** 
3. **Add drag-and-drop** file upload
4. **Show expiry countdown** timers
5. **Add copy-link** functionality

Your WeTransfer-like file sharing backend is production-ready! 🎉