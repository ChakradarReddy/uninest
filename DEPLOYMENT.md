# 🚀 UniNest Deployment Guide

This guide will help you deploy UniNest to Vercel for both frontend and backend.

## 📋 Prerequisites

- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account
- [PostgreSQL](https://www.postgresql.org/) database (for production)

## 🎯 Deployment Strategy

We'll deploy the **frontend** to Vercel and the **backend** to a separate hosting service (Vercel Serverless Functions have limitations for our use case).

## 🚀 Step 1: Deploy Frontend to Vercel

### 1.1 Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/uninest.git
git branch -M main
git push -u origin main
```

### 1.2 Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 1.3 Set Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

## 🖥️ Step 2: Deploy Backend

### Option A: Railway (Recommended for PostgreSQL)

1. **Go to [Railway](https://railway.app)**
2. **Create new project**
3. **Add PostgreSQL service**
4. **Add Node.js service**
5. **Connect your GitHub repository**
6. **Set environment variables**

### Option B: Render

1. **Go to [Render](https://render.com)**
2. **Create new Web Service**
3. **Connect your GitHub repository**
4. **Set environment variables**

### Option C: Heroku

1. **Go to [Heroku](https://heroku.com)**
2. **Create new app**
3. **Connect your GitHub repository**
4. **Add PostgreSQL addon**
5. **Set environment variables**

## 🔧 Backend Environment Variables

Set these in your backend hosting service:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.vercel.app

# Database (use your hosting service's database URL)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Resend
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

## 🗄️ Database Setup

### Production Database

1. **Create a new PostgreSQL database**
2. **Run the schema:**
   ```bash
   psql $DATABASE_URL -f backend/config/database.sql
   ```

### Database Migration (Alternative)

```bash
# If you have database migrations set up
npm run migrate:up
```

## 🔄 Update Frontend API URL

After deploying the backend, update your frontend environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 🚀 Deploy Commands

### Frontend (Vercel)
```bash
# Vercel automatically deploys on git push
git add .
git commit -m "Update API URL for production"
git push origin main
```

### Backend (Manual)
```bash
# If using Railway/Render, they auto-deploy
# If using Heroku:
git push heroku main
```

## 📱 Post-Deployment

### 1. Test Your Application
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connection works
- [ ] Authentication functions
- [ ] Apartment listings display
- [ ] Search and filters work

### 2. Set Up Custom Domain (Optional)
- **Frontend**: Configure in Vercel dashboard
- **Backend**: Configure in your hosting service

### 3. Set Up SSL
- **Vercel**: Automatic SSL
- **Backend**: Configure in your hosting service

## 🔍 Troubleshooting

### Common Issues

#### Frontend Build Fails
```bash
# Check build logs in Vercel
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

#### Backend Connection Issues
```bash
# Check:
# - Database connection string
# - Environment variables
# - Port configuration
# - CORS settings
```

#### API Calls Fail
```bash
# Verify:
# - NEXT_PUBLIC_API_URL is correct
# - Backend is running
# - CORS is configured
# - Routes are working
```

## 📊 Monitoring

### Vercel Analytics
- **Performance**: Built-in analytics
- **Errors**: Error tracking
- **Real-time**: Live user monitoring

### Backend Monitoring
- **Logs**: Check hosting service logs
- **Health**: `/health` endpoint
- **Performance**: Response time monitoring

## 🔒 Security Checklist

- [ ] Environment variables are set
- [ ] Database is secure
- [ ] CORS is configured
- [ ] Rate limiting is enabled
- [ ] SSL is enabled
- [ ] JWT secrets are secure

## 🎉 Success!

Your UniNest application is now deployed and accessible worldwide!

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend-url.com
- **Health Check**: https://your-backend-url.com/health

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Hosting](https://www.postgresql.org/support/professional_hosting/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

---

**Need Help?** Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) file or create an issue in your repository.
