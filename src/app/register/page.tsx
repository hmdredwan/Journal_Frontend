// src/app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/utils/api';
import {
  User, Mail, Lock, Phone, Home, MapPin, Globe, Briefcase,
  Book, FileText, Camera, CheckCircle, AlertCircle, Upload
} from 'lucide-react';

interface FormDataType {
  title: string;
  full_name: string;
  email: string;
  mobile_number: string;
  address: string;
  city: string;
  country: string;
  designation: string;
  department: string;
  orcid_id: string;
  google_scholar_url: string;
  role: string;
  password: string;
  password2: string;
  cv: File | null;
  profile_photo: File | null;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    full_name: '',
    email: '',
    mobile_number: '',
    address: '',
    city: '',
    country: '',
    designation: '',
    department: '',
    orcid_id: '',
    google_scholar_url: '',
    role: '',
    password: '',
    password2: '',
    cv: null,
    profile_photo: null,
  });

  const [authorRoleId, setAuthorRoleId] = useState<string | number>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cvFileName, setCvFileName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const router = useRouter();

  // Fetch author role ID (public endpoint)
  useEffect(() => {
    const fetchAuthorRole = async () => {
      try {
        const res = await fetch(apiUrl('roles/public/'));
        if (!res.ok) throw new Error('Failed to load roles');
        const data = await res.json();
        const authorRole = data.find((r: any) => r.name.toLowerCase() === 'author');
        if (authorRole) {
          setAuthorRoleId(authorRole.id);
          setFormData(prev => ({ ...prev, role: authorRole.id.toString() }));
        } else {
          setGeneralError('Author role not found. Please contact support.');
        }
      } catch (err) {
        setGeneralError('Failed to load role information. Please try again.');
        console.error(err);
      }
    };

    fetchAuthorRole();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;

    if (files?.length) {
      const file = files[0];
      if (name === 'cv') {
        setCvFileName(file.name);
        setFormData(prev => ({ ...prev, cv: file }));
      } else if (name === 'profile_photo') {
        setFormData(prev => ({ ...prev, profile_photo: file }));
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error on change
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');
    setSuccess('');

    // Client-side validation
    if (formData.password !== formData.password2) {
      setFieldErrors({ password2: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    const form = new FormData();

    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== '' && typeof value !== 'object') {
        form.append(key, value.toString().trim());
      }
    });

    // Append files only if selected
    if (formData.cv) form.append('cv', formData.cv);
    if (formData.profile_photo) form.append('profile_photo', formData.profile_photo);

    try {
      const res = await fetch(apiUrl('register/'), {
        method: 'POST',
        body: form,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        const newErrors: { [key: string]: string } = {};

        // Parse DRF-style errors
        Object.entries(result).forEach(([key, val]) => {
          if (Array.isArray(val)) newErrors[key] = val[0];
          else if (typeof val === 'string') newErrors[key] = val;
        });

        if (Object.keys(newErrors).length === 0) {
          newErrors.general = result.detail || result.error || 'Registration failed';
        }

        setFieldErrors(newErrors);
        throw new Error(newErrors.general || 'Validation failed');
      }

      // Success - auto-login
      setSuccess('Registration successful! Logging you in...');

      const loginRes = await fetch(apiUrl('login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem('access_token', loginData.access);
        localStorage.setItem('refresh_token', loginData.refresh);
        localStorage.setItem('user_role', loginData.user?.role?.toLowerCase() || 'author');

        const role = loginData.user?.role?.toLowerCase();

        // Role-based redirect
        if (role?.includes('admin')) {
          router.push('/dashboard');
        } else if (role === 'author') {
          router.push('/author-dashboard');
        } else if (role?.includes('editor')) {
          router.push('/editor-dashboard');
        } else if (role === 'reviewer') {
          router.push('/reviewer-dashboard');
        } else {
          router.push('/user-dashboard');
        }
      } else {
        setGeneralError('Registration succeeded, but auto-login failed. Please log in manually.');
        router.push('/login');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred during registration.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-2xl transform hover:scale-[1.01] transition-transform duration-300 overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join the Technical Journal community</p>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {generalError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title (e.g. Dr., Prof.)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.title && <p className="text-red-600 text-sm mt-1">{fieldErrors.title}</p>}
          </div>

          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Full Name *"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.full_name && <p className="text-red-600 text-sm mt-1">{fieldErrors.full_name}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address *"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.email && <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Mobile Number */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              placeholder="Mobile Number (e.g. +8801712345678)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.mobile_number && <p className="text-red-600 text-sm mt-1">{fieldErrors.mobile_number}</p>}
          </div>

          {/* Address */}
          <div className="relative">
            <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.address && <p className="text-red-600 text-sm mt-1">{fieldErrors.address}</p>}
          </div>

          {/* City */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.city && <p className="text-red-600 text-sm mt-1">{fieldErrors.city}</p>}
          </div>

          {/* Country */}
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.country && <p className="text-red-600 text-sm mt-1">{fieldErrors.country}</p>}
          </div>

          {/* Designation */}
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Designation (e.g. Professor)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.designation && <p className="text-red-600 text-sm mt-1">{fieldErrors.designation}</p>}
          </div>

          {/* Department */}
          <div className="relative">
            <Book className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Department"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.department && <p className="text-red-600 text-sm mt-1">{fieldErrors.department}</p>}
          </div>

          {/* ORCID iD (optional) */}
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="orcid_id"
              value={formData.orcid_id}
              onChange={handleChange}
              placeholder="ORCID iD (optional)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.orcid_id && <p className="text-red-600 text-sm mt-1">{fieldErrors.orcid_id}</p>}
          </div>

          {/* Google Scholar URL (optional) */}
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="url"
              name="google_scholar_url"
              value={formData.google_scholar_url}
              onChange={handleChange}
              placeholder="Google Scholar Profile URL (optional)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.google_scholar_url && <p className="text-red-600 text-sm mt-1">{fieldErrors.google_scholar_url}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Password (min 8 characters)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.password && <p className="text-red-600 text-sm mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              placeholder="Confirm Password"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            {fieldErrors.password2 && <p className="text-red-600 text-sm mt-1">{fieldErrors.password2}</p>}
          </div>

          {/* CV Upload */}
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <label className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
              <span className="text-gray-600">
                {cvFileName || 'Upload CV (optional, PDF/Word)'}
              </span>
              <Upload size={18} className="text-gray-500" />
              <input
                type="file"
                name="cv"
                onChange={handleChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </label>
            {fieldErrors.cv && <p className="text-red-600 text-sm mt-1">{fieldErrors.cv}</p>}
          </div>

          {/* Profile Photo */}
          <div className="relative">
            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <label className="w-full flex flex-col sm:flex-row items-center gap-4 px-4 py-3 border border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex-shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No photo</div>
                )}
              </div>
              <div className="flex-1">
                <span className="block text-gray-600">Upload Profile Photo (optional)</span>
                <span className="text-xs text-gray-500">JPG/PNG, max 5MB</span>
              </div>
              <input
                type="file"
                name="profile_photo"
                onChange={handleChange}
                accept="image/*"
                className="hidden"
              />
            </label>
            {fieldErrors.profile_photo && <p className="text-red-600 text-sm mt-1">{fieldErrors.profile_photo}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <User size={20} />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}