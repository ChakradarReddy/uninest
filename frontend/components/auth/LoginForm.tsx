'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSuccess: () => void;
  onModeChange: (mode: 'login' | 'register') => void;
}

export default function LoginForm({ onSuccess, onModeChange }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(formData);
      if (success) {
        toast.success('Login successful!');
        onSuccess();
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Enter your password"
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
            Signing In...
          </div>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Mode Switch */}
      <div className="text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onModeChange('register')}
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors duration-200"
          >
            Sign up here
          </button>
        </p>
      </div>

      {/* Forgot Password */}
      <div className="text-center">
        <button
          type="button"
          className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
        >
          Forgot your password?
        </button>
      </div>
    </form>
  );
}
