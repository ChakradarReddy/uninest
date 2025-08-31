'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface RegisterFormProps {
  onSuccess: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
}

export default function RegisterForm({ onSuccess, onModeChange }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    user_type: 'student' as 'student' | 'owner',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        user_type: formData.user_type,
      });
      
      if (success) {
        toast.success('Registration successful!');
        onSuccess();
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="input-field w-full"
            placeholder="First name"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="input-field w-full"
            placeholder="Last name"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input-field w-full"
          placeholder="Enter your email"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="input-field w-full"
          placeholder="Enter your phone number"
        />
      </div>

      {/* User Type */}
      <div>
        <label htmlFor="user_type" className="block text-sm font-medium text-gray-300 mb-2">
          I am a
        </label>
        <select
          id="user_type"
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
          className="input-field w-full"
        >
          <option value="student">Student (Looking for apartments)</option>
          <option value="owner">Property Owner (Listing apartments)</option>
        </select>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="input-field w-full"
          placeholder="Create a password"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="input-field w-full"
          placeholder="Confirm your password"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-3"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="spinner mr-2"></div>
            Creating Account...
          </div>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Mode Switch */}
      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors duration-200"
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* Terms */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <button type="button" className="text-primary-500 hover:text-primary-400">
            Terms of Service
          </button>{' '}
          and{' '}
          <button type="button" className="text-primary-500 hover:text-primary-400">
            Privacy Policy
          </button>
        </p>
      </div>
    </form>
  );
}
