# 🚀 Deploy WeTransfer-like App to Render

## Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Render Account** - Sign up at https://render.com (free)
3. **MongoDB Atlas Account** - For cloud database (free)

## Step 1: Setup MongoDB Atlas (Free Database)

1. **Go to:** https://www.mongodb.com/atlas
2. **Sign up** for free account
3. **Create new cluster** (choose free tier)
4. **Create database user:**
   - Username: `fileapp`
   - Password: `generate strong password`
5. **Whitelist IP:** Add `0.0.0.0/0` (allow all IPs)
6. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://fileapp:yourpassword@cluster0.abc123.mongodb.net/file-sharing-app`

## Step 2: Push Code to GitHub

1. **Create new GitHub repository**
2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - WeTransfer clone"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

## Step 3: Deploy to Render

1. **Go to:** https://render.com
2. **Sign up/Login** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure deployment:**
   - **Name:** `file-sharing-app` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

## Step 4: Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://fileapp:yourpassword@cluster0.abc123.mongodb.net/file-sharing-app
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random-at-least-32-characters
APP_URL=https://your-app-name.onrender.com
FILE_EXPIRY_HOURS=24
MAX_FILE_SIZE=100
CLEANUP_INTERVAL_HOURS=1
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=jarrod.mohr@ethereal.email
SMTP_PASS=ecdhKAYT2svyc6A8mM
```

**Important:** Replace `your-app-name` with your actual Render app name!

## Step 5: Deploy!

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Your app will be live at:** `https://your-app-name.onrender.com`

## Step 6: Test Your Live App

1. **Visit:** `https://your-app-name.onrender.com/api/health`
   - Should show: `{"status":"OK",...}`

2. **Test file upload:**
   - Create a simple HTML file with your live URL
   - Or use Postman with your live API endpoints

## Step 7: Update Frontend URLs

Update your HTML files to use the live API:

```javascript
// Change from:
fetch('http://localhost:3000/api/files/upload', ...)

// To:
fetch('https://your-app-name.onrender.com/api/files/upload', ...)
```

## 🎉 Your App is Live!

### API Endpoints:
- **Health:** `https://your-app-name.onrender.com/api/health`
- **Upload:** `https://your-app-name.onrender.com/api/files/upload`
- **Download:** `https://your-app-name.onrender.com/api/files/download/:uuid`
- **File Info:** `https://your-app-name.onrender.com/api/files/info/:uuid`

### Features Working:
✅ File upload with unique links  
✅ Email notifications via Ethereal  
✅ Auto-expiry after 24 hours  
✅ Download tracking  
✅ User authentication  
✅ Auto cleanup of expired files  

## 🔧 Troubleshooting

### Common Issues:

1. **"Application failed to respond"**
   - Check environment variables are set correctly
   - Verify MongoDB connection string

2. **"Cannot connect to database"**
   - Check MongoDB Atlas IP whitelist (use 0.0.0.0/0)
   - Verify database user credentials

3. **"File upload fails"**
   - Render free tier has limited disk space
   - Files are stored temporarily and cleaned up

4. **"Email not sending"**
   - Check Ethereal credentials
   - Verify SMTP environment variables

### Render Free Tier Limitations:
- **Disk space:** Limited (files auto-cleanup helps)
- **Sleep mode:** App sleeps after 15 minutes of inactivity
- **Bandwidth:** 100GB/month
- **Build time:** 500 build minutes/month

## 🚀 Production Improvements

For production use, consider:

1. **Paid Render plan** - No sleep mode, more resources
2. **AWS S3** - For file storage instead of local disk
3. **SendGrid/Mailgun** - For production email sending
4. **Custom domain** - Instead of .onrender.com
5. **CDN** - For faster file downloads
6. **Redis** - For session storage and caching

Your WeTransfer clone is now live and accessible worldwide! 🌍