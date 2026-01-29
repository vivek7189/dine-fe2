'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { 
  FaStore, 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaShieldAlt,
  FaCrown,
  FaUserShield,
  FaUtensils,
  FaArrowRight,
  FaKey,
  FaIdBadge,
  FaCopy,
  FaUserCog,
  FaCheck,
  FaTimes,
  FaPercentage,
  FaSave,
  FaSpinner,
  FaClock,
  FaGoogle,
  FaReceipt
} from 'react-icons/fa';
import ShiftScheduling from '../../../components/ShiftScheduling';
import GoogleReviews from '../../../components/GoogleReviews';

// Tax Management Component
const TaxManagement = ({ restaurants, selectedRestaurant, setSelectedRestaurant }) => {
  const [taxSettings, setTaxSettings] = useState({
    enabled: true,
    taxes: [
      {
        id: 'gst',
        name: 'GST',
        rate: 5,
        enabled: true,
        type: 'percentage'
      }
    ],
    defaultTaxRate: 5
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTaxSettings = async (restaurantId) => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.getTaxSettings(restaurantId);
      if (response.success) {
        setTaxSettings(response.taxSettings);
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTaxSettings = async () => {
    if (!selectedRestaurant?.id) return;
    
    setSaving(true);
    try {
      const response = await apiClient.updateTaxSettings(selectedRestaurant.id, taxSettings);
      if (response.success) {
        alert('Tax settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving tax settings:', error);
      alert('Error saving tax settings');
    } finally {
      setSaving(false);
    }
  };

  const addTax = () => {
    const newTax = {
      id: `tax_${Date.now()}`,
      name: 'New Tax',
      rate: 0,
      enabled: true,
      type: 'percentage'
    };
    setTaxSettings(prev => ({
      ...prev,
      taxes: [...prev.taxes, newTax]
    }));
  };

  const updateTax = (index, field, value) => {
    setTaxSettings(prev => ({
      ...prev,
      taxes: prev.taxes.map((tax, i) => 
        i === index ? { ...tax, [field]: value } : tax
      )
    }));
  };

  const removeTax = (index) => {
    setTaxSettings(prev => ({
      ...prev,
      taxes: prev.taxes.filter((_, i) => i !== index)
    }));
  };

  const toggleTaxEnabled = (index) => {
    setTaxSettings(prev => ({
      ...prev,
      taxes: prev.taxes.map((tax, i) => 
        i === index ? { ...tax, enabled: !tax.enabled } : tax
      )
    }));
  };

  // Load tax settings when restaurant changes
  useEffect(() => {
    if (selectedRestaurant?.id) {
      loadTaxSettings(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPercentage size={20} />
          Tax Management
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Configure tax rates and settings for your restaurant
        </p>
      </div>

      {/* Restaurant Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
          Select Restaurant
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant)}
              style={{
                backgroundColor: selectedRestaurant?.id === restaurant.id ? '#ec4899' : '#f8fafc',
                color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                border: selectedRestaurant?.id === restaurant.id ? 'none' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FaStore size={12} style={{ marginRight: '6px' }} />
              {restaurant.name}
            </button>
          ))}
        </div>
      </div>

      {selectedRestaurant && (
        <div>
          {/* Tax Enable/Disable */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={taxSettings.enabled}
                onChange={(e) => setTaxSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              Enable Tax Calculation
            </label>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              When enabled, taxes will be automatically calculated and added to orders
            </p>
          </div>

          {taxSettings.enabled && (
            <div>
              {/* Tax List */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    Tax Rates
                  </h3>
                  <button
                    onClick={addTax}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FaPlus size={12} />
                    Add Tax
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {taxSettings.taxes.map((tax, index) => (
                    <div key={tax.id} style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <input
                        type="checkbox"
                        checked={tax.enabled}
                        onChange={() => toggleTaxEnabled(index)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      
                      <input
                        type="text"
                        value={tax.name}
                        onChange={(e) => updateTax(index, 'name', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        placeholder="Tax Name (e.g., GST, VAT)"
                      />
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          value={tax.rate}
                          onChange={(e) => updateTax(index, 'rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          style={{
                            width: '80px',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>%</span>
                      </div>
                      
                      <button
                        onClick={() => removeTax(index)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={saveTaxSettings}
                  disabled={saving}
                  style={{
                    backgroundColor: saving ? '#9ca3af' : '#ec4899',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  {saving ? (
                    <>
                      <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />
                      Save Tax Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedRestaurant && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <FaStore size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '16px', margin: 0 }}>
            Please select a restaurant to manage tax settings
          </p>
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('restaurants');
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [staff, setStaff] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: ''
  });
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    role: 'employee',
    startDate: new Date().toISOString().split('T')[0],
    pageAccess: {
      dashboard: true,
      history: true,
      tables: true,
      menu: true,
      analytics: false,
      inventory: false,
      kot: false,
      admin: false
    }
  });
  const [showPassword, setShowPassword] = useState({});
  const [customRoles, setCustomRoles] = useState(['employee', 'manager', 'admin']);
  const [newCustomRole, setNewCustomRole] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('owner');
  const [copiedCredentials, setCopiedCredentials] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [orderManagementSeqEnabled, setOrderManagementSeqEnabled] = useState(false);
  const [orderManagementSaving, setOrderManagementSaving] = useState(false);

  // Sync order management setting from selected restaurant when tab or restaurant changes
  useEffect(() => {
    if (activeTab === 'order-management' && selectedRestaurant) {
      setOrderManagementSeqEnabled(!!(selectedRestaurant.orderSettings && selectedRestaurant.orderSettings.sequentialOrderIdEnabled));
    }
  }, [activeTab, selectedRestaurant]);

  // Hide staff detail when leaving Staff tab so it doesn’t show on Order Management / other tabs
  useEffect(() => {
    if (activeTab !== 'staff' && selectedStaff) {
      setSelectedStaff(null);
    }
  }, [activeTab]);

  // Client-side hydration and mobile detection
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check authorization
  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Admin page: Checking authorization...');
        const userData = localStorage.getItem('user');
        const authToken = localStorage.getItem('authToken');
        
        console.log('Admin page: User data exists:', !!userData);
        console.log('Admin page: Auth token exists:', !!authToken);
        
        if (!userData || !authToken) {
          console.log('Admin page: No user data or token, redirecting to login');
          router.push('/login');
          return;
        }

        const user = JSON.parse(userData);
        console.log('Admin page: User role:', user.role);
        
        setCurrentUserRole(user.role || 'owner');
        
        // Allow owners and admin roles to access admin page
        if (user.role && !['owner', 'admin'].includes(user.role)) {
          console.log('Admin page: User does not have admin access, redirecting to home');
          router.push('/');
          return;
        }

        console.log('Admin page: Authorization successful');
        setAuthorized(true);
      } catch (error) {
        console.error('Admin page: Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch restaurants data from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!authorized) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getRestaurants();
        setRestaurants(response.restaurants || []);
        
        // Set the first restaurant as selected by default
        if (response.restaurants && response.restaurants.length > 0) {
          setSelectedRestaurant(response.restaurants[0]);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        // Don't redirect on API failure - just show empty state or allow user to add restaurants
        setRestaurants([]);
        setSelectedRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [authorized]);

  // Listen for restaurant changes from navigation
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      console.log('🏪 Admin page: Restaurant changed, reloading data', event.detail);
      // Reload restaurants and update selected restaurant
      const fetchRestaurants = async () => {
        try {
          const response = await apiClient.getRestaurants();
          setRestaurants(response.restaurants || []);
          
          // Update selected restaurant based on localStorage
          if (response.restaurants && response.restaurants.length > 0) {
            const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
            const selectedRestaurant = response.restaurants.find(r => r.id === savedRestaurantId) || response.restaurants[0];
            setSelectedRestaurant(selectedRestaurant);
          }
        } catch (error) {
          console.error('Error reloading restaurants:', error);
        }
      };

      fetchRestaurants();
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, []);

  // Delete staff member
  const deleteStaff = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteStaff(staffId);
      
      // Remove from local state
      setStaff(prevStaff => prevStaff.filter(member => member.id !== staffId));
      
      alert(`${staffName} has been deleted successfully`);
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert(`Failed to delete ${staffName}: ${error.message || 'Unknown error'}`);
    }
  };

  // Fetch credentials for a specific staff member
  const fetchStaffCredentials = async (staffId) => {
    try {
      const response = await apiClient.getStaffCredentials(staffId);
      
      // Update the staff member with credentials
      setStaff(prevStaff => prevStaff.map(member => 
        member.id === staffId 
          ? { 
              ...member, 
              loginId: response.loginId,
              tempPassword: response.temporaryPassword,
              hasTemporaryPassword: response.hasTemporaryPassword,
              credentialsMessage: response.message
            }
          : member
      ));
      
      return response;
    } catch (error) {
      console.error('Error fetching staff credentials:', error);
      return null;
    }
  };

  // Fetch staff data when restaurant is selected
  useEffect(() => {
    const fetchStaff = async () => {
      if (!authorized || !selectedRestaurant) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getStaff(selectedRestaurant.id);
        setStaff(response.staff || []);
      } catch (error) {
        console.error('Error fetching staff:', error);
        // Don't redirect on API failure - just show empty state
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [authorized, selectedRestaurant]);

  // Fetch menu data when restaurant is selected and menu tab is active
  useEffect(() => {
    const fetchMenu = async () => {
      if (!authorized || !selectedRestaurant || activeTab !== 'menu') return;
      
      try {
        setLoading(true);
        const response = await apiClient.getMenu(selectedRestaurant.id);
        setMenuItems(response.menuItems || []);
      } catch (error) {
        console.error('Error fetching menu:', error);
        // Don't redirect on API failure - just show empty state
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [authorized, selectedRestaurant, activeTab]);

  const getRoleInfo = (role) => {
    const roleMap = {
      owner: {
        label: 'Owner',
        icon: FaCrown,
        color: '#dc2626',
        bg: '#fee2e2'
      },
      admin: {
        label: 'Admin',
        icon: FaUserShield,
        color: '#7c3aed',
        bg: '#e9d5ff'
      },
      manager: {
        label: 'Manager',
        icon: FaUserCog,
        color: '#059669',
        bg: '#d1fae5'
      },
      employee: {
        label: 'Employee',
        icon: FaUsers,
        color: '#3b82f6',
        bg: '#dbeafe'
      },
      waiter: {
        label: 'Waiter',
        icon: FaUtensils,
        color: '#f59e0b',
        bg: '#fef3c7'
      },
      cashier: {
        label: 'Cashier',
        icon: FaUserCheck,
        color: '#8b5cf6',
        bg: '#f3e8ff'
      },
      chef: {
        label: 'Chef',
        icon: FaUtensils,
        color: '#ef4444',
        bg: '#fecaca'
      },
      cook: {
        label: 'Cook',
        icon: FaUtensils,
        color: '#f97316',
        bg: '#fed7aa'
      },
      supervisor: {
        label: 'Supervisor',
        icon: FaUserShield,
        color: '#10b981',
        bg: '#dcfce7'
      }
    };
    
    // Handle custom roles or roles not in the predefined map
    return roleMap[role] || {
      label: role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Staff',
      icon: FaUsers,
      color: '#6b7280',
      bg: '#f3f4f6'
    };
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      active: {
        label: 'Active',
        color: '#10b981',
        bg: '#dcfce7',
        icon: FaUserCheck
      },
      inactive: {
        label: 'Inactive',
        color: '#6b7280',
        bg: '#f3f4f6',
        icon: FaUserTimes
      },
      suspended: {
        label: 'Suspended',
        color: '#ef4444',
        bg: '#fee2e2',
        icon: FaUserTimes
      }
    };
    return statusMap[status] || statusMap.active;
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await apiClient.createRestaurant(newRestaurant);
      
      // Add the new restaurant to the local state
      setRestaurants([...restaurants, response.restaurant]);
      
      setNewRestaurant({
        name: '',
        description: ''
      });
      setShowAddRestaurantModal(false);
      
      alert('Restaurant added successfully!');
    } catch (error) {
      console.error('Error adding restaurant:', error);
      alert(`Failed to add restaurant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate unique credentials for new staff
  const generateCredentials = () => {
    // Generate unique user ID: RES001, RES002, etc.
    const existingIds = staff.map(member => member.loginId).filter(Boolean);
    let counter = 1;
    let userId;
    do {
      userId = `${selectedRestaurant?.name?.substring(0, 3).toUpperCase() || 'RES'}${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (existingIds.includes(userId));
    
    // Generate random 6-character alphanumeric password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return { userId, password };
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      alert('Please select a restaurant first');
      return;
    }

    // Validate role permissions
    if (currentUserRole !== 'owner' && newStaff.role === 'admin') {
      alert('Only owners can create admin roles');
      return;
    }

    try {
      setLoading(true);
      
      const staffData = {
        ...newStaff,
        restaurantId: selectedRestaurant.id,
        pageAccess: newStaff.pageAccess
      };
      
      const response = await apiClient.addStaff(selectedRestaurant.id, staffData);
      
      // Add the new staff member with credentials to local state
      const newStaffMember = {
        ...response.staff,
        loginId: response.credentials.loginId,
        tempPassword: response.credentials.password // Store temporarily for display
      };
      setStaff([...staff, newStaffMember]);
      
      setNewStaff({
        name: '',
        phone: '',
        email: '',
        address: '',
        role: 'employee',
        startDate: new Date().toISOString().split('T')[0],
        pageAccess: {
          dashboard: true,
          history: true,
          tables: true,
          menu: true,
          analytics: false,
          inventory: false,
          kot: false,
          admin: false
        }
      });
      setShowAddStaffModal(false);
      
      alert(`Staff member added successfully!\n\nLogin Credentials:\nUser ID: ${response.credentials.loginId}\nPassword: ${response.credentials.password}\n\nPlease save these credentials securely.`);
    } catch (error) {
      console.error('Error adding staff:', error);
      alert(`Failed to add staff member: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStaffStatus = async (staffId) => {
    try {
      const member = staff.find(m => m.id === staffId);
      if (!member) return;
      
      const newStatus = member.status === 'active' ? 'inactive' : 'active';
      
      await apiClient.updateStaff(staffId, { status: newStatus });
      
      setStaff(staff.map(member => {
        if (member.id === staffId) {
          return { ...member, status: newStatus };
        }
        return member;
      }));
      
      alert(`Staff member ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating staff status:', error);
      alert(`Failed to update staff status: ${error.message}`);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.phone && restaurant.phone.includes(searchTerm))
  );

  const filteredStaff = staff.filter(member =>
    (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.phone && member.phone.includes(searchTerm)) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDateTime = (dateInput) => {
    if (!dateInput) return 'Never';
    
    try {
      let date;
      
      // Handle Firestore timestamp
      if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else if (dateInput._seconds) {
        // Handle Firestore timestamp format
        date = new Date(dateInput._seconds * 1000);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        return 'Never';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Never';
      }
      
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Never';
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
      let date;
      
      // Handle Firestore timestamp
      if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else if (dateInput._seconds) {
        // Handle Firestore timestamp format
        date = new Date(dateInput._seconds * 1000);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
      } else {
        return 'N/A';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-IN');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const copyToClipboard = async (text, type, memberId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCredentials(prev => ({
        ...prev,
        [`${memberId}_${type}`]: true
      }));
      setTimeout(() => {
        setCopiedCredentials(prev => ({
          ...prev,
          [`${memberId}_${type}`]: false
        }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const togglePasswordVisibility = (memberId) => {
    setShowPassword(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  // Menu management functions
  const toggleMenuItemAvailability = async (itemId, currentStatus) => {
    try {
      setLoading(true);
      const updatedData = { isAvailable: !currentStatus };
      await apiClient.updateMenuItem(itemId, updatedData);
      setMenuItems(items => items.map(item => 
        item.id === itemId ? { ...item, isAvailable: !currentStatus } : item
      ));
    } catch (error) {
      console.error('Error updating menu item availability:', error);
      alert(`Failed to update item availability: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setLoading(true);
      await apiClient.deleteMenuItem(itemId);
      setMenuItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(`Failed to delete menu item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canManageStaff = (targetRole) => {
    const roleHierarchy = {
      'owner': 4,
      'admin': 3,
      'manager': 2,
      'employee': 1
    };
    
    const currentLevel = roleHierarchy[currentUserRole] || 0;
    const targetLevel = roleHierarchy[targetRole] || 1;
    
    // Owners can manage everyone, admins can manage managers and below, etc.
    return currentLevel > targetLevel;
  };

  const getPerformanceStats = (member) => {
    // Different stats based on role
    switch (member.role) {
      case 'waiter':
        return {
          todayLabel: 'Orders Today',
          todayValue: member.ordersToday || 0,
          totalLabel: 'Total Orders',
          totalValue: member.totalOrders || 0
        };
      case 'manager':
        return {
          todayLabel: 'Staff Managed',
          todayValue: member.staffCount || 0,
          totalLabel: 'Total Revenue',
          totalValue: `₹${(member.totalRevenue || 0).toLocaleString()}`
        };
      case 'cashier':
        return {
          todayLabel: 'Transactions',
          todayValue: member.transactionsToday || 0,
          totalLabel: 'Total Sales',
          totalValue: `₹${(member.totalSales || 0).toLocaleString()}`
        };
      case 'chef':
      case 'cook':
        return {
          todayLabel: 'Dishes Made',
          todayValue: member.dishesToday || 0,
          totalLabel: 'Total Dishes',
          totalValue: member.totalDishes || 0
        };
      default:
        return {
          todayLabel: 'Tasks Today',
          todayValue: member.tasksToday || 0,
          totalLabel: 'Total Tasks',
          totalValue: member.totalTasks || 0
        };
    }
  };

  // Don't render anything until authorization is checked
  if (!authorized) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#fef7f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #fce7f3',
            borderTop: '4px solid #ec4899',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', margin: 0 }}>Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef7f0' }}>
      
      <div style={{ padding: isClient && isMobile ? '16px' : '24px' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: isClient && isMobile ? '16px' : '24px', 
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: isClient && isMobile ? '16px' : '24px',
          border: '1px solid #fce7f3'
        }}>
          {isClient && isMobile ? (
            // Mobile Header Layout
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'linear-gradient(135deg, #ec4899, #db2777)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                }}>
                  <FaShieldAlt color="white" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px 0' }}>
                    Admin Dashboard
                  </h1>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>
                    {restaurants.length} restaurants • {staff.length} staff
                  </p>
                </div>
              </div>
              
              {/* Mobile Tab Navigation */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setActiveTab('restaurants')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'restaurants' ? '#ec4899' : 'transparent',
                    color: activeTab === 'restaurants' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'restaurants' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaStore size={10} />
                  Restaurants
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'staff' ? '#ec4899' : 'transparent',
                    color: activeTab === 'staff' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'staff' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaUsers size={10} />
                  Staff
                </button>
                <button
                  onClick={() => setActiveTab('menu')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'menu' ? '#ec4899' : 'transparent',
                    color: activeTab === 'menu' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'menu' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaUtensils size={10} />
                  Menu
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'settings' ? '#ec4899' : 'transparent',
                    color: activeTab === 'settings' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'settings' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaUserCog size={10} />
                  Settings
                </button>
                <button
                  onClick={() => setActiveTab('tax')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'tax' ? '#ec4899' : 'transparent',
                    color: activeTab === 'tax' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'tax' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaPercentage size={10} />
                  Tax
                </button>
                <button
                  onClick={() => setActiveTab('order-management')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'order-management' ? '#ec4899' : 'transparent',
                    color: activeTab === 'order-management' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'order-management' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaReceipt size={10} />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('shifts')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'shifts' ? '#ec4899' : 'transparent',
                    color: activeTab === 'shifts' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'shifts' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaClock size={10} />
                  Shifts
                </button>
                <button
                  onClick={() => setActiveTab('google-reviews')}
                  style={{
                    flex: 1,
                    backgroundColor: activeTab === 'google-reviews' ? '#ec4899' : 'transparent',
                    color: activeTab === 'google-reviews' ? 'white' : '#6b7280',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '12px',
                    border: activeTab === 'google-reviews' ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <FaGoogle size={10} />
                  Reviews
                </button>
              </div>
            </div>
          ) : (
            // Desktop Header Layout
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  background: 'linear-gradient(135deg, #ec4899, #db2777)', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                }}>
                  <FaShieldAlt color="white" size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px 0' }}>
                    Admin Dashboard
                  </h1>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                    Manage restaurants and staff • {restaurants.length} restaurants • {staff.length} staff members
                  </p>
                </div>
              </div>
              
              {/* Desktop Tab Navigation - Separate Section */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid #f3f4f6'
              }}>
              <button
                onClick={() => setActiveTab('restaurants')}
                style={{
                  backgroundColor: activeTab === 'restaurants' ? '#ec4899' : 'transparent',
                  color: activeTab === 'restaurants' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'restaurants' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaStore size={14} />
                Restaurants
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                style={{
                  backgroundColor: activeTab === 'staff' ? '#ec4899' : 'transparent',
                  color: activeTab === 'staff' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'staff' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaUsers size={14} />
                Staff
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                style={{
                  backgroundColor: activeTab === 'menu' ? '#ec4899' : 'transparent',
                  color: activeTab === 'menu' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'menu' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaUtensils size={14} />
                Menu
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  backgroundColor: activeTab === 'settings' ? '#ec4899' : 'transparent',
                  color: activeTab === 'settings' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'settings' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaUserCog size={14} />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                style={{
                  backgroundColor: activeTab === 'tax' ? '#ec4899' : 'transparent',
                  color: activeTab === 'tax' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'tax' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaPercentage size={14} />
                Tax Management
              </button>
              <button
                onClick={() => setActiveTab('order-management')}
                style={{
                  backgroundColor: activeTab === 'order-management' ? '#ec4899' : 'transparent',
                  color: activeTab === 'order-management' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'order-management' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaReceipt size={14} />
                Order Management
              </button>
              <button
                onClick={() => setActiveTab('shifts')}
                style={{
                  backgroundColor: activeTab === 'shifts' ? '#ec4899' : 'transparent',
                  color: activeTab === 'shifts' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'shifts' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaClock size={14} />
                Shift Scheduling
              </button>
              <button
                onClick={() => setActiveTab('google-reviews')}
                style={{
                  backgroundColor: activeTab === 'google-reviews' ? '#ec4899' : 'transparent',
                  color: activeTab === 'google-reviews' ? 'white' : '#6b7280',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: activeTab === 'google-reviews' ? 'none' : '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaGoogle size={14} />
                Google Reviews
              </button>
            </div>
            </div>
          )}
        </div>

        {/* Action Bar — only on Restaurants / Staff / Menu tabs */}
        {(activeTab === 'restaurants' || activeTab === 'staff' || activeTab === 'menu') && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: isClient && isMobile ? '16px' : '20px',
          marginBottom: isClient && isMobile ? '16px' : '24px',
          border: '1px solid #fce7f3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: isClient && isMobile ? 'column' : 'row',
          gap: isClient && isMobile ? '12px' : '0'
        }}>
          {/* Search Bar */}
          <div style={{ 
            position: 'relative', 
            maxWidth: isClient && isMobile ? '100%' : '400px', 
            flex: 1,
            width: isClient && isMobile ? '100%' : 'auto'
          }}>
            <FaSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: isClient && isMobile ? '12px' : '14px'
            }} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: isClient && isMobile ? '36px' : '40px',
                paddingRight: isClient && isMobile ? '12px' : '16px',
                paddingTop: isClient && isMobile ? '10px' : '12px',
                paddingBottom: isClient && isMobile ? '10px' : '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: isClient && isMobile ? '13px' : '14px',
                outline: 'none',
                backgroundColor: '#fef7f0',
                transition: 'all 0.2s'
              }}
            />
          </div>
          
          {/* Add Button — Restaurants or Staff only */}
          {activeTab !== 'menu' && (
            <button
              onClick={() => activeTab === 'restaurants' ? setShowAddRestaurantModal(true) : setShowAddStaffModal(true)}
              style={{
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                color: 'white',
                padding: isClient && isMobile ? '10px 16px' : '12px 20px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: isClient && isMobile ? '13px' : '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                width: isClient && isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                marginLeft: isClient && isMobile ? '0' : '16px'
              }}
            >
              <FaPlus size={14} />
              Add {activeTab === 'restaurants' ? 'Restaurant' : 'Staff'}
            </button>
          )}
          
          {/* Menu Management Button */}
          {activeTab === 'menu' && (
            <button
              onClick={() => router.push('/menu')}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                marginLeft: '16px'
              }}
            >
              <FaEdit size={14} />
              Full Menu Management
            </button>
          )}
        </div>
        )}

        {/* Restaurant Selection for Staff Tab */}
        {activeTab === 'staff' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid #fce7f3'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaStore size={16} />
              Select Restaurant
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  style={{
                    backgroundColor: selectedRestaurant?.id === restaurant.id ? '#ec4899' : '#f8fafc',
                    color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    fontSize: '14px',
                    border: selectedRestaurant?.id === restaurant.id ? 'none' : '2px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaStore size={12} />
                  {restaurant.name}
                  <FaArrowRight size={10} style={{ opacity: 0.7 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area — only show restaurants/staff grids when on those tabs */}
        {(activeTab === 'restaurants' || activeTab === 'staff') && (activeTab === 'restaurants' ? (
          // Restaurants Grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: isClient && isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: isClient && isMobile ? '16px' : '20px'
          }}>
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: '1px solid #fce7f3',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}>
                {/* Restaurant Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaStore color="white" size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{restaurant.name}</h3>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{restaurant.phone}</p>
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Active
                    </div>
                  </div>
                </div>
                
                {/* Restaurant Details */}
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaMapMarkerAlt style={{ color: '#9ca3af', fontSize: '12px' }} />
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Address</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#1f2937', margin: 0, paddingLeft: '20px' }}>
                      {restaurant.address}
                    </p>
                  </div>

                  {restaurant.email && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FaEnvelope style={{ color: '#9ca3af', fontSize: '12px' }} />
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Email</span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#1f2937', margin: 0, paddingLeft: '20px' }}>
                        {restaurant.email}
                      </p>
                    </div>
                  )}

                  {restaurant.cuisine && Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FaUtensils style={{ color: '#9ca3af', fontSize: '12px' }} />
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Cuisine</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', paddingLeft: '20px', flexWrap: 'wrap' }}>
                        {(Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [restaurant.cuisine]).map((c, index) => (
                          <span key={index} style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #f59e0b'
                          }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div style={{ 
                  padding: '16px 20px', 
                  backgroundColor: '#fef7f0', 
                  display: 'flex', 
                  gap: '8px',
                  borderTop: '1px solid #fce7f3'
                }}>
                  <button
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setActiveTab('staff');
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaUsers size={12} />
                    Manage Staff
                  </button>
                  
                  <button
                    style={{
                      flex: 1,
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaEdit size={12} />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Staff Grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: isClient && isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: isClient && isMobile ? '16px' : '20px'
          }}>
            {filteredStaff.map((member) => {
              const roleInfo = getRoleInfo(member.role);
              const statusInfo = getStatusInfo(member.status);
              const RoleIcon = roleInfo.icon;
              const StatusIcon = statusInfo.icon;
              const isInactive = member.status === 'inactive';

              return (
                <div key={member.id} style={{
                  backgroundColor: isInactive ? '#f3f4f6' : 'white',
                  borderRadius: '20px',
                  boxShadow: isInactive ? '0 2px 8px rgba(0,0,0,0.06)' : '0 4px 12px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: isInactive ? '1px solid #e5e7eb' : '1px solid #fce7f3',
                  cursor: 'pointer',
                  opacity: isInactive ? 0.92 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isClient || !isMobile) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isClient || !isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}>
                  {/* Staff Header */}
                  <div style={{ padding: isClient && isMobile ? '16px' : '20px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}dd)`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <RoleIcon color="white" size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: isClient && isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{member.name || 'Unknown'}</h3>
                          <p style={{ fontSize: isClient && isMobile ? '12px' : '13px', color: '#6b7280', margin: 0 }}>{member.phone || member.email || 'No contact'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: isClient && isMobile ? '4px' : '6px', flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: roleInfo.bg,
                          color: roleInfo.color,
                          border: `1px solid ${roleInfo.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <RoleIcon size={10} />
                          {roleInfo.label}
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <StatusIcon size={10} />
                          {statusInfo.label}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Staff Details */}
                  <div style={{ padding: isClient && isMobile ? '16px' : '20px' }}>
                    {/* Login Credentials Section */}
                    <div style={{ 
                      backgroundColor: '#f0f9ff', 
                      padding: isClient && isMobile ? '12px' : '16px', 
                      borderRadius: '12px',
                      marginBottom: isClient && isMobile ? '12px' : '16px',
                      border: '1px solid #0ea5e9'
                    }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#0c4a6e', 
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaKey size={12} />
                        Login Credentials
                      </h4>
                      
                      {/* Show credentials if available, otherwise show load button */}
                      {(member.loginId || member.tempPassword) ? (
                        <>
                          {/* User ID Badge */}
                          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaIdBadge style={{ color: '#0ea5e9', fontSize: '14px' }} />
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>User ID</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  fontSize: '13px', 
                                  fontWeight: '600', 
                                  color: '#0c4a6e',
                                  backgroundColor: '#e0f2fe',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontFamily: 'monospace'
                                }}>
                                  {member.loginId || 'N/A'}
                                </span>
                                {member.loginId && (
                                  <button
                                    onClick={() => copyToClipboard(member.loginId, 'userId', member.id)}
                                    style={{
                                      backgroundColor: copiedCredentials[`${member.id}_userId`] ? '#10b981' : '#0ea5e9',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <FaCopy size={10} />
                                    {copiedCredentials[`${member.id}_userId`] ? 'Copied!' : 'Copy'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Password with show/hide */}
                          {(member.tempPassword || member.password || member.hasTemporaryPassword) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FaKey style={{ color: '#0ea5e9', fontSize: '14px' }} />
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Password</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ 
                                    fontSize: '13px', 
                                    fontWeight: '600', 
                                    color: '#0c4a6e',
                                    backgroundColor: '#e0f2fe',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontFamily: 'monospace',
                                    minWidth: '60px'
                                  }}>
                                    {showPassword[member.id] 
                                      ? (member.tempPassword || member.password || 'N/A')
                                      : '••••••'
                                    }
                                  </span>
                                  <button
                                    onClick={() => togglePasswordVisibility(member.id)}
                                    style={{
                                      backgroundColor: '#6b7280',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    {showPassword[member.id] ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
                                    {showPassword[member.id] ? 'Hide' : 'Show'}
                                  </button>
                                  {(member.tempPassword || member.password) && (
                                    <button
                                      onClick={() => copyToClipboard(member.tempPassword || member.password, 'password', member.id)}
                                      style={{
                                        backgroundColor: copiedCredentials[`${member.id}_password`] ? '#10b981' : '#0ea5e9',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      <FaCopy size={10} />
                                      {copiedCredentials[`${member.id}_password`] ? 'Copied!' : 'Copy'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Show message if available */}
                          {member.credentialsMessage && (
                            <div style={{ 
                              marginTop: '8px', 
                              fontSize: '11px', 
                              color: '#6b7280', 
                              fontStyle: 'italic' 
                            }}>
                              {member.credentialsMessage}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => fetchStaffCredentials(member.id)}
                            style={{
                              backgroundColor: '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              margin: '0 auto'
                            }}
                          >
                            <FaKey size={12} />
                            Load Credentials
                          </button>
                          <div style={{ 
                            marginTop: '8px', 
                            fontSize: '11px', 
                            color: '#6b7280' 
                          }}>
                            Click to load login credentials
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Page Access Display */}
                    {member.pageAccess && (
                      <div style={{ 
                        backgroundColor: '#f0fdf4', 
                        padding: isClient && isMobile ? '12px' : '16px', 
                        borderRadius: '12px',
                        marginBottom: isClient && isMobile ? '12px' : '16px',
                        border: '1px solid #22c55e'
                      }}>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#166534', 
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaShieldAlt size={12} />
                          Page Access Permissions
                        </h4>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: '8px'
                        }}>
                          {[
                            { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
                            { key: 'history', label: 'History', icon: '📋' },
                            { key: 'tables', label: 'Tables', icon: '🪑' },
                            { key: 'menu', label: 'Menu', icon: '🍽️' },
                            { key: 'analytics', label: 'Analytics', icon: '📊' },
                            { key: 'inventory', label: 'Inventory', icon: '📦' },
                            { key: 'kot', label: 'KOT', icon: '👨‍🍳' },
                            { key: 'admin', label: 'Admin', icon: '⚙️' }
                          ].map(({ key, label, icon }) => (
                            <div key={key} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              backgroundColor: member.pageAccess[key] ? '#dcfce7' : '#fef2f2',
                              border: `1px solid ${member.pageAccess[key] ? '#22c55e' : '#fca5a5'}`
                            }}>
                              <span style={{ fontSize: '12px' }}>{icon}</span>
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '500',
                                color: member.pageAccess[key] ? '#166534' : '#dc2626'
                              }}>
                                {label}
                              </span>
                              {member.pageAccess[key] ? (
                                <FaCheck size={8} style={{ color: '#22c55e' }} />
                              ) : (
                                <FaTimes size={8} style={{ color: '#dc2626' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: isClient && isMobile ? '1fr' : '1fr 1fr', gap: isClient && isMobile ? '12px' : '16px', marginBottom: isClient && isMobile ? '12px' : '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCalendarAlt style={{ color: '#9ca3af', fontSize: '12px' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Start Date</span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                            {formatDate(member.startDate)}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCalendarAlt style={{ color: '#9ca3af', fontSize: '12px' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Last Login</span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                            {formatDateTime(member.lastLogin)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Performance Stats */}
                    {(() => {
                      const stats = getPerformanceStats(member);
                      return (
                        <div style={{ 
                          backgroundColor: '#f8fafc', 
                          padding: isClient && isMobile ? '10px' : '12px', 
                          borderRadius: '10px',
                          marginBottom: isClient && isMobile ? '12px' : '16px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                                {stats.todayValue}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>{stats.todayLabel}</div>
                            </div>
                            <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }} />
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                                {stats.totalValue}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>{stats.totalLabel}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Actions */}
                  <div style={{ 
                    padding: isClient && isMobile ? '8px 12px' : '12px 16px',
                    backgroundColor: '#fef7f0', 
                    display: 'flex', 
                    gap: isClient && isMobile ? '4px' : '6px',
                    borderTop: '1px solid #fce7f3',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {/* View button - available to everyone */}
                    <button
                      onClick={() => setSelectedStaff(member)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '6px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        height: '32px'
                      }}
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                    
                    {/* Status toggle - only if user can manage this staff member */}
                    {canManageStaff(member.role) && (
                      <button
                        onClick={() => toggleStaffStatus(member.id)}
                        style={{
                          backgroundColor: member.status === 'active' ? '#ef4444' : '#10b981',
                          color: 'white',
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          height: '32px'
                        }}
                        title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {member.status === 'active' ? <FaUserTimes size={14} /> : <FaUserCheck size={14} />}
                      </button>
                    )}

                    {/* Edit button - only for higher-level roles and if can manage */}
                    {(currentUserRole === 'owner' || currentUserRole === 'admin') && canManageStaff(member.role) && (
                      <button
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          height: '32px'
                        }}
                        title="Edit Staff"
                      >
                        <FaEdit size={14} />
                      </button>
                    )}

                    {/* Delete button - only for owners and admins */}
                    {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                      <button
                        onClick={() => deleteStaff(member.id, member.name)}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '6px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '32px',
                          height: '32px'
                        }}
                        title="Delete Staff"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty States */}
        {activeTab === 'restaurants' && filteredRestaurants.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'linear-gradient(135deg, rgb(255 246 241) 0%, rgb(254 245 242) 50%, rgb(255 244 243) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)
              `,
              zIndex: 0
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                animation: 'bounce 2s infinite'
              }}>
                <FaStore size={40} style={{ color: '#ef4444' }} />
              </div>
              
              <h3 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Restaurant Management Ready! 🏪
              </h3>
              
              <p style={{
                fontSize: '18px',
                color: '#374151',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                {searchTerm ? 'Try different search terms' : 'Create Your First Restaurant'}
              </p>
              
              <p style={{
                color: '#6b7280',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px auto',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                {searchTerm 
                  ? 'Try adjusting your search criteria or clear the search to see all restaurants.' 
                  : 'Set up your restaurant profile with details, location, and business information to start managing your operations.'
                }
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddRestaurantModal(true)}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                      transform: 'translateY(0)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <FaPlus size={16} />
{t('admin.addRestaurant')}
                  </button>
                )}
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'staff' && filteredStaff.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #fce7f3'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fef7f0',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FaUsers size={32} style={{ color: '#d1d5db' }} />
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              {!selectedRestaurant ? t('admin.selectRestaurantFirst') : t('admin.noStaffFound')}
            </h3>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '14px'
            }}>
              {!selectedRestaurant ? 'Please select a restaurant to manage its staff.' : 
                searchTerm ? 'Try adjusting your search criteria.' : 'Add your first staff member to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      {showAddRestaurantModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #fce7f3'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #fef7f0, #fce7f3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>
                  Add New Restaurant
                </h2>
                <button
                  onClick={() => setShowAddRestaurantModal(false)}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddRestaurant} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter restaurant name"
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Description
                </label>
                <textarea
                  value={newRestaurant.description}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Brief description of your restaurant"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddRestaurantModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? t('admin.adding') : t('admin.addRestaurant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            border: '1px solid #fce7f3',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #fef7f0, #fce7f3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>
{t('admin.addNewStaff')}
                </h2>
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddStaff} style={{ 
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Form Fields in Two Columns */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Full Name *
                    </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter staff member full name"
                />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Phone Number *
                    </label>
                <input
                  type="tel"
                  required
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="+91-9876543210"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="staff@restaurant.com (used for login)"
                />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '8px' 
                    }}>
                      Address
                    </label>
                <textarea
                  value={newStaff.address}
                  onChange={(e) => setNewStaff({ ...newStaff, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Staff residential address"
                />
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Role *
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                >
                  {customRoles.map(role => {
                    // Only show admin option to owners
                    if (role === 'admin' && currentUserRole !== 'owner') {
                      return null;
                    }
                    return (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    );
                  })}
                  <option value="custom" style={{ fontStyle: 'italic', color: '#6b7280' }}>+ Add Custom Role</option>
                </select>
              </div>

              {/* Custom Role Input */}
              {newStaff.role === 'custom' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Custom Role Name *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newCustomRole}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (!['owner', 'admin'].includes(value)) {
                          setNewCustomRole(value);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#fef7f0',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                      }}
                      placeholder="supervisor, cashier, cook, etc."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCustomRole && !customRoles.includes(newCustomRole)) {
                          setCustomRoles([...customRoles, newCustomRole]);
                          setNewStaff({ ...newStaff, role: newCustomRole });
                          setNewCustomRole('');
                        }
                      }}
                      disabled={!newCustomRole || customRoles.includes(newCustomRole)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: newCustomRole && !customRoles.includes(newCustomRole) ? '#10b981' : '#d1d5db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: newCustomRole && !customRoles.includes(newCustomRole) ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Note: Cannot create &apos;owner&apos; or &apos;admin&apos; roles
                  </p>
                </div>
              )}

              {/* Page Access Controls */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '12px' 
                }}>
                  Page Access Permissions
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  {[
                    { key: 'dashboard', label: t('nav.dashboard'), icon: '🏠' },
                    { key: 'history', label: t('nav.history'), icon: '📋' },
                    { key: 'tables', label: t('nav.tables'), icon: '🪑' },
                    { key: 'menu', label: t('nav.menu'), icon: '🍽️' },
                    { key: 'analytics', label: t('nav.analytics'), icon: '📊' },
                    { key: 'inventory', label: t('nav.inventory'), icon: '📦' },
                    { key: 'kot', label: t('nav.kot'), icon: '👨‍🍳' },
                    { key: 'admin', label: t('nav.admin'), icon: '⚙️' }
                  ].map(({ key, label, icon }) => (
                    <label key={key} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: newStaff.pageAccess[key] ? '#dcfce7' : 'white',
                      border: `1px solid ${newStaff.pageAccess[key] ? '#10b981' : '#e5e7eb'}`,
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={newStaff.pageAccess[key]}
                        onChange={(e) => {
                          setNewStaff({
                            ...newStaff,
                            pageAccess: {
                              ...newStaff.pageAccess,
                              [key]: e.target.checked
                            }
                          });
                        }}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: '16px' }}>{icon}</span>
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: '500',
                        color: newStaff.pageAccess[key] ? '#059669' : '#374151'
                      }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0' }}>
                  {t('admin.selectPageAccess')}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  {t('admin.startDate')} *
                </label>
                <input
                  type="date"
                  required
                  value={newStaff.startDate}
                  onChange={(e) => setNewStaff({ ...newStaff, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: 'auto',
                paddingTop: '20px',
                borderTop: '1px solid #f3f4f6'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ec4899, #db2777)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Detail Modal — only when Staff tab is active */}
      {selectedStaff && activeTab === 'staff' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #fce7f3'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #fef7f0, #fce7f3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#ec4899',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaUsers color="white" size={18} />
                  </div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    Staff Details - {selectedStaff.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedStaff(null)}
                  style={{
                    color: '#6b7280',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Login Credentials - Full Width */}
              {(selectedStaff.loginId || selectedStaff.tempPassword) && (
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '16px',
                  marginBottom: '24px',
                  border: '1px solid #0ea5e9'
                }}>
                  <h3 style={{ 
                    fontWeight: '600', 
                    color: '#0c4a6e', 
                    marginBottom: '16px', 
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaKey size={16} />
                    Login Credentials
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* User ID */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FaIdBadge style={{ color: '#0ea5e9', fontSize: '16px' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>User ID</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: '700', 
                          color: '#0c4a6e',
                          backgroundColor: '#e0f2fe',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          flex: 1
                        }}>
                          {selectedStaff.loginId || 'N/A'}
                        </span>
                        {selectedStaff.loginId && (
                          <button
                            onClick={() => copyToClipboard(selectedStaff.loginId, 'userId', selectedStaff.id)}
                            style={{
                              backgroundColor: copiedCredentials[`${selectedStaff.id}_userId`] ? '#10b981' : '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                          >
                            <FaCopy size={12} />
                            {copiedCredentials[`${selectedStaff.id}_userId`] ? 'Copied!' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    {(selectedStaff.tempPassword || selectedStaff.password) && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <FaKey style={{ color: '#0ea5e9', fontSize: '16px' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>Password</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            color: '#0c4a6e',
                            backgroundColor: '#e0f2fe',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            flex: 1,
                            minWidth: '100px'
                          }}>
                            {showPassword[selectedStaff.id] 
                              ? (selectedStaff.tempPassword || selectedStaff.password || 'N/A')
                              : '••••••••'
                            }
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(selectedStaff.id)}
                            style={{
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                          >
                            {showPassword[selectedStaff.id] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                            {showPassword[selectedStaff.id] ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={() => copyToClipboard(selectedStaff.tempPassword || selectedStaff.password, 'password', selectedStaff.id)}
                            style={{
                              backgroundColor: copiedCredentials[`${selectedStaff.id}_password`] ? '#10b981' : '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                          >
                            <FaCopy size={12} />
                            {copiedCredentials[`${selectedStaff.id}_password`] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Staff Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{ 
                  backgroundColor: '#fef7f0', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid #fce7f3'
                }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '12px', fontSize: '16px' }}>Personal Information</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Name:</strong> {selectedStaff.name || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Phone:</strong> {selectedStaff.phone || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Email:</strong> {selectedStaff.email || 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Role:</strong> {getRoleInfo(selectedStaff.role || 'employee').label}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Status:</strong> {getStatusInfo(selectedStaff.status || 'active').label}</div>
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#fef7f0', 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: '1px solid #fce7f3'
                }}>
                  <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '12px', fontSize: '16px' }}>Work Information</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}><strong>Start Date:</strong> {selectedStaff.startDate ? new Date(selectedStaff.startDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                    <div style={{ marginBottom: '8px' }}><strong>Last Login:</strong> {formatDateTime(selectedStaff.lastLogin)}</div>
                    {(() => {
                      const stats = getPerformanceStats(selectedStaff);
                      return (
                        <>
                          <div style={{ marginBottom: '8px' }}><strong>{stats.todayLabel}:</strong> {stats.todayValue}</div>
                          <div style={{ marginBottom: '8px' }}><strong>{stats.totalLabel}:</strong> {stats.totalValue}</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              padding: '24px', 
              backgroundColor: '#fef7f0', 
              display: 'flex', 
              gap: '12px',
              borderTop: '1px solid #fce7f3'
            }}>
              <button
                onClick={() => setSelectedStaff(null)}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Close
              </button>
              <button style={{
                flex: 1,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <FaEdit size={14} />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Management Section */}
      {activeTab === 'tax' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '24px',
          border: '1px solid #fce7f3'
        }}>
          <TaxManagement 
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
          />
        </div>
      )}

      {/* Order Management Section */}
      {activeTab === 'order-management' && (
        <div style={{
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(236,72,153,0.06)',
            padding: '32px',
            border: '1px solid #fce7f3'
          }}>
            <div style={{
              marginBottom: '28px',
              paddingBottom: '20px',
              borderBottom: '1px solid #f3e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(236,72,153,0.35)'
                }}>
                  <FaReceipt size={22} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1f2937', margin: 0, letterSpacing: '-0.02em' }}>
                    Order numbering
                  </h2>
                  <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                    How order #1, #2, … are assigned
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Restaurant
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    style={{
                      background: selectedRestaurant?.id === restaurant.id ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#faf5f7',
                      color: selectedRestaurant?.id === restaurant.id ? 'white' : '#374151',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: selectedRestaurant?.id === restaurant.id ? 'none' : '1px solid #fce7f3',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedRestaurant?.id === restaurant.id ? '0 4px 12px rgba(236,72,153,0.25)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaStore size={14} />
                    {restaurant.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedRestaurant && (
              <div style={{
                backgroundColor: '#fef7f0',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #fce7f3',
                marginBottom: '24px'
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Numbering mode
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    backgroundColor: orderManagementSeqEnabled ? 'transparent' : 'white',
                    borderRadius: '12px',
                    border: `2px solid ${orderManagementSeqEnabled ? '#e5e7eb' : '#ec4899'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: orderManagementSeqEnabled ? 'none' : '0 2px 8px rgba(236,72,153,0.12)'
                  }}>
                    <input
                      type="radio"
                      name="orderMode"
                      checked={!orderManagementSeqEnabled}
                      onChange={() => setOrderManagementSeqEnabled(false)}
                      style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                    />
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>Daily reset</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>#1, #2 today → #1, #2 again tomorrow (default)</p>
                    </div>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 18px',
                    backgroundColor: orderManagementSeqEnabled ? 'white' : 'transparent',
                    borderRadius: '12px',
                    border: `2px solid ${orderManagementSeqEnabled ? '#ec4899' : '#e5e7eb'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: orderManagementSeqEnabled ? '0 2px 8px rgba(236,72,153,0.12)' : 'none'
                  }}>
                    <input
                      type="radio"
                      name="orderMode"
                      checked={orderManagementSeqEnabled}
                      onChange={() => setOrderManagementSeqEnabled(true)}
                      style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                    />
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>Sequential (never reset)</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>#1, #2, #3… forever</p>
                    </div>
                  </label>
                </div>
                <button
                  onClick={async () => {
                    if (!selectedRestaurant?.id) return;
                    setOrderManagementSaving(true);
                    try {
                      await apiClient.updateRestaurant(selectedRestaurant.id, {
                        orderSettings: { sequentialOrderIdEnabled: orderManagementSeqEnabled }
                      });
                      setRestaurants(prev => prev.map(r => r.id === selectedRestaurant.id ? { ...r, orderSettings: { ...(r.orderSettings || {}), sequentialOrderIdEnabled: orderManagementSeqEnabled } } : r));
                      setSelectedRestaurant(prev => prev && prev.id === selectedRestaurant.id ? { ...prev, orderSettings: { ...(prev.orderSettings || {}), sequentialOrderIdEnabled: orderManagementSeqEnabled } } : prev);
                      alert('Saved.');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to save. Please try again.');
                    } finally {
                      setOrderManagementSaving(false);
                    }
                  }}
                  disabled={orderManagementSaving}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    border: 'none',
                    cursor: orderManagementSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: orderManagementSaving ? '#9ca3af' : 'linear-gradient(135deg, #ec4899, #db2777)',
                    color: 'white',
                    boxShadow: orderManagementSaving ? 'none' : '0 4px 14px rgba(236,72,153,0.35)'
                  }}
                >
                  {orderManagementSaving ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <FaSave size={16} />}
                  {orderManagementSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}

            {!selectedRestaurant && restaurants.length > 0 && (
              <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Choose a restaurant above to set order numbering.</p>
            )}
            {!selectedRestaurant && restaurants.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>Add a restaurant first, then configure order numbering here.</p>
            )}
          </div>
        </div>
      )}

      {/* Shift Scheduling Section */}
      {activeTab === 'shifts' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '24px',
          border: '1px solid #fce7f3',
          minHeight: '600px'
        }}>
          {!selectedRestaurant ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <FaClock size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Select a Restaurant
              </h3>
              <p>Please select a restaurant from the dropdown above to manage shift schedules.</p>
            </div>
          ) : (
            <ShiftScheduling 
              restaurantId={selectedRestaurant.id}
              staff={staff.filter(s => s.status === 'active')}
            />
          )}
        </div>
      )}

      {/* Google Reviews Section */}
      {activeTab === 'google-reviews' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '24px',
          border: '1px solid #fce7f3',
          minHeight: '600px'
        }}>
          {!selectedRestaurant ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <FaGoogle size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Select a Restaurant
              </h3>
              <p>Please select a restaurant from the dropdown above to manage Google Reviews.</p>
            </div>
          ) : (
            <GoogleReviews 
              restaurantId={selectedRestaurant.id}
              restaurant={selectedRestaurant}
            />
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(100%);
          }
          to { 
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .mobile-modal {
            transform: translateY(0) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;