'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody } from '../../components/ui/Card';
import { Mail, ArrowLeft, Plane, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading } = useAuth();

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    const result = await forgotPassword(email);
    if (result.success) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Plane className="w-8 h-8 text-primary-700" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            AAI Attendance Portal
          </h1>
          <p className="text-primary-200">
            Airport Authority of India
          </p>
        </div>

        {/* Forgot Password Card */}
        <Card className="shadow-2xl">
          <CardBody className="p-6 lg:p-8">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter your email and we&apos;ll send you reset instructions
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    error={error}
                    leftIcon={<Mail className="w-5 h-5" />}
                    fullWidth
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  We&apos;ve sent password reset instructions to{' '}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
                <Link href="/login">
                  <Button variant="outline" fullWidth>
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}

            {!isSubmitted && (
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        <p className="text-center text-primary-200 text-sm mt-8">
          © 2024 Airport Authority of India. All rights reserved.
        </p>
      </div>
    </div>
  );
}
