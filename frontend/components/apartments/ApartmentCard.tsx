'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Apartment } from '@/types/apartment';
import { useAuth } from '@/hooks/useAuth';

interface ApartmentCardProps {
  apartment: Apartment;
}

export default function ApartmentCard({ apartment }: ApartmentCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show auth modal
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await fetch(`/api/wishlist/${apartment.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ apartment_id: apartment.id }),
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = () => {
    if (apartment.images && apartment.images.length > 0) {
      return apartment.images[0];
    }
    return '/placeholder-apartment.jpg';
  };

  return (
    <motion.div
      className="card-hover group cursor-pointer"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/apartments/${apartment.id}`}>
        {/* Image Container */}
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
          <Image
            src={getImageUrl()}
            alt={apartment.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleWishlistToggle();
            }}
            className="absolute top-3 right-3 p-2 bg-dark-900/80 backdrop-blur-sm rounded-full hover:bg-dark-800 transition-all duration-200 group/wishlist"
          >
            {isWishlisted ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-white group-hover/wishlist:text-red-500 transition-colors duration-200" />
            )}
          </button>

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {formatPrice(apartment.monthly_rent)}/mo
          </div>

          {/* Availability Badge */}
          {!apartment.is_available && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Rented
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Title and Location */}
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">
              {apartment.title}
            </h3>
            <div className="flex items-center space-x-1 text-gray-400 mt-1">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-sm">{apartment.city}, {apartment.state}</span>
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <HomeIcon className="w-4 h-4" />
                <span>{apartment.bedrooms} bed</span>
              </div>
              <div className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>{apartment.bathrooms} bath</span>
              </div>
            </div>
            {apartment.square_feet && (
              <span>{apartment.square_feet} sq ft</span>
            )}
          </div>

          {/* Owner Info */}
          <div className="flex items-center space-x-2 pt-2 border-t border-dark-700">
            <div className="w-6 h-6 bg-primary-500/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-3 h-3 text-primary-500" />
            </div>
            <span className="text-sm text-gray-400">
              {apartment.owner_first_name} {apartment.owner_last_name}
            </span>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Available from {new Date(apartment.available_from).toLocaleDateString()}</span>
            <span>{apartment.min_contract_months} mo min</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
