# 🌐 UniNest Production Deployment Guide

This guide will help you deploy UniNest to production with public domains.

## 🎯 **Deployment Order (Important!)**

1. **Backend First** → Get public backend URL
2. **Frontend Second** → Use public backend URL
3. **Test Everything** → Ensure both work together

## 🚀 **Step 1: Deploy Backend (Get Public URL)**

### **Option A: Railway (Recommended - Free & Easy)**

1. **Go to [Railway](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project**
4. **Add PostgreSQL service:**
   - Click "New Service" → "Database" → "PostgreSQL"
   - Wait for it to provision
5. **Add Node.js service:**
   - Click "New Service" → "GitHub Repo"
   - Select your `uninest` repository
   - Set **Root Directory** to `backend`
   - Set **Build Command** to `npm install`
   - Set **Start Command** to `npm start`
6. **Set environment variables** (see below)

### **Option B: Render (Free Tier Available)**

1. **Go to [Render](https://render.com)**
2. **Sign up with GitHub**
3. **Create new Web Service**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Name**: `uninest-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. **Set environment variables**

## 🔧 **Backend Environment Variables**

Set these in your backend hosting service:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app

# Database (Railway/Render will provide this automatically)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Stripe (if you want payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Resend (for emails)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

## 📱 **Step 2: Update Frontend with Backend URL**

After backend deployment, you'll get a URL like:
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://your-app.onrender.com`

### **Update Frontend Environment:**

1. **Copy production config:**
   ```bash
   cd frontend
   cp env.production.example .env.local
   ```

2. **Edit .env.local:**
   ```env
   # Update this with your actual backend URL
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   
   # Optional - for maps
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   
   # Optional - for payments
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   ```

## 🚀 **Step 3: Deploy Frontend to Vercel**

1. **Push updated code to GitHub:**
   ```bash
   git add .
   git commit -m "Update frontend for production backend"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - **Important Configuration:**
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend` ⚠️
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
     - **Install Command**: `npm install`

3. **Set environment variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add the same variables from your `.env.local`

## 🗄️ **Database Setup**

### **Production Database:**
1. **Railway/Render** will create the database automatically
2. **Run the schema:**
   ```bash
   # Get your database URL from Railway/Render dashboard
   psql $DATABASE_URL -f backend/config/database.sql
   ```

## 🔍 **Testing Your Deployment**

### **Backend Health Check:**
- **URL**: `https://your-backend-url.com/health`
- **Expected**: `{"status":"ok","timestamp":"..."}`

### **Frontend Test:**
- **URL**: `https://your-app.vercel.app`
- **Check**: Page loads, no console errors
- **Test**: Try to register/login (should connect to backend)

## 🚨 **Common Issues & Solutions**

### **Backend Won't Start:**
- Check environment variables
- Verify database connection
- Check build logs

### **Frontend Can't Connect to Backend:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### **Database Connection Failed:**
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Ensure schema is loaded

## 📊 **Post-Deployment Checklist**

- [ ] Backend responds to `/health` endpoint
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Apartment listings display
- [ ] Search and filters work
- [ ] Wishlist functionality works

## 🌐 **Your Public URLs**

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Health Check**: `https://your-backend.railway.app/health`

## 🔒 **Security Notes**

- **Never commit `.env` files** to Git
- **Use strong JWT secrets** (32+ characters)
- **Enable HTTPS** (automatic with Vercel/Railway/Render)
- **Set up proper CORS** in backend

## 📚 **Next Steps**

1. **Deploy backend** to Railway/Render
2. **Get public backend URL**
3. **Update frontend environment**
4. **Deploy frontend** to Vercel
5. **Test everything works**
6. **Set up custom domain** (optional)

---

**Need Help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or create an issue in your repository.
