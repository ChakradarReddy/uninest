# UniNest - Student Apartment Marketplace

> Find your perfect student nest, stress-free.

UniNest is a Casita-inspired student apartment marketplace platform that connects students with property owners for secure, deposit-based apartment bookings.

## 🚀 Features

### For Students
- **Browse Apartments**: High-quality photos, detailed descriptions, and location data
- **Smart Search**: Advanced filters by price, location, amenities, and availability
- **Wishlist System**: Save favorites and get notified about price drops
- **Secure Booking**: Deposit-based booking with Stripe payment integration
- **Booking Management**: Track your reservations and payment history

### For Property Owners
- **List Apartments**: Easy-to-use listing creation with photo uploads
- **Manage Bookings**: Handle inquiries and confirm reservations
- **Secure Payouts**: Automated payment processing and disbursements
- **Analytics Dashboard**: Track performance and earnings

### For Administrators
- **Moderation Tools**: Review and approve apartment listings
- **User Management**: Monitor user activity and resolve disputes
- **Financial Oversight**: Handle refunds, chargebacks, and disputes
- **Analytics**: Comprehensive platform insights and reporting

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with bcrypt
- **Payments**: Stripe API
- **File Upload**: Cloudinary
- **Email**: Resend
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Maps**: React Map GL (Mapbox)

## 🎨 Design System

- **Theme**: Dark mode with vibrant accents
- **Primary Color**: Vibrant Green (#3DDC97)
- **Secondary Color**: Electric Blue (#4A90E2)
- **Background**: Black (#000000) & Dark Grey (#1C1C1C)
- **Typography**: Poppins (headings) + Inter (body)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Stripe account
- Cloudinary account
- Resend account
- Mapbox account (for maps)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd uninest
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your credentials
# Set up database, Stripe, Cloudinary, and Resend keys

# Create PostgreSQL database
createdb uninest

# Run database migrations
psql -d uninest -f config/database.sql

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# Set API URL, Mapbox token, and Stripe key

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🔧 Environment Configuration

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=uninest
DB_PASSWORD=your_password
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@uninest.com
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **apartments**: Property listings
- **apartment_images**: Property images
- **wishlist**: User saved apartments
- **bookings**: Apartment reservations
- **payments**: Payment records
- **admin_logs**: Administrative actions

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Apartments
- `GET /api/apartments` - List apartments with filters
- `GET /api/apartments/:id` - Get apartment details
- `POST /api/apartments` - Create new apartment
- `PUT /api/apartments/:id` - Update apartment
- `DELETE /api/apartments/:id` - Delete apartment

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add apartment to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Payment history

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - User management
- `GET /api/admin/apartments` - Apartment moderation

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Backend
```bash
cd backend
npm i -g vercel
vercel --prod
```

#### Frontend
```bash
cd frontend
npm i -g vercel
vercel --prod
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. Set production environment variables
2. Build frontend: `npm run build`
3. Start backend: `npm start`
4. Configure reverse proxy (nginx/Apache)
5. Set up SSL certificates

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 Monitoring & Analytics

- **Health Checks**: `/api/health` endpoint
- **Logging**: Structured logging with Morgan
- **Error Tracking**: Comprehensive error handling
- **Performance**: Response time monitoring
- **Security**: Rate limiting and CORS protection

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and CORS protection
- Helmet security headers
- Input validation and sanitization
- Secure payment processing with Stripe

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use consistent code formatting (Prettier)
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub Discussions for questions
- **Email**: hello@uninest.com

## 🙏 Acknowledgments

- **Casita**: Inspiration for the platform concept
- **Stripe**: Payment processing infrastructure
- **Next.js**: Frontend framework
- **Express.js**: Backend framework
- **Tailwind CSS**: Styling framework

## 📈 Roadmap

### Phase 1 (Current)
- ✅ User authentication and profiles
- ✅ Apartment listings and search
- ✅ Wishlist functionality
- ✅ Basic booking system

### Phase 2 (Next)
- 🔄 Advanced search filters
- 🔄 Map-based apartment search
- 🔄 Real-time notifications
- 🔄 Mobile app development

### Phase 3 (Future)
- 📋 AI-powered recommendations
- 📋 Virtual apartment tours
- 📋 Social features and reviews
- 📋 International expansion

---

**Built with ❤️ for students worldwide**

For more information, visit [uninest.com](https://uninest.com)
