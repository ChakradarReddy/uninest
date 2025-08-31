# 🚀 UniNest Render Deployment Guide

This guide will help you deploy UniNest to Render for both frontend and backend with public domains.

## 🎯 **Render Deployment Strategy**

We'll deploy everything to Render:
1. **PostgreSQL Database** → Database Service
2. **Backend API** → Web Service  
3. **Frontend App** → Static Site

## 🗄️ **Step 1: Create PostgreSQL Database**

1. **Go to [Render](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New +" → "PostgreSQL"**
4. **Configure:**
   - **Name**: `uninest-database`
   - **Database**: `uninest`
   - **User**: `uninest_user`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 14 (recommended)
5. **Click "Create Database"**
6. **Save the connection details** (you'll need them for the backend)

## 🖥️ **Step 2: Deploy Backend API**

1. **Click "New +" → "Web Service"**
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Name**: `uninest-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you prefer)

4. **Set Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://your-frontend-service-name.onrender.com
   
   # Database (Render will provide this automatically)
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

5. **Click "Create Web Service"**

## 📱 **Step 3: Deploy Frontend Static Site**

1. **Click "New +" → "Static Site"**
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Name**: `uninest-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.next`
   - **Plan**: Free

4. **Set Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-service-name.onrender.com
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
   ```

5. **Click "Create Static Site"**

## 🔗 **Step 4: Link Services**

1. **Go to your Backend service**
2. **Click "Environment"**
3. **Add environment variable:**
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-frontend-service-name.onrender.com`

4. **Go to your Frontend service**
5. **Click "Environment"**
6. **Update environment variable:**
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-service-name.onrender.com`

## 🗄️ **Step 5: Set Up Database Schema**

1. **Get your database connection string** from the PostgreSQL service
2. **Run the schema:**
   ```bash
   # Install psql if you don't have it
   # macOS: brew install postgresql@14
   
   # Run schema (replace with your actual DATABASE_URL)
   psql "postgresql://username:password@host:port/database" -f backend/config/database.sql
   ```

## 🔍 **Step 6: Test Your Deployment**

### **Backend Health Check:**
- **URL**: `https://your-backend-service-name.onrender.com/health`
- **Expected**: `{"status":"ok","timestamp":"..."}`

### **Frontend Test:**
- **URL**: `https://your-frontend-service-name.onrender.com`
- **Check**: Page loads, no console errors
- **Test**: Try to register/login (should connect to backend)

## 🌐 **Your Public URLs**

After deployment, you'll have:

- **Frontend**: `https://your-frontend-service-name.onrender.com`
- **Backend**: `https://your-backend-service-name.onrender.com`
- **Database**: Managed by Render
- **Health Check**: `https://your-backend-service-name.onrender.com/health`

## 🔧 **Environment Variables Summary**

### **Backend (.env):**
```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-service-name.onrender.com
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_super_secret_jwt_key_here
```

### **Frontend (Render Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-service-name.onrender.com
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

## 🚨 **Common Issues & Solutions**

### **Backend Won't Start:**
- Check environment variables
- Verify database connection
- Check build logs in Render dashboard

### **Frontend Can't Connect to Backend:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### **Database Connection Failed:**
- Verify `DATABASE_URL` is correct
- Check if database is accessible
- Ensure schema is loaded

### **Frontend Build Fails:**
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs in Render dashboard

## 📊 **Post-Deployment Checklist**

- [ ] Database is accessible
- [ ] Backend responds to `/health` endpoint
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Apartment listings display
- [ ] Search and filters work
- [ ] Wishlist functionality works

## 🔒 **Security Notes**

- **Never commit `.env` files** to Git
- **Use strong JWT secrets** (32+ characters)
- **Enable HTTPS** (automatic with Render)
- **Set up proper CORS** in backend
- **Use environment variables** in Render dashboard

## 🎉 **Success!**

Your UniNest application is now deployed on Render with:
- ✅ **Public domains** accessible worldwide
- ✅ **Automatic HTTPS** and SSL
- ✅ **Auto-scaling** based on traffic
- ✅ **Integrated database** management
- ✅ **GitHub auto-deploy** on every push

## 📚 **Next Steps**

1. **Test your deployment**
2. **Set up custom domain** (optional)
3. **Configure monitoring** and alerts
4. **Set up CI/CD** for automatic deployments

---

**Need Help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or create an issue in your repository.
