'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardBody } from '../../components/ui/Card';
import { Mail, Lock, User, Phone, Building, Plane, Eye, EyeOff } from 'lucide-react';
import { DEPARTMENTS, DESIGNATIONS } from '../../lib/constants';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    designation: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { confirmPassword, ...registerData } = formData;
    await register(registerData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const departmentOptions = DEPARTMENTS.map(dept => ({
    value: dept.id,
    label: dept.name,
  }));

  const designationOptions = DESIGNATIONS.map(desig => ({
    value: desig.id,
    label: desig.name,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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

        {/* Signup Card */}
        <Card className="shadow-2xl">
          <CardBody className="p-6 lg:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Register as a new employee
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  leftIcon={<User className="w-5 h-5" />}
                  fullWidth
                  required
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  leftIcon={<User className="w-5 h-5" />}
                  fullWidth
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  leftIcon={<Mail className="w-5 h-5" />}
                  fullWidth
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  leftIcon={<Phone className="w-5 h-5" />}
                  fullWidth
                  required
                />
              </div>

              <Input
                label="Employee ID"
                name="employeeId"
                placeholder="Enter your employee ID"
                value={formData.employeeId}
                onChange={handleChange}
                error={errors.employeeId}
                leftIcon={<Building className="w-5 h-5" />}
                fullWidth
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Department"
                  name="department"
                  placeholder="Select department"
                  value={formData.department}
                  onChange={handleChange}
                  error={errors.department}
                  options={departmentOptions}
                  fullWidth
                  required
                />

                <Select
                  label="Designation"
                  name="designation"
                  placeholder="Select designation"
                  value={formData.designation}
                  onChange={handleChange}
                  error={errors.designation}
                  options={designationOptions}
                  fullWidth
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  fullWidth
                  required
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-5 h-5" />}
                  fullWidth
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
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
