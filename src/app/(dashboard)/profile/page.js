'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaCalendarAlt,
  FaBuilding,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import apiClient from '../../../lib/api';

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setEditedName(parsedUser.name || '');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      loadUserData();
    }
  }, [isClient, router]);

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    if (user?.phone) {
      return user.phone.substring(user.phone.length - 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return '#ec4899';
      case 'manager': return '#8b5cf6';
      case 'waiter': return '#10b981';
      case 'employee': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'manager': return 'Manager';
      case 'waiter': return 'Waiter';
      case 'employee': return 'Employee';
      default: return role || 'User';
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      return;
    }

    setSaving(true);
    try {
      // Update in localStorage
      const updatedUser = { ...user, name: editedName.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      
      // Optionally update on backend
      // await apiClient.updateUserProfile({ name: editedName.trim() });
    } catch (error) {
      console.error('Error saving name:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isClient) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fef7f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isGoogleLogin = user.photoURL || (user.email && !user.phone);
  const hasPhone = user.phone;
  const hasEmail = user.email;

  return (
    <div style={{ 
      width: '100%',
      minHeight: '100vh', 
      backgroundColor: '#fef7f0',
      padding: isMobile ? '16px' : '24px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px',
          padding: isMobile ? '20px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #fce7f3'
        }}>
          <h1 style={{ 
            fontSize: isMobile ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaUser color="#ec4899" size={isMobile ? 24 : 28} />
            Profile
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            View and manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px',
          padding: isMobile ? '24px' : '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #fce7f3'
        }}>
          {/* Profile Picture and Name Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: '24px',
            marginBottom: '32px',
            paddingBottom: '32px',
            borderBottom: '1px solid #f3f4f6'
          }}>
            {/* Profile Picture */}
            <div style={{
              width: isMobile ? '120px' : '140px',
              height: isMobile ? '120px' : '140px',
              borderRadius: '50%',
              background: isGoogleLogin && user.photoURL 
                ? 'transparent' 
                : `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}dd)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '4px solid white',
              flexShrink: 0
            }}>
              {isGoogleLogin && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ 
                  color: 'white', 
                  fontSize: isMobile ? '48px' : '56px',
                  fontWeight: 'bold'
                }}>
                  {getUserInitials()}
                </span>
              )}
            </div>

            {/* Name and Role */}
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              {editMode ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '10px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      outline: 'none',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving || !editedName.trim()}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: saving ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    <FaCheck size={14} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(user.name || '');
                      setEditMode(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    <FaTimes size={14} />
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '8px' }}>
                    <h2 style={{ 
                      fontSize: isMobile ? '24px' : '28px', 
                      fontWeight: 'bold', 
                      color: '#1f2937', 
                      margin: 0 
                    }}>
                      {user.name || 'User'}
                    </h2>
                    <button
                      onClick={() => setEditMode(true)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}
                      title="Edit name"
                    >
                      <FaEdit size={12} />
                      Edit
                    </button>
                  </div>
                  <div style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: `${getRoleColor(user.role)}15`,
                    borderRadius: '20px',
                    marginTop: '8px'
                  }}>
                    <FaShieldAlt size={14} color={getRoleColor(user.role)} />
                    <span style={{ 
                      color: getRoleColor(user.role), 
                      fontWeight: '600', 
                      fontSize: '14px' 
                    }}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Card */}
            {hasEmail && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#ec489915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaEnvelope size={20} color="#ec4899" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Email Address
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    color: '#1f2937', 
                    fontWeight: '600' 
                  }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Phone Card */}
            {hasPhone && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#10b98115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaPhone size={20} color="#10b981" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                  }}>
                    Phone Number
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    color: '#1f2937', 
                    fontWeight: '600' 
                  }}>
                    {user.phone}
                  </p>
                </div>
              </div>
            )}

            {/* User ID Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#3b82f615',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaUser size={20} color="#3b82f6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  User ID
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  color: '#1f2937', 
                  fontWeight: '600',
                  fontFamily: 'monospace'
                }}>
                  {user.id || user.userId || 'N/A'}
                </p>
              </div>
            </div>

            {/* Login Method Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#8b5cf615',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaShieldAlt size={20} color="#8b5cf6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  Login Method
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  color: '#1f2937', 
                  fontWeight: '600' 
                }}>
                  {isGoogleLogin ? 'Google Account' : 'Phone Number'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
