# UniNest Backend API

A robust Node.js backend for the UniNest student apartment marketplace platform.

## Features

- **User Management**: Student, Owner, and Admin roles with JWT authentication
- **Apartment Listings**: CRUD operations with image support and search filters
- **Wishlist System**: Save and manage favorite apartments
- **Booking System**: Deposit-based booking with payment integration
- **Payment Processing**: Stripe integration for secure transactions
- **Admin Dashboard**: Comprehensive moderation and analytics tools
- **Real-time Updates**: WebSocket support for live notifications

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with bcrypt
- **Payments**: Stripe API
- **File Upload**: Cloudinary
- **Email**: Resend
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Stripe account
- Cloudinary account
- Resend account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uninest/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb uninest
   
   # Run database migrations
   psql -d uninest -f config/database.sql
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DB_USER` | PostgreSQL username | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `DB_NAME` | Database name | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Apartments
- `GET /api/apartments` - List apartments with filters
- `GET /api/apartments/:id` - Get apartment details
- `POST /api/apartments` - Create new apartment (owners only)
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
- `PUT /api/admin/apartments/:id/moderate` - Moderate apartment

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `apartments` - Property listings
- `apartment_images` - Property images
- `wishlist` - User saved apartments
- `bookings` - Apartment reservations
- `payments` - Payment records
- `admin_logs` - Administrative actions

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Migrations
```bash
# Create new migration
npm run migrate:create

# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

## Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Environment Setup
- Set production environment variables
- Configure database connection
- Set up Stripe webhooks
- Configure CORS origins

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.
