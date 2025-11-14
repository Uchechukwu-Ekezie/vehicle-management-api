# Railway Deployment Guide - Vehicle Management API

This guide will help you deploy the Vehicle Management API to Railway so your frontend engineer can start integrating.

## 🚀 Quick Deploy Steps

### 1. Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app with GitHub)
- Your code pushed to a GitHub repository

### 2. Push Code to GitHub

First, initialize git and push your code (if not already done):

```bash
cd /c/Users/MSI/Desktop/vms/VehicleManagementAPI

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Vehicle Management API"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/vehicle-management-api.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Railway

#### Option A: Deploy via Railway Dashboard (Recommended)

1. **Go to Railway**: https://railway.app
2. **Sign in** with your GitHub account
3. **Create New Project**
4. **Deploy from GitHub repo**
   - Click "Deploy from GitHub repo"
   - Select your `vehicle-management-api` repository
5. **Add MySQL Database**
   - Click "+ New" → "Database" → "Add MySQL"
   - Railway will automatically provision a MySQL database

#### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to your project
railway link

# Deploy
railway up
```

### 4. Configure Environment Variables

In Railway Dashboard, go to your project → Variables tab and add:

#### Required Variables:

**JWT_SECRET_KEY**
```
YourSuperSecretKeyForJWTTokenGeneration123!ChangeThisInProduction
```
*(Change this to a strong, unique secret key)*

**DATABASE_URL** (Railway auto-populates this when you add MySQL)
```
Already set automatically by Railway MySQL service
```

**ASPNETCORE_ENVIRONMENT**
```
Production
```

**ASPNETCORE_URLS**
```
http://0.0.0.0:$PORT
```

#### Optional Variables (for better security):

**JWT_ISSUER**
```
VehicleManagementAPI
```

**JWT_AUDIENCE**
```
VehicleManagementClient
```

### 5. Update Connection String Format

Railway provides `DATABASE_URL` in a specific format. We need to update our code to handle it.

The connection string from Railway looks like:
```
mysql://user:password@host:port/database
```

We need to parse this in `Program.cs`. **This is already configured in the Dockerfile and production settings.**

### 6. Run Migrations on Railway

After deployment, you need to apply database migrations:

#### Using Railway CLI:
```bash
# Connect to your Railway project
railway link

# Run migrations
railway run dotnet ef database update
```

#### Or manually via Railway Shell:
1. Go to Railway Dashboard → Your Service
2. Click "Deploy" tab → "Deployments"
3. Click on the latest deployment
4. Click "View Logs"
5. Once deployed, use Railway's shell feature to run:
```bash
dotnet ef database update
```

### 7. Get Your API URL

After deployment:
1. Go to Railway Dashboard → Your Service
2. Click "Settings" tab
3. Scroll to "Domains"
4. Click "Generate Domain"
5. Your API will be available at: `https://your-app-name.up.railway.app`

## 🔧 Configuration Files Created

### ✅ Dockerfile
- Multi-stage build for optimized image size
- Uses .NET 8 SDK and runtime
- Exposes port 8080 for Railway

### ✅ .dockerignore
- Excludes unnecessary files from Docker build
- Reduces image size and build time

### ✅ railway.json
- Railway-specific configuration
- Specifies Dockerfile build and start command

### ✅ appsettings.Production.json
- Production-specific settings
- Uses environment variables for sensitive data
- Configured for Railway's MySQL connection

## 📋 Post-Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Railway project created
- [ ] MySQL database added to Railway project
- [ ] Environment variables configured (JWT_SECRET_KEY, DATABASE_URL)
- [ ] Database migrations applied (`dotnet ef database update`)
- [ ] Custom domain generated in Railway
- [ ] API endpoint tested (GET /api/health or POST /api/Auth/register)
- [ ] CORS configured for your frontend domain (if needed)
- [ ] API URL shared with frontend engineer

## 🧪 Test Your Deployed API

Once deployed, test with:

```bash
# Replace YOUR_RAILWAY_URL with your actual Railway URL
RAILWAY_URL="https://your-app-name.up.railway.app"

# Test health/register endpoint
curl -X POST $RAILWAY_URL/api/Auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234",
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "admin"
  }'

# Test login
curl -X POST $RAILWAY_URL/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234"
  }'
```

## 🌐 Frontend Integration

Share these with your frontend engineer:

**Base API URL**: `https://your-app-name.up.railway.app`

**Swagger Docs**: `https://your-app-name.up.railway.app/swagger`

**Sample Frontend Config**:
```javascript
// config.js or .env
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-app-name.up.railway.app';

// Example fetch
fetch(`${API_BASE_URL}/api/Auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'Test1234'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.token);
});
```

## 🔒 Update CORS for Production

If your frontend is on a specific domain (e.g., Vercel, Netlify), update `Program.cs` CORS policy:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",  // Local development
            "https://your-frontend-domain.vercel.app"  // Production
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

Then redeploy to Railway.

## 💡 Troubleshooting

### Build Fails
- Check Railway logs in the "Deployments" tab
- Ensure all NuGet packages restore correctly
- Verify Dockerfile syntax

### Database Connection Error
- Verify DATABASE_URL is set correctly
- Check MySQL service is running in Railway
- Ensure migrations have been applied

### API Not Accessible
- Check that Railway generated a public domain
- Verify ASPNETCORE_URLS is set to `http://0.0.0.0:$PORT`
- Check deployment logs for startup errors

### CORS Errors from Frontend
- Add frontend domain to CORS policy in Program.cs
- Redeploy after updating CORS settings

## 📊 Monitoring & Logs

- **View Logs**: Railway Dashboard → Your Service → Logs tab
- **Metrics**: Railway Dashboard → Your Service → Metrics tab
- **Database**: Railway Dashboard → MySQL Service → Data tab (to view tables)

## 💰 Railway Pricing

- **Hobby Plan**: $5/month with $5 usage credit included
- **Free Trial**: Limited usage for testing
- **Pro Plan**: Pay-as-you-go for production apps

## 🚨 Important Notes

1. **Change JWT Secret**: Use a strong, unique secret key in production
2. **Database Backups**: Railway provides automatic backups for MySQL
3. **Environment Variables**: Never commit secrets to Git
4. **HTTPS**: Railway provides free HTTPS with generated domains
5. **Logs**: Monitor Railway logs for errors after deployment

## 📞 Support

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app

---

**Deployment Date**: November 14, 2025  
**API Version**: v1.0  
**Database**: MySQL 8.0
