// src/app/author-dashboard/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserDashboardLayout from '@/components/user/UserDashboardLayout';
import { ArrowLeft, Save, X } from 'lucide-react';
import { apiUrl } from '@/utils/api';

interface UserProfile {
  id?: number;
  email: string;
  full_name: string;
  title?: string;
  mobile_number?: string;
  address?: string;
  city?: string;
  country?: string;
  designation?: string;
  department?: string;
  orcid_id?: string;
  google_scholar_url?: string;
  profile_photo?: string;
  cv?: string;
}

export default function AuthorProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    full_name: '',
    title: '',
    mobile_number: '',
    address: '',
    city: '',
    country: '',
    designation: '',
    department: '',
    orcid_id: '',
    google_scholar_url: '',
  });

  const [formData, setFormData] = useState<UserProfile>(profile);
  const [imageVersion, setImageVersion] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'author') {
      router.push('/login');
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('profile/'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text();
        console.error('Profile fetch failed', response.status, body);
        throw new Error(`Failed to load profile (${response.status})`);
      }

      const data = await response.json();
      setProfile(data);
      setFormData(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.full_name.trim());
      formDataToSend.append('title', formData.title?.trim() || '');
      formDataToSend.append('mobile_number', formData.mobile_number?.trim() || '');
      formDataToSend.append('address', formData.address?.trim() || '');
      formDataToSend.append('city', formData.city?.trim() || '');
      formDataToSend.append('country', formData.country?.trim() || '');
      formDataToSend.append('designation', formData.designation?.trim() || '');
      formDataToSend.append('department', formData.department?.trim() || '');
      formDataToSend.append('orcid_id', formData.orcid_id?.trim() || '');
      formDataToSend.append('google_scholar_url', formData.google_scholar_url?.trim() || '');

      if (cvFile) {
        formDataToSend.append('cv', cvFile);
      }
      if (profilePhotoFile) {
        formDataToSend.append('profile_photo', profilePhotoFile);
      }

      const response = await fetch(apiUrl('profile/'), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type here — browser handles multipart/form-data
        },
        body: formDataToSend,
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // not JSON
      }

      if (!response.ok) {
        console.error('Profile update failed', response.status, text);
        const errMsg = data?.message || data?.detail || `Failed to update profile (${response.status})`;
        throw new Error(errMsg);
      }

      const profileData = data?.profile ? data.profile : data;
      setProfile(profileData);
      setFormData(profileData);
      setImageVersion(v => v + 1);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
      setCvFile(null);
      setCvFileName('');
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
    setCvFile(null);
    setCvFileName('');
    setIsEditing(false);
    setError('');
  };

  // Build correct URL for media files (profile_photo & cv)
  const getMediaUrl = (path?: string | null, version?: number) => {
    if (!path) return '';

    // Already absolute URL
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
      return version ? `${path}?v=${version}` : path;
    }

    // Relative path → use apiUrl helper
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const baseUrl = apiUrl(cleanPath);
    return version ? `${baseUrl}?v=${version}` : baseUrl;
  };

  if (loading && Object.keys(profile).every(key => !profile[key as keyof UserProfile])) {
    return (
      <UserDashboardLayout role="author">
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout role="author">
      <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
        {/* Back Button */}
        <Link
          href="/author-dashboard"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Success / Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                isEditing
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g., Dr., Prof., Mr."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled={true}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+8801712345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g., Senior Researcher"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="e.g., Environmental Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ORCID ID</label>
              <input
                type="text"
                name="orcid_id"
                value={formData.orcid_id || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="0000-0000-0000-0000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Scholar URL</label>
              <input
                type="url"
                name="google_scholar_url"
                value={formData.google_scholar_url || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://scholar.google.com/citations?user=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              placeholder="Enter your full address..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Profile Photo */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-sm"
                  />
                ) : profile.profile_photo ? (
                  <img
                    src={getMediaUrl(profile.profile_photo, imageVersion)}
                    alt="Profile photo"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No photo</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Recommended: square image, max 2MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CV Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum Vitae (CV)</label>

            {profile.cv && !cvFileName && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {profile.cv.split('/').pop() || 'Current CV'}
                  </p>
                  <a
                    href={getMediaUrl(profile.cv)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Download current CV
                  </a>
                </div>
              </div>
            )}

            {isEditing && (
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-5 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {cvFileName && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {cvFileName}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition font-medium min-w-[140px]"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
}