'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  HomeIcon,
  UserIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface SearchFiltersProps {
  onSearch: (query: string, city: string) => void;
}

const cities = [
  'San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Boston',
  'Austin', 'Seattle', 'Denver', 'Miami', 'Portland'
];

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRent: '',
    maxRent: '',
    bedrooms: '',
    bathrooms: '',
    availableFrom: '',
  });

  const handleSearch = () => {
    onSearch(searchQuery, selectedCity);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minRent: '',
      maxRent: '',
      bedrooms: '',
      bathrooms: '',
      availableFrom: '',
    });
    setSearchQuery('');
    setSelectedCity('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search apartments, neighborhoods, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-dark-900 border border-dark-600 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* City Selector */}
          <div className="relative">
            <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-12 pr-8 py-4 bg-dark-900 border border-dark-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer min-w-[200px]"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="btn-primary px-8 py-4 whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Advanced Filters</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                showAdvancedFilters ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {(searchQuery || selectedCity || Object.values(filters).some(v => v)) && (
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-dark-800 rounded-2xl p-6 border border-dark-700 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-2" />
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRent}
                    onChange={(e) => handleFilterChange('minRent', e.target.value)}
                    className="flex-1 input-field text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRent}
                    onChange={(e) => handleFilterChange('maxRent', e.target.value)}
                    className="flex-1 input-field text-sm"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <HomeIcon className="w-4 h-4 inline mr-2" />
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="input-field text-sm w-full"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="input-field text-sm w-full"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Available From */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  value={filters.availableFrom}
                  onChange={(e) => handleFilterChange('availableFrom', e.target.value)}
                  className="input-field text-sm w-full"
                />
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSearch}
                className="btn-secondary px-6 py-2"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Filters */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {['Studio', '1 Bedroom', '2 Bedroom', '3+ Bedroom', 'Pet Friendly', 'Furnished'].map((filter) => (
          <button
            key={filter}
            className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 hover:border-primary-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
