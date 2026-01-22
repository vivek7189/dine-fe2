'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPhone, 
  FaKey, 
  FaUtensils, 
  FaArrowRight,
  FaSpinner,
  FaCheck,
  FaEdit,
  FaTimes,
  FaChevronDown,
  FaSearch
} from 'react-icons/fa';
import { auth } from '../../../firebase';
import { 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import apiClient from '../../lib/api';
import { t } from '../../lib/i18n';
import RestaurantNameOnboarding from '../../components/RestaurantNameOnboarding';
import { redirectToSubdomain } from '../../utils/subdomain';

// Country data with flags and codes
const countries = [
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '+36' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', dialCode: '+40' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', dialCode: '+359' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', dialCode: '+385' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', dialCode: '+386' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', dialCode: '+421' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', dialCode: '+370' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', dialCode: '+371' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', dialCode: '+372' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', dialCode: '+357' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', dialCode: '+356' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', dialCode: '+352' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', dialCode: '+354' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', dialCode: '+377' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', dialCode: '+378' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦', dialCode: '+379' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', dialCode: '+376' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', dialCode: '+58' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', dialCode: '+593' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', dialCode: '+591' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', dialCode: '+595' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', dialCode: '+598' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾', dialCode: '+592' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷', dialCode: '+597' },
  { code: 'GF', name: 'French Guiana', flag: '🇬🇫', dialCode: '+594' },
  { code: 'FK', name: 'Falkland Islands', flag: '🇫🇰', dialCode: '+500' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵', dialCode: '+850' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '+886' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴', dialCode: '+853' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', dialCode: '+95' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', dialCode: '+855' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦', dialCode: '+856' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳', dialCode: '+673' },
  { code: 'TL', name: 'East Timor', flag: '🇹🇱', dialCode: '+670' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dialCode: '+92' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', dialCode: '+960' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', dialCode: '+975' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dialCode: '+977' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', dialCode: '+93' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷', dialCode: '+98' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', dialCode: '+964' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dialCode: '+973' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '+968' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', dialCode: '+967' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', dialCode: '+962' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', dialCode: '+961' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾', dialCode: '+963' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸', dialCode: '+970' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', dialCode: '+7' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', dialCode: '+998' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲', dialCode: '+993' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯', dialCode: '+992' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬', dialCode: '+996' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳', dialCode: '+976' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', dialCode: '+995' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲', dialCode: '+374' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', dialCode: '+994' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '+212' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', dialCode: '+216' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', dialCode: '+213' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾', dialCode: '+218' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', dialCode: '+249' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', dialCode: '+256' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', dialCode: '+255' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', dialCode: '+250' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮', dialCode: '+257' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯', dialCode: '+253' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', dialCode: '+252' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷', dialCode: '+291' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', dialCode: '+211' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫', dialCode: '+236' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩', dialCode: '+235' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', dialCode: '+237' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '+227' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲', dialCode: '+220' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', dialCode: '+245' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳', dialCode: '+224' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', dialCode: '+232' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', dialCode: '+231' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮', dialCode: '+225' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯', dialCode: '+229' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻', dialCode: '+238' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹', dialCode: '+239' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶', dialCode: '+240' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', dialCode: '+241' },
  { code: 'CG', name: 'Republic of the Congo', flag: '🇨🇬', dialCode: '+242' },
  { code: 'CD', name: 'Democratic Republic of the Congo', flag: '🇨🇩', dialCode: '+243' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴', dialCode: '+244' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', dialCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', dialCode: '+267' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦', dialCode: '+264' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿', dialCode: '+268' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸', dialCode: '+266' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', dialCode: '+261' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', dialCode: '+230' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', dialCode: '+248' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲', dialCode: '+269' },
  { code: 'YT', name: 'Mayotte', flag: '🇾🇹', dialCode: '+262' },
  { code: 'RE', name: 'Réunion', flag: '🇷🇪', dialCode: '+262' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', dialCode: '+258' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼', dialCode: '+265' }
];

const Login = () => {
  const router = useRouter();
  const [loginType, setLoginType] = useState('owner'); // 'owner' or 'staff'
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'email-login', 'email-register', 'email-otp'
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone', 'email', 'gmail'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [staffCredentials, setStaffCredentials] = useState({ loginId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Country selection state
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to India
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  
  // Firebase OTP state
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isFirebaseOTP, setIsFirebaseOTP] = useState(false);
  
  // Restaurant onboarding state
  const [showRestaurantOnboarding, setShowRestaurantOnboarding] = useState(false);
  
  // Demo auto-login state
  const [demoAutoLoginTriggered, setDemoAutoLoginTriggered] = useState(false);
  
  // Auto-submit state to prevent multiple submissions
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);

  // Check if user is already logged in and redirect
  useEffect(() => {
    const checkAuthStatus = () => {
      if (apiClient.isAuthenticated()) {
        const redirectPath = apiClient.getRedirectPath();
        console.log('🔄 User already authenticated, redirecting to:', redirectPath);
        router.replace(redirectPath);
      }
    };

    // Check immediately
    checkAuthStatus();

    // Also check when component mounts (for hydration)
    const timeoutId = setTimeout(checkAuthStatus, 100);
    
    return () => clearTimeout(timeoutId);
  }, [router]);

  // Demo auto-login functionality
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isDemo = urlParams.get('demo') === 'true';
      
      if (isDemo && !loading && !demoAutoLoginTriggered && step === 'phone') {
        console.log('🎭 Demo mode detected, skipping to OTP verification');
        setDemoAutoLoginTriggered(true);
        
        // Auto-fill demo credentials and go directly to OTP step
        setSelectedCountry(countries[0]); // India
        setPhoneNumber('9000000000');
        setStep('otp'); // Skip directly to OTP verification step
        setIsFirebaseOTP(false); // Use backend OTP for demo
        
        console.log('🎭 Demo credentials set:', { 
          country: countries[0].name, 
          dialCode: countries[0].dialCode, 
          phoneNumber: '9000000000',
          fullPhone: `${countries[0].dialCode}9000000000`
        });
        
        // Auto-submit after OTP is filled by the separate useEffect
        setTimeout(() => {
          if (!loading) {
            console.log('🎭 Auto-submitting demo login');
            console.log('🎭 Current phone state:', { phoneNumber, selectedCountry });
            
            // Use override OTP to bypass state timing issues
            console.log('🎭 Submitting with override OTP: 1234');
            handleOtpSubmit({ preventDefault: () => {} }, '1234');
          }
        }, 2000); // Wait for OTP to be filled by the other useEffect
      }
    }
  }, [loading, demoAutoLoginTriggered, step]);

  // Demo OTP auto-fill when step changes to OTP
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isDemo = urlParams.get('demo') === 'true';
      
      if (isDemo && step === 'otp' && !loading && demoAutoLoginTriggered && otp === '') {
        console.log('🎭 Demo mode: Step changed to OTP, filling OTP field');
        setOtp('1234');
      }
    }
  }, [step, loading, demoAutoLoginTriggered, otp]);

  // Auto-submit OTP when fully entered (for all accounts except demo)
  useEffect(() => {
    const isOtpComplete = isFirebaseOTP ? otp.length === 6 : otp.length === 4;
    const isDemoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true';
    
    if (isOtpComplete && !loading && !demoAutoLoginTriggered && !autoSubmitTriggered && !isDemoMode) {
      console.log('🎯 Auto-submitting OTP after full digits entered');
      setAutoSubmitTriggered(true); // Prevent multiple triggers
      
      // Add longer delay to ensure button is fully active and avoid race conditions
      setTimeout(() => {
        // Double-check that we're still in the right state before submitting
        if (!loading && isOtpComplete) {
          console.log('🎯 Executing auto-submit after delay');
          handleOtpSubmit({ preventDefault: () => {} });
        }
      }, 1000); // Increased delay to 1 second to avoid race conditions
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, isFirebaseOTP, loading, demoAutoLoginTriggered, autoSubmitTriggered]);

  // Setup Firebase reCAPTCHA
  useEffect(() => {
    if (step === 'phone') {
      setupRecaptcha();
    }
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [step]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('[data-country-dropdown]')) {
        setShowCountryDropdown(false);
        setCountrySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const setupRecaptcha = () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
      }
    } catch (error) {
      console.error("Error setting up RecaptchaVerifier:", error);
      setError("Failed to setup verification. Please refresh the page.");
    }
  };

  // Check if phone number is dummy account
  const isDummyAccount = (phone) => {
    return phone === '9000000000' || phone === '+919000000000';
  };

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.dialCode.includes(countrySearchTerm) ||
    country.code.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  // Format phone number - only allow digits
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    // Allow up to 15 digits (international standard)
    return numbers.slice(0, 15);
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    if (!phone) return 'Phone number is required';
    if (phone.length < 7) return 'Phone number is too short';
    if (phone.length > 15) return 'Phone number is too long';
    if (!/^\d+$/.test(phone)) return 'Phone number should only contain digits';
    return null;
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate phone number
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);
    
    try {
      // Check if it's a dummy account (only for India +91)
      if (selectedCountry.code === 'IN' && isDummyAccount(phoneNumber)) {
        // Use backend OTP for dummy account
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
        const response = await fetch(`${backendUrl}/api/auth/phone/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: `${selectedCountry.dialCode}${phoneNumber}` }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setIsFirebaseOTP(false);
          setStep('otp');
        } else {
          setError(data.message || 'Failed to send OTP');
        }
      } else {
        // Use Firebase OTP for real numbers with international format
        const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
        
        try {
          const appVerifier = window.recaptchaVerifier;
          const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
          
          setVerificationId(confirmationResult);
          setIsFirebaseOTP(true);
          setOtpSent(true);
          setStep('otp');
          setError('');
        } catch (firebaseError) {
          console.error('Firebase error:', firebaseError);
          if (firebaseError.code === 'auth/invalid-phone-number') {
            setError('Invalid phone number format');
          } else if (firebaseError.code === 'auth/too-many-requests') {
            setError('Too many requests. Please try again later.');
          } else if (firebaseError.code === 'auth/invalid-app-credential') {
            setError('App not configured for this phone number region');
          } else {
            setError('Failed to send verification code. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please check your phone number and try again.');
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e, overrideOtp = null) => {
    e.preventDefault();
    setError('');
    
    const currentOtp = overrideOtp || otp;
    console.log('🔍 OTP Submit Debug:', { otp: currentOtp, otpLength: currentOtp.length, isFirebaseOTP, expectedLength: isFirebaseOTP ? 6 : 4 });
    
    if (!currentOtp || (isFirebaseOTP ? currentOtp.length !== 6 : currentOtp.length !== 4)) {
      console.log('❌ OTP validation failed:', { otp: currentOtp, otpLength: currentOtp.length, isFirebaseOTP });
      setError(`Please enter a valid ${isFirebaseOTP ? '6' : '4'}-digit OTP`);
      return;
    }

    setLoading(true);
    
    try {
      if (isFirebaseOTP) {
        // Verify Firebase OTP
        const result = await verificationId.confirm(otp);
        
        // Call backend to get JWT token
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
        const firebaseResponse = await fetch(`${backendUrl}/api/auth/firebase/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: result.user.uid,
            phoneNumber: result.user.phoneNumber,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
          }),
        });

        const firebaseData = await firebaseResponse.json();
        
        if (firebaseResponse.ok) {
          // Store auth token and user data in both cookie (for cross-subdomain) and localStorage
          apiClient.setToken(firebaseData.token); // Stores in both cookie and localStorage
          apiClient.setUser(firebaseData.user); // Stores in both cookie and localStorage
          
          // Handle first-time user experience
          if (firebaseData.firstTimeUser) {
            console.log('🎉 First-time user detected!');
            // Show restaurant name onboarding
            setShowRestaurantOnboarding(true);
          } else {
            // Redirect existing users
            if (firebaseData.subdomainUrl) {
              // Redirect to subdomain with token and user data
              redirectToSubdomain(firebaseData.subdomainUrl, firebaseData.token, firebaseData.user);
            } else if (firebaseData.redirectTo) {
              router.replace(firebaseData.redirectTo);
            } else {
              router.replace('/dashboard');
            }
          }
        } else {
          setError(firebaseData.message || 'Failed to verify with backend');
        }
      } else {
        // Verify backend OTP (for dummy account)
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
        
        // Ensure we have the correct phone number for demo mode
        const actualPhoneNumber = phoneNumber || '9000000000';
        const fullPhoneNumber = `${selectedCountry?.dialCode || '+91'}${actualPhoneNumber}`;
        
        console.log('🔍 Backend OTP verification:', { 
          phoneNumber, 
          actualPhoneNumber,
          fullPhoneNumber, 
          otp: currentOtp, 
          selectedCountry,
          dialCode: selectedCountry?.dialCode,
          countryCode: selectedCountry?.code
        });
        
        const response = await fetch(`${backendUrl}/api/auth/phone/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: fullPhoneNumber, otp: currentOtp }),
        });

        const data = await response.json();
        
        if (response.ok) {
          // Store auth token in both cookie (for cross-subdomain) and localStorage
          apiClient.setToken(data.token); // Stores in both cookie and localStorage
          apiClient.setUser(data.user); // Stores in both cookie and localStorage
          
          // Handle first-time user experience
          if (data.firstTimeUser) {
            console.log('🎉 First-time phone user detected!');
            // Show restaurant name onboarding
            setShowRestaurantOnboarding(true);
          } else {
            // Redirect existing users
            if (data.subdomainUrl) {
              // Redirect to subdomain with token
              redirectToSubdomain(data.subdomainUrl, data.token, data.user);
            } else if (data.redirectTo) {
              router.replace(data.redirectTo);
            } else {
              router.replace('/dashboard');
            }
          }
        } else {
          setError(data.message || 'Invalid OTP');
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(''); // Clear error when user starts typing
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setCountrySearchTerm('');
    setError(''); // Clear error when country changes
  };

  const handleOtpChange = (e) => {
    const maxLength = isFirebaseOTP ? 6 : 4;
    const value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    setOtp(value);
  };

  const resetOtpState = () => {
    setOtp('');
    setOtpSent(false);
    setVerificationId(null);
    setIsFirebaseOTP(false);
    setStep('phone');
    setAutoSubmitTriggered(false); // Reset auto-submit state
  };

  // Restaurant onboarding handlers
  const handleRestaurantOnboardingComplete = (restaurant) => {
    console.log('✅ Restaurant created:', restaurant);
    setShowRestaurantOnboarding(false);
    // Redirect to dashboard
    router.replace('/dashboard');
  };

  const handleRestaurantOnboardingSkip = () => {
    console.log('⏭️ Restaurant onboarding skipped');
    setShowRestaurantOnboarding(false);
    // Redirect to dashboard
    router.replace('/dashboard');
  };

  // Email/Password Registration
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password || !confirmPassword || !name) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // First send OTP
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const otpResponse = await fetch(`${backendUrl}/api/auth/email/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'registration' })
      });

      let otpData;
      try {
        otpData = await otpResponse.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }

      if (!otpResponse.ok) {
        const errorMessage = otpData?.error || otpData?.message || `Failed to send OTP (${otpResponse.status})`;
        console.error('Email OTP send error:', errorMessage, otpData);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      setEmailOtpSent(true);
      setStep('email-otp');
      setLoading(false);
    } catch (err) {
      console.error('Email registration error:', err);
      const errorMessage = err.message || 'Failed to send verification email';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Verify Email OTP and Complete Registration
  const handleEmailOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!emailOtp || emailOtp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const registerResponse = await fetch(`${backendUrl}/api/auth/email/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          name,
          otp: emailOtp
        })
      });

      let registerData;
      try {
        registerData = await registerResponse.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      if (!registerResponse.ok) {
        const errorMessage = registerData?.error || registerData?.message || `Registration failed (${registerResponse.status})`;
        console.error('Email registration error:', errorMessage, registerData);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (registerData.token) {
        apiClient.setToken(registerData.token);
        apiClient.setUser(registerData.user);

        if (registerData.firstTimeUser) {
          setShowRestaurantOnboarding(true);
        } else {
          router.replace(registerData.redirectTo || '/dashboard');
        }
      } else {
        setError('Registration successful but login failed. Please login.');
        setStep('email-login');
      }
    } catch (err) {
      console.error('Email OTP verification error:', err);
      setError(err.message || 'OTP verification failed');
      setLoading(false);
    }
  };

  // Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const loginResponse = await fetch(`${backendUrl}/api/auth/email/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let loginData;
      try {
        loginData = await loginResponse.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      if (!loginResponse.ok) {
        if (loginData.verificationRequired) {
          // Email not verified - send OTP
          const otpResponse = await fetch(`${backendUrl}/api/auth/email/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, purpose: 'linking' })
          });
          const otpData = await otpResponse.json();
          if (otpResponse.ok) {
            setStep('email-otp');
            setEmailOtpSent(true);
            setError('Please verify your email with the OTP sent to your inbox');
            setLoading(false);
            return;
          } else {
            const errorMessage = otpData.error || otpData.message || 'Failed to send verification OTP';
            setError(errorMessage);
            setLoading(false);
            return;
          }
        } else {
          const errorMessage = loginData.error || loginData.message || 'Login failed';
          console.error('Email login error:', errorMessage);
          setError(errorMessage);
          setLoading(false);
          return;
        }
      }

      if (loginData.token) {
        apiClient.setToken(loginData.token);
        apiClient.setUser(loginData.user);

        if (loginData.subdomainUrl) {
          redirectToSubdomain(loginData.subdomainUrl, loginData.token, loginData.user);
        } else {
          router.replace(loginData.redirectTo || '/dashboard');
        }
      }
    } catch (err) {
      console.error('Email login error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const provider = new GoogleAuthProvider();
      // Add additional scopes for better user data
      provider.addScope('email');
      provider.addScope('profile');
      
      // Add custom parameters to handle popup issues
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      
      console.log('Google login result:', result.user);
      
      // Send user data to backend (Firebase already verified the user)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const googleResponse = await fetch(`${backendUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          picture: result.user.photoURL
        }),
      });

      const googleData = await googleResponse.json();
      
      if (googleResponse.ok) {
        // Store auth token and user data in both cookie (for cross-subdomain) and localStorage
        apiClient.setToken(googleData.token); // Stores in both cookie and localStorage
        apiClient.setUser(googleData.user); // Stores in both cookie and localStorage
        
        console.log('Google login successful:', googleData);
        console.log('Is new user:', googleData.isNewUser);
        console.log('First time user:', googleData.firstTimeUser);
        console.log('Has restaurants:', googleData.hasRestaurants);
        
        // Handle first-time user experience
        if (googleData.firstTimeUser) {
          console.log('🎉 First-time Google user detected!');
          // Show restaurant name onboarding
          setShowRestaurantOnboarding(true);
        } else {
          // For existing users, fetch restaurants if they have any
          if (googleData.hasRestaurants) {
            try {
              // Fetch user's restaurants
              const restaurantsResponse = await fetch(`${backendUrl}/api/restaurants`, {
                headers: {
                  'Authorization': `Bearer ${googleData.token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (restaurantsResponse.ok) {
                const restaurantsData = await restaurantsResponse.json();
                if (restaurantsData.restaurants && restaurantsData.restaurants.length > 0) {
                  localStorage.setItem('selectedRestaurant', JSON.stringify(restaurantsData.restaurants[0]));
                  localStorage.setItem('selectedRestaurantId', restaurantsData.restaurants[0].id);
                }
              }
            } catch (restaurantError) {
              console.error('Error fetching restaurants:', restaurantError);
            }
          }
          
          // Redirect existing users
          if (googleData.subdomainUrl) {
            // Redirect to subdomain with token
            redirectToSubdomain(googleData.subdomainUrl, googleData.token, googleData.user);
          } else if (googleData.redirectTo) {
            router.replace(googleData.redirectTo);
          } else {
            router.replace('/dashboard');
          }
        }
      } else {
        setError(googleData.error || googleData.message || 'Google login failed');
      }

    } catch (error) {
      console.error('Google login error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Login cancelled. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else if (error.message && error.message.includes('Cross-Origin-Opener-Policy')) {
        // Ignore COOP errors as they don't affect functionality
        console.warn('COOP policy warning (non-critical):', error.message);
        setError('Google login failed. Please try again.');
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!staffCredentials.loginId || !staffCredentials.password) {
      setError('Please enter both User ID and password');
      return;
    }

    setLoading(true);
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      const response = await fetch(`${backendUrl}/api/auth/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: staffCredentials.loginId,
          password: staffCredentials.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store auth token in both cookie (for cross-subdomain) and localStorage
        apiClient.setToken(data.token);
        
        // Store user data with restaurant and owner info
        const userData = {
          ...data.user,
          restaurant: data.restaurant,
          owner: data.owner
        };
        apiClient.setUser(userData); // Stores in both cookie and localStorage
        
        // Staff goes to main POS page
        router.replace('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh",
      backgroundColor: "#fef7f0",
      display: "flex",
      flexDirection: "column", // Changed to column to accommodate header
      alignItems: "center",
      // justifyContent: "center", // Removed to allow custom spacing
      padding: "0" // Reset padding to handle header
    }}
    >
      {/* Small Header for Home Navigation */}
      <div style={{
        width: '100%',
        padding: '12px 20px',
        backgroundColor: 'white',
        borderBottom: '1px solid #fed7aa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <Link 
          href="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            textDecoration: 'none',
            cursor: 'pointer' 
          }}
        >
          <div style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #e53e3e, #dc2626)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <FaUtensils size={14} />
          </div>
          <span style={{ 
            fontWeight: '800', 
            fontSize: '18px', 
            color: '#1f2937',
            letterSpacing: '-0.5px' 
          }}>
            DineOpen
          </span>
        </Link>
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "80px 20px 20px 20px" // Add top padding for fixed header
      }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              width: "100%",
              maxWidth: "400px",
              overflow: "hidden",
              border: "1px solid #d1d5db",
              padding: "20px"
            }}
            className="sm:p-5 p-3"
            >
        {/* Demo Mode Banner */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true' && (
          <div style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "12px 16px",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "6px 6px 0 0",
            margin: "-20px -20px 0 -20px",
            borderBottom: "2px solid #2563eb"
          }}>
            🎭 Demo Mode - Auto-login to OTP verification...
          </div>
        )}

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #e53e3e, #dc2626)",
          padding: "20px 16px",
          textAlign: "center",
          color: "white",
          borderRadius: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true' ? "0" : "6px 6px 0 0",
          margin: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true' ? "-20px -20px 20px -20px" : "-20px -20px 20px -20px"
        }}
        className="sm:p-5 p-3 sm:-m-5 -m-3 sm:mb-5 mb-3"
        >
          <div style={{
            width: "60px",
            height: "60px",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            backdropFilter: "blur(10px)"
          }}
          className="sm:w-15 sm:h-15 w-10 h-10"
          >
            <FaUtensils size={24} className="sm:text-2xl text-lg" />
          </div>
          <h1 style={{
            fontSize: "22px",
            fontWeight: "bold",
            margin: "0 0 4px 0"
          }}
          className="sm:text-xl text-lg"
          >
            {t('login.title')}
          </h1>
          <p style={{
            fontSize: "14px",
            opacity: 0.9,
            margin: 0
          }}
          className="sm:text-sm text-xs"
          >
            {t('login.subtitle')}
          </p>
        </div>

        {/* Login Type Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9' }}>
          <button
            onClick={() => {
              setLoginType('owner');
              setStep('phone');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              backgroundColor: loginType === 'owner' ? '#e53e3e' : 'transparent',
              color: loginType === 'owner' ? 'white' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%' // Make it take full width since staff tab is hidden
            }}
            className="sm:text-base text-sm"
          >
{t('login.restaurantOwner')}
          </button>
          <button
            onClick={() => {
              setLoginType('staff');
              setStep('staff-login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              backgroundColor: loginType === 'staff' ? '#e53e3e' : 'transparent',
              color: loginType === 'staff' ? 'white' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'none' // Hide staff login tab
            }}
            className="sm:text-base text-sm"
          >
{t('login.staffMember')}
          </button>
        </div>
  
        {/* Login Form */}
        <div style={{ padding: "16px 0" }}>
          {error && (
            <div style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              {error}
            </div>
          )}

          {/* Auth Method Selector for Owner Login - Always visible for Phone/Email */}
          {loginType === 'owner' && (step === 'phone' || step === 'otp' || step === 'email-login' || step === 'email-register' || step === 'email-otp') && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '4px',
                backgroundColor: '#f9fafb'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setStep('phone');
                    setError('');
                    setOtp('');
                    setOtpSent(false);
                    setEmailOtpSent(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: (authMethod === 'phone' || step === 'phone' || step === 'otp') ? '#e53e3e' : 'transparent',
                    color: (authMethod === 'phone' || step === 'phone' || step === 'otp') ? 'white' : '#6b7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <FaPhone style={{ marginRight: '8px', display: 'inline' }} />
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setStep('email-login');
                    setError('');
                    setOtp('');
                    setOtpSent(false);
                    setEmailOtpSent(false);
                    setIsRegistering(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: (authMethod === 'email' || step === 'email-login' || step === 'email-register' || step === 'email-otp') ? '#e53e3e' : 'transparent',
                    color: (authMethod === 'email' || step === 'email-login' || step === 'email-register' || step === 'email-otp') ? 'white' : '#6b7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📧 Email
                </button>
              </div>
            </div>
          )}

          {loginType === 'owner' && step === "phone" ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}
              className="sm:mb-8 mb-4"
              >
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#fef7f0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "2px solid #fed7aa"
                }}
                className="sm:w-15 sm:h-15 w-10 h-10"
                >
                  <FaPhone size={24} className="sm:text-2xl text-lg" />
                </div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 8px 0"
                }}
                className="sm:text-2xl text-lg"
                >
                  {t('login.phoneLogin')}
                </h2>
                <p style={{
                  color: "#6b7280",
                  margin: 0,
                  fontSize: "14px"
                }}
                className="sm:text-sm text-xs sm:block hidden"
                >
                  {t('login.enterPhone')}
                </p>
              </div>
  
              <form onSubmit={handlePhoneSubmit}>
                <div style={{ marginBottom: "16px" }}
                className="sm:mb-4 mb-3"
                >
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "6px"
                  }}
                  className="sm:text-sm text-xs"
                  >
{t('common.phone')}
                  </label>
                  <div style={{ position: "relative" }}>
                    {/* Unified Phone Input Container */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      border: error ? "2px solid #ef4444" : "2px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      transition: "border-color 0.2s"
                    }}>
                      {/* Country Code Selector */}
                      <div style={{ position: "relative" }}>
                        <div
                          data-country-dropdown
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "12px 16px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                            minWidth: "90px",
                            borderRight: "1px solid #e5e7eb",
                            borderTopLeftRadius: "6px",
                            borderBottomLeftRadius: "6px",
                            transition: "background-color 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f9fafb";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "white";
                          }}
                        >
                          <span style={{ fontSize: "16px" }}>{selectedCountry.flag}</span>
                          <span style={{ fontSize: "12px", fontWeight: "600" }}>{selectedCountry.dialCode}</span>
                          <FaChevronDown style={{ 
                            fontSize: "10px", 
                            color: "#6b7280",
                            transform: showCountryDropdown ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s"
                          }} />
                        </div>

                        {/* Country Dropdown */}
                        {showCountryDropdown && (
                          <div 
                            data-country-dropdown
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: "0",
                              width: "320px",
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
                              maxHeight: "280px",
                              overflowY: "auto",
                              zIndex: 1000,
                              marginTop: "4px"
                            }}>
                            {/* Search Input */}
                            <div style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}>
                              <div style={{ position: "relative" }}>
                                <FaSearch style={{
                                  position: "absolute",
                                  left: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#9ca3af",
                                  fontSize: "12px"
                                }} />
                                <input
                                  type="text"
                                  placeholder="Search countries..."
                                  value={countrySearchTerm}
                                  onChange={(e) => setCountrySearchTerm(e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "8px 8px 8px 28px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    outline: "none",
                                    backgroundColor: "#f9fafb"
                                  }}
                                />
                              </div>
                            </div>

                            {/* Country List */}
                            <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                              {filteredCountries.map((country) => (
                                <div
                                  key={country.code}
                                  onClick={() => handleCountrySelect(country)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    borderBottom: "1px solid #f8fafc",
                                    transition: "all 0.15s ease",
                                    color: "#374151"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = "#f1f5f9";
                                    e.target.style.color = "#1f2937";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = "white";
                                    e.target.style.color = "#374151";
                                  }}
                                >
                                  <span style={{ fontSize: "18px", minWidth: "24px" }}>{country.flag}</span>
                                  <span style={{ flex: 1, fontWeight: "500", fontSize: "14px" }}>{country.name}</span>
                                  <span style={{ color: "#6b7280", fontWeight: "600", fontSize: "13px" }}>{country.dialCode}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Phone Number Input */}
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          border: "none",
                          fontSize: "16px",
                          outline: "none",
                          backgroundColor: "transparent",
                          letterSpacing: "1px",
                          borderTopRightRadius: "6px",
                          borderBottomRightRadius: "6px"
                        }}
                      />
                    </div>
                  </div>
                  {/* Phone Number Validation */}
                  {phoneNumber && ((selectedCountry.code === 'IN' && phoneNumber.length >= 10) || (selectedCountry.code !== 'IN' && phoneNumber.length >= 7)) && !error && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "4px",
                      color: "#10b981",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      <FaCheck size={10} />
                      {selectedCountry.code === 'IN' ? 'Ready to send OTP' : 'Valid phone number'}
                    </div>
                  )}
                  
                  {/* Error Display */}
                  {error && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "4px",
                      color: "#ef4444",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      <FaTimes size={10} />
                      {error}
                    </div>
                  )}
                </div>
  
  
                <button
                  type="submit"
                  disabled={loading || (selectedCountry.code === 'IN' && phoneNumber.length < 10)}
                  style={{
                    width: "100%",
                    backgroundColor: (selectedCountry.code === 'IN' ? phoneNumber.length >= 10 : phoneNumber.length >= 7) && !loading ? "#e53e3e" : "#e5e7eb",
                    color: (selectedCountry.code === 'IN' ? phoneNumber.length >= 10 : phoneNumber.length >= 7) && !loading ? "white" : "#9ca3af",
                    padding: "16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "16px",
                    border: (selectedCountry.code === 'IN' ? phoneNumber.length >= 10 : phoneNumber.length >= 7) && !loading ? "2px solid #e53e3e" : "2px solid #d1d5db",
                    cursor: (selectedCountry.code === 'IN' ? phoneNumber.length >= 10 : phoneNumber.length >= 7) && !loading ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "16px"
                  }}
                  className="sm:p-4 p-3 sm:text-base text-sm sm:mt-4 mt-3"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <FaArrowRight size={16} />
                  )}
                  {loading ? t('login.sendingOtp') : t('login.sendOtp')}
                </button>
              </form>

              {/* Google Login Button */}
              <div style={{ marginTop: '24px' }}
              className="sm:mt-6 mt-4"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
                className="sm:mb-4 mb-3"
                >
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                  <span style={{
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#6b7280',
                    backgroundColor: 'white',
                    fontWeight: '500'
                  }}
                  className="sm:text-sm text-xs"
                  >
{t('login.orContinueWith')}
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1
                  }}
                  className="sm:p-4 p-3 sm:text-base text-sm"
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? t('login.signingIn') : t('login.googleLogin')}
                </button>
                
                <div style={{
                  marginTop: '12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <p style={{ margin: 0 }}>
{t('login.googleDescription')}
                  </p>
                </div>
              </div>
            </>
          ) : loginType === 'owner' && step === 'otp' ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#fef7f0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "2px solid #fed7aa"
                }}>
                  <FaKey size={24} style={{ color: "#e53e3e" }} />
                </div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 8px 0"
                }}>
{t('login.enterOtp')}
                </h2>
                <p style={{
                  color: "#6b7280",
                  margin: 0,
                  fontSize: "14px"
                }}>
                  We have sent a {isFirebaseOTP ? '6' : '4'}-digit code to +91 {phoneNumber}
                </p>
              </div>

              {/* Phone number display with edit option */}
              <div style={{ 
                marginBottom: "24px", 
                padding: "12px", 
                backgroundColor: "#f9fafb", 
                borderRadius: "8px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaPhone style={{ color: "#6b7280" }} />
                  <span style={{ fontWeight: "500", color: "#374151" }}>+91 {phoneNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={resetOtpState}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3b82f6",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <FaEdit size={14} />
                  <span style={{ fontSize: "12px" }}>Edit</span>
                </button>
              </div>
  
              <form onSubmit={handleOtpSubmit}>
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder={isFirebaseOTP ? "123456" : "1234"}
                    maxLength={isFirebaseOTP ? 6 : 4}
                    style={{
                      width: "100%",
                      padding: "16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "24px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      letterSpacing: "8px",
                      textAlign: "center",
                      fontWeight: "bold"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#e53e3e";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.backgroundColor = "#fef7f0";
                    }}
                  />
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "12px"
                  }}>
                    {!isFirebaseOTP && (
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280"
                      }}>
                        For testing use: <strong style={{ color: "#e53e3e" }}>1234 </strong>
                      </div>
                    )}
                  </div>
                </div>
  
  
                <button
                  type="submit"
                  disabled={loading || (isFirebaseOTP ? otp.length !== 6 : otp.length !== 4)}
                  style={{
                    width: "100%",
                    background: ((isFirebaseOTP ? otp.length === 6 : otp.length === 4) && !loading)
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#d1d5db",
                    color: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "none",
                    cursor: ((isFirebaseOTP ? otp.length === 6 : otp.length === 4) && !loading) ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <FaCheck size={16} />
                  )}
                  {loading ? "Verifying..." : "Verify and Login"}
                </button>
              </form>
            </>
          ) : loginType === 'owner' && step === 'email-login' ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#fef7f0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "2px solid #fed7aa"
                }}>
                  📧
                </div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 8px 0"
                }}>
                  Email Login
                </h2>
                <p style={{
                  color: "#6b7280",
                  margin: 0,
                  fontSize: "14px"
                }}>
                  Login with your email and password
                </p>
              </div>

              <form onSubmit={handleEmailLogin}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  style={{
                    width: "100%",
                    background: !loading && email && password
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#d1d5db",
                    color: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "none",
                    cursor: !loading && email && password ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "16px"
                  }}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <FaArrowRight size={16} />
                  )}
                  {loading ? "Logging in..." : "Login"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setStep('email-register');
                    setError('');
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "#e53e3e",
                    padding: "12px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "2px solid #e53e3e",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Don&apos;t have an account? Register
                </button>
              </form>
            </>
          ) : loginType === 'owner' && step === 'email-register' ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#fef7f0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "2px solid #fed7aa"
                }}>
                  📧
                </div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 8px 0"
                }}>
                  Create Account
                </h2>
                <p style={{
                  color: "#6b7280",
                  margin: 0,
                  fontSize: "14px"
                }}>
                  Register with email and password
                </p>
              </div>

              <form onSubmit={handleEmailRegister}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password || !confirmPassword || !name}
                  style={{
                    width: "100%",
                    background: !loading && email && password && confirmPassword && name
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#d1d5db",
                    color: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "none",
                    cursor: !loading && email && password && confirmPassword && name ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "16px"
                  }}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <FaArrowRight size={16} />
                  )}
                  {loading ? "Sending OTP..." : "Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setStep('email-login');
                    setError('');
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "#e53e3e",
                    padding: "12px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "2px solid #e53e3e",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Already have an account? Login
                </button>
              </form>
            </>
          ) : loginType === 'owner' && step === 'email-otp' ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#fef7f0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "2px solid #fed7aa"
                }}>
                  📧
                </div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 8px 0"
                }}>
                  Verify Email
                </h2>
                <p style={{
                  color: "#6b7280",
                  margin: 0,
                  fontSize: "14px"
                }}>
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <form onSubmit={handleEmailOtpVerify}>
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    style={{
                      width: "100%",
                      padding: "16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "24px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      letterSpacing: "8px",
                      textAlign: "center",
                      fontWeight: "bold"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#e53e3e";
                      e.target.style.backgroundColor = "white";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.backgroundColor = "#fef7f0";
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || emailOtp.length !== 6}
                  style={{
                    width: "100%",
                    background: (emailOtp.length === 6 && !loading)
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#d1d5db",
                    color: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "none",
                    cursor: (emailOtp.length === 6 && !loading) ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "16px"
                  }}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <FaCheck size={16} />
                  )}
                  {loading ? "Verifying..." : "Verify and Continue"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
                      await fetch(`${backendUrl}/api/auth/email/send-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          email, 
                          purpose: isRegistering ? 'registration' : 'linking' 
                        })
                      });
                      setError('');
                    } catch (err) {
                      setError('Failed to resend OTP');
                    }
                    setLoading(false);
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "#e53e3e",
                    padding: "12px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "2px solid #e53e3e",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Resend OTP
                </button>
              </form>
            </>
          ) : loginType === 'staff' && step === 'staff-login' ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#fef7f0",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  border: "2px solid #fed7aa"
                }}>
                  <FaKey size={24} style={{ color: "#e53e3e" }} />
                </div>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 8px 0"
                }}>
                  Staff Login
                </h2>
                <p style={{
                  color: "#6b7280",
                  margin: 0,
                  fontSize: "14px"
                }}>
                  Enter your login credentials provided by your manager
                </p>
              </div>

              <form onSubmit={handleStaffLogin}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    User ID
                  </label>
                  <input
                    type="text"
                    value={staffCredentials.loginId}
                    onChange={(e) => setStaffCredentials({
                      ...staffCredentials,
                      loginId: e.target.value
                    })}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="12345"
                    required
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={staffCredentials.password}
                    onChange={(e) => setStaffCredentials({
                      ...staffCredentials,
                      password: e.target.value
                    })}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      backgroundColor: "#fef7f0",
                      transition: "all 0.2s",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !staffCredentials.loginId || !staffCredentials.password}
                  style={{
                    width: "100%",
                    background: !loading && staffCredentials.loginId && staffCredentials.password
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#d1d5db",
                    color: "white",
                    padding: "16px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "16px",
                    border: "none",
                    cursor: !loading && staffCredentials.loginId && staffCredentials.password ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" size={16} />
                  ) : (
                    <FaArrowRight size={16} />
                  )}
                  {loading ? "Logging in..." : "Login to POS"}
                </button>
              </form>
            </>
          ) : null}
        </div>
  
        {/* Footer */}
        <div style={{
          padding: "20px 24px",
          backgroundColor: "#fef7f0",
          borderTop: "1px solid #fed7aa",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "12px",
            color: "#6b7280",
            margin: 0
          }}>
            Secure login powered by OTP verification
          </p>
        </div>
      </div>
      {/* End of card container */}
    </div>
      
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
      
      {/* Restaurant Name Onboarding Modal */}
      {showRestaurantOnboarding && (
        <RestaurantNameOnboarding
          onComplete={handleRestaurantOnboardingComplete}
          onSkip={handleRestaurantOnboardingSkip}
        />
      )}
    </div>
  );  
};

export default Login;