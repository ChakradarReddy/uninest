# UniNest Frontend

A modern, responsive Next.js frontend for the UniNest student apartment marketplace platform.

## Features

- **Modern Design**: Dark theme with vibrant accents and smooth animations
- **Responsive Layout**: Mobile-first design that works on all devices
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Smooth animations and micro-interactions
- **Authentication**: JWT-based auth with protected routes
- **Search & Filters**: Advanced apartment search with multiple filters
- **Wishlist System**: Save and manage favorite apartments
- **Responsive Components**: Reusable UI components with consistent design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Maps**: React Map GL (Mapbox)

## Design System

### Colors
- **Primary**: Vibrant Green (#3DDC97)
- **Secondary**: Electric Blue (#4A90E2)
- **Background**: Black (#000000) & Dark Grey (#1C1C1C)
- **Text**: White (#FFFFFF) & Light Grey (#E0E0E0)
- **Accents**: Gray (#AAAAAA)

### Typography
- **Display Font**: Poppins (headings)
- **Body Font**: Inter (body text)

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Cards**: Hover effects with smooth transitions
- **Inputs**: Custom styled form inputs
- **Modals**: Animated authentication modals

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uninest/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── apartments/        # Apartment-related components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   └── search/           # Search components
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Component Library

### Layout Components

- **Header**: Navigation, authentication, mobile menu
- **Footer**: Links, social media, company info
- **AuthProvider**: Authentication context
- **ThemeProvider**: Theme management

### Apartment Components

- **ApartmentCard**: Individual apartment display
- **ApartmentGrid**: Grid layout for listings
- **ApartmentDetail**: Detailed apartment view
- **ApartmentForm**: Create/edit apartment form

### Authentication Components

- **AuthModal**: Login/register modal
- **UserMenu**: User profile dropdown
- **LoginForm**: Login form
- **RegisterForm**: Registration form

### Search Components

- **SearchFilters**: Advanced search filters
- **SearchResults**: Search results display
- **MapView**: Map-based apartment search

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Development Guidelines

### Code Style

- Use TypeScript for all components
- Follow ESLint and Prettier configuration
- Use Tailwind CSS classes for styling
- Implement responsive design patterns

### Component Structure

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  // Define props interface
}

export default function ComponentName({ prop }: ComponentProps) {
  // Component logic
  
  return (
    // JSX with Tailwind classes
  );
}
```

### State Management

- Use Zustand for global state
- Use React hooks for local state
- Implement proper error handling
- Use loading states for async operations

### Styling

- Use Tailwind CSS utility classes
- Follow the design system color palette
- Implement hover and focus states
- Use consistent spacing and typography

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard

### Other Platforms

- **Netlify**: Use `npm run build` and deploy `out` directory
- **AWS Amplify**: Connect GitHub repository
- **Docker**: Use provided Dockerfile

## Performance Optimization

- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Automatic with Next.js
- **Lazy Loading**: Implement for heavy components
- **Bundle Analysis**: Use `@next/bundle-analyzer`

## Testing

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Component Tests**: Storybook

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

- **Build Errors**: Check TypeScript types and dependencies
- **Styling Issues**: Verify Tailwind CSS configuration
- **API Errors**: Check backend connectivity and environment variables

### Getting Help

- Check existing issues
- Review component documentation
- Contact the development team

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
