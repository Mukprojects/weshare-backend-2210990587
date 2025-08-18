# 🔧 Render Environment Variables Setup

When deploying to Render, you'll need to set these environment variables in the Render dashboard:

## Required Environment Variables:

### Database
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/file-sharing-app
```
**Get this from MongoDB Atlas (free tier)**

### App Configuration
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
APP_URL=https://your-actual-app-name.onrender.com
FILE_EXPIRY_HOURS=24
MAX_FILE_SIZE=100
CLEANUP_INTERVAL_HOURS=1
```

**IMPORTANT:** Replace `your-actual-app-name` with your real Render app name!

### Email Configuration (Ethereal for testing)
```
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-username
SMTP_PASS=your-ethereal-password
```

## 📋 Steps to Set Environment Variables in Render:

1. Go to your Render service dashboard
2. Click on "Environment" tab
3. Add each variable above
4. Click "Save Changes"
5. Your app will automatically redeploy

## 🔒 Security Notes:

- Generate a strong JWT_SECRET (at least 32 characters)
- Use MongoDB Atlas connection string (not localhost)
- Keep all secrets secure and never commit them to Git
- Update APP_URL to your actual Render URL

## 📧 Email Setup:

For production, consider upgrading from Ethereal to:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5,000 emails/month)
- Gmail SMTP (with app password)

But Ethereal works fine for testing!