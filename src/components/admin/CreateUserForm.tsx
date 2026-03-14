// src/components/admin/CreateUserForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiUrl } from '@/utils/api';
import { User, Mail, Lock, Phone, Home, MapPin, Globe, Briefcase, Book, FileText, Camera } from 'lucide-react';

// Define the shape of formData
interface CreateUserFormData {
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
  [key: string]: string | File | null; // ← index signature to allow dynamic key access
}

export default function CreateUserForm() {
  const [formData, setFormData] = useState<CreateUserFormData>({
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

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(apiUrl('roles/'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load roles');
        const data = await res.json();
        setRoles(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, role: data[0].id.toString() }));
        }
      } catch (err) {
        setFieldErrors({ general: 'Failed to load available roles' });
      }
    };

    if (token) fetchRoles();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setFieldErrors({});
  setSuccess(false);

  if (formData.password !== formData.password2) {
    setFieldErrors({ password2: 'Passwords do not match' });
    setLoading(false);
    return;
  }

  const data = new FormData();

  // Safely append all fields
  (Object.keys(formData) as Array<keyof CreateUserFormData>).forEach((key) => {
    const value = formData[key];

    if (value === null || value === '') return;

    if (value instanceof File) {
      data.append(key as string, value); // ← assertion here
    } else {
      data.append(key as string, value.toString().trim()); // ← assertion here
    }
  });

  try {
    const res = await fetch(apiUrl('users/create/'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const newErrors: { [key: string]: string } = {};

      for (const [key, value] of Object.entries(errData)) {
        if (Array.isArray(value)) newErrors[key] = value[0];
        else if (typeof value === 'string') newErrors[key] = value;
      }

      if (Object.keys(newErrors).length === 0) {
        newErrors.general = 'Failed to create user - check your input';
      }

      setFieldErrors(newErrors);
      throw new Error(newErrors.general || 'Creation failed');
    }

    setSuccess(true);
    // Reset form
    setFormData({
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
      role: roles.length > 0 ? roles[0].id.toString() : '',
      password: '',
      password2: '',
      cv: null,
      profile_photo: null,
    });
    setTimeout(() => setSuccess(false), 5000);
  } catch (err: any) {
    setFieldErrors({ general: err.message || 'An error occurred' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create New User (Admin)</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center font-medium">
          User created successfully!
        </div>
      )}

      {fieldErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
          {fieldErrors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow border">
        <input type="text" name="fake-email" autoComplete="new-email" className="hidden" />
        <input type="password" name="fake-password" autoComplete="new-password" className="hidden" />

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
            placeholder="Full Name"
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
            placeholder="Email Address"
            autoComplete="new-email"
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

        {/* Address (optional) */}
        <div className="relative">
          <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address (optional)"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        {/* City (optional) */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City (optional)"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        {/* Country (optional) */}
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country (optional)"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        {/* Designation (optional) */}
        <div className="relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="Designation (e.g. Professor) (optional)"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        {/* Department (optional) */}
        <div className="relative">
          <Book className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Department (optional)"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
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
        </div>

        {/* Google Scholar Profile URL (optional) */}
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
            placeholder="Password"
            autoComplete="new-password"
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

        {/* Role (required) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-600">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {fieldErrors.role && <p className="text-red-600 text-sm mt-1">{fieldErrors.role}</p>}
        </div>

        {/* CV & Profile Photo (optional) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CV (optional)</label>
            <input
              type="file"
              name="cv"
              onChange={handleChange}
              accept=".pdf,.doc,.docx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (optional)</label>
            <input
              type="file"
              name="profile_photo"
              onChange={handleChange}
              accept="image/*"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          <User className="h-5 w-5" />
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}