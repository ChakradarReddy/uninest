'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  HeartIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ApartmentCard from '@/components/apartments/ApartmentCard';
import SearchFilters from '@/components/search/SearchFilters';
import { Apartment } from '@/types/apartment';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchFeaturedApartments();
  }, []);

  const fetchFeaturedApartments = async () => {
    try {
      const response = await fetch('/api/apartments?limit=6');
      const data = await response.json();
      setApartments(data.apartments || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, city: string) => {
    setSearchQuery(query);
    setSelectedCity(city);
    // Navigate to search results page
    window.location.href = `/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`;
  };

  const features = [
    {
      icon: HomeIcon,
      title: 'Premium Listings',
      description: 'Curated selection of high-quality student apartments with verified photos and details.'
    },
    {
      icon: HeartIcon,
      title: 'Smart Wishlist',
      description: 'Save your favorite apartments and get notified about price drops and availability.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: 'Safe deposit payments with Stripe integration and booking confirmations.'
    },
    {
      icon: StarIcon,
      title: 'Verified Owners',
      description: 'All property owners are verified and listings are moderated for quality.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Apartments' },
    { number: '50+', label: 'Cities' },
    { number: '1000+', label: 'Students' },
    { number: '99%', label: 'Satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-secondary-500/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find Your Perfect
            <span className="block gradient-text">Student Nest</span>
            <span className="block text-light">Stress-Free</span>
          </motion.h1>
          
          <motion.p
            className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover and book student apartments with ease. Browse listings, save favorites, 
            and secure your perfect accommodation with secure deposit payments.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="btn-primary text-lg px-8 py-4">
              Browse Apartments
            </button>
            <button className="btn-outline text-lg px-8 py-4">
              List Your Property
            </button>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="section-padding bg-dark-900">
        <div className="container-max">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Find Your Perfect Match
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Search by location, budget, and preferences to find apartments that fit your needs
            </p>
          </motion.div>
          
          <SearchFilters onSearch={handleSearch} />
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-dark-950">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Why Choose UniNest?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We've built the platform students actually want to use
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500/30 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Apartments */}
      <section className="section-padding bg-dark-950">
        <div className="container-max">
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                Featured Apartments
              </h2>
              <p className="text-gray-400 text-lg">
                Handpicked properties for students
              </p>
            </div>
            <button className="btn-outline mt-4 sm:mt-0 group">
              View All
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="w-full h-48 bg-dark-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-dark-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-dark-800 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-dark-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {apartments.map((apartment, index) => (
                <motion.div
                  key={apartment.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ApartmentCard apartment={apartment} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
              Ready to Find Your Perfect Nest?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students who have found their ideal accommodation through UniNest
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105">
                Get Started Today
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
