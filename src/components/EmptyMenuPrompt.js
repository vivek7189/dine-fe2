'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaPlus,
  FaCloudUploadAlt,
  FaCamera,
  FaImage,
  FaSpinner,
  FaCheckCircle,
  FaTimes,
  FaMagic,
  FaPlay,
  FaEye
} from 'react-icons/fa';
import apiClient from '../lib/api';

const EmptyMenuPrompt = ({ restaurantName, selectedRestaurant, onAddMenu, onMenuItemsAdded, onPreviewDemo }) => {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [processingStep, setProcessingStep] = useState('');
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Handle demo preview - fetch demo menu and store in sessionStorage
  const handlePreviewDemo = async () => {
    setLoadingDemo(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.dineopen.com'}/api/demo-menu`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load demo');
      }

      if (data.menuItems?.length > 0) {
        sessionStorage.setItem('dineopen_demo_menu', JSON.stringify({
          menuItems: data.menuItems,
          categories: data.categories || [],
          timestamp: Date.now()
        }));

        if (onPreviewDemo) {
          onPreviewDemo(data.menuItems, data.categories);
        }
      }
    } catch (error) {
      console.error('Error loading demo:', error);
    } finally {
      setLoadingDemo(false);
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleAddMenu = () => {
    setIsAnimating(true);
    setTimeout(() => {
      router.push('/menu');
    }, 300);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setUploadError(''); // Clear any previous errors
    setProcessingStep(''); // Clear processing step
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    console.log('📁 Files selected:', files.map(f => f.name));
    console.log('🔄 Starting upload process...');
    
    // Show immediate feedback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Menu Upload Started', {
        body: `Uploading ${files.length} file(s) to DineOpen`,
        icon: '/favicon.ico'
      });
    }
    
    setUploading(true);
    setUploadSuccess(false);
    setUploadError('');
    setShowUploadModal(true); // Ensure modal is visible during upload

    try {
      // Get restaurant ID from localStorage or create one if needed
      let currentRestaurant = selectedRestaurant;
      let restaurantId = currentRestaurant?.id;

      // If no restaurant exists, don't auto-create — ask user to set up first
      if (!restaurantId) {
        setUploadError('Please set up your restaurant first before uploading a menu.');
        setUploading(false);
        return;
      }

      // Step 1: Upload files
      setProcessingStep('Uploading menu images...');
      console.log('📤 Uploading files:', files.map(f => f.name));
      console.log('🔍 Using restaurant ID for upload:', restaurantId);
      console.log('🔍 Current restaurant:', currentRestaurant);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('menuFiles', file); // Backend expects 'menuFiles' field name
      });

      // Call the bulk upload API using the correct method
      const response = await apiClient.bulkUploadMenu(restaurantId, formData);

      if (response.success) {
        // Step 2: AI Processing
        setProcessingStep('AI is analyzing your menu...');
        console.log('🤖 AI is processing the uploaded menu images...');
        
        // Process extraction results
        if (response.data && response.data.length > 0) {
          const allMenuItems = response.data.flatMap(menu => menu.menuItems);
          const extractionResults = response.data;
          
          // Check extraction status for each file
          const noMenuDataFiles = extractionResults.filter(result => result.extractionStatus === 'no_menu_data');
          const failedFiles = extractionResults.filter(result => result.extractionStatus === 'failed');
          const successfulFiles = extractionResults.filter(result => result.extractionStatus === 'success');
          
          if (allMenuItems.length > 0) {
            // Step 3: Save to database
            setProcessingStep('Saving menu items to database...');
            console.log('💾 Saving extracted menu items to database...');
            console.log('🔍 Restaurant ID for save:', restaurantId);
            console.log('🔍 Number of items to save:', allMenuItems.length);
            
            try {
              const saveResponse = await apiClient.bulkSaveMenuItems(restaurantId, allMenuItems, response.extractedCategories || []);
              
              if (saveResponse.savedCount > 0) {
                console.log(`✅ Successfully saved ${saveResponse.savedCount} menu items to database`);
                
                // Create detailed success message
                let successMessage = `✅ ${saveResponse.savedCount} menu items extracted and saved successfully!`;
                
                if (successfulFiles.length > 0) {
                  successMessage += `\n📄 Files processed: ${successfulFiles.map(f => f.file).join(', ')}`;
                }
                
                if (noMenuDataFiles.length > 0) {
                  successMessage += `\n⚠️ No menu data found in: ${noMenuDataFiles.map(f => f.file).join(', ')}`;
                }
                
                if (failedFiles.length > 0) {
                  successMessage += `\n❌ Failed to process: ${failedFiles.map(f => f.file).join(', ')}`;
                }
                
                // Step 4: Final success
                setProcessingStep(successMessage);
                setUploadSuccess(true);
                setUploading(false);
                
                // Show success notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('🎉 Menu Upload Complete!', {
                    body: `Successfully added ${saveResponse.savedCount} menu items to your restaurant!`,
                    icon: '/favicon.ico'
                  });
                }
                
                // Show notification if processing in background
                if (backgroundProcessing) {
                  // Reset background processing state
                  setBackgroundProcessing(false);
                }
                
                setTimeout(() => {
                  setShowUploadModal(false);
                  setUploading(false);
                  setUploadSuccess(false);
                  setProcessingStep('');
                  if (onMenuItemsAdded) {
                    onMenuItemsAdded();
                  }
                }, 3000);
              } else {
                throw new Error('Failed to save menu items to database');
              }
            } catch (saveError) {
              console.error('Auto-save error:', saveError);
              setUploadError(`Menu items extracted but failed to save: ${saveError.message}`);
              setUploading(false);
              return;
            }
          } else {
            // No menu items found in any file
            let errorMessage = 'No menu data found in any of the uploaded files.\n\n';
            
            if (noMenuDataFiles.length > 0) {
              errorMessage += `Files with no menu data:\n${noMenuDataFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
            }
            
            if (failedFiles.length > 0) {
              errorMessage += `Files that failed to process:\n${failedFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
            }
            
            errorMessage += 'Please try uploading:\n• Clear menu images\n• PDF files with menu content\n• Document files with menu data';
            
            setUploadError(errorMessage);
            setUploading(false);
            return;
          }
        } else {
          setUploadError('No menu data was extracted from the uploaded files.');
          setUploading(false);
          return;
        }
      } else {
        setUploadError(response.error || 'Upload failed. Please try again.');
        setUploading(false);
        return;
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadError(error.message || 'Upload failed. Please try again.');
    }
  };

  const handleCameraCapture = () => {
    console.log('📷 Camera capture clicked - opening camera/gallery directly');
    setUploadError(''); // Clear any previous errors
    setProcessingStep(''); // Clear processing step
    cameraInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    console.log('🖼️ Gallery upload clicked - opening file picker directly');
    setUploadError(''); // Clear any previous errors
    setProcessingStep(''); // Clear processing step
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'auto',
      padding: '40px 20px'
    }}>
      {/* Background processing indicator */}
      {backgroundProcessing && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#0ea5e9',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 10000, // Higher than navigation (1000)
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
          Processing menu in background...
        </div>
      )}
      
      <div style={{
        textAlign: 'center',
        maxWidth: '700px',
        transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}>
        {/* Demo Preview Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '16px',
          padding: '20px 28px',
          marginBottom: '24px',
          boxShadow: '0 6px 24px rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaEye size={18} />
              First time? See how it works
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              margin: '0'
            }}>
              Preview a live dashboard with sample menu data
            </p>
          </div>

          <button
            onClick={handlePreviewDemo}
            disabled={loadingDemo}
            style={{
              background: 'white',
              color: '#ef4444',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loadingDemo ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOver={(e) => !loadingDemo && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loadingDemo ? (
              <>
                <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Loading...
              </>
            ) : (
              <>
                <FaPlay size={12} />
                Try Demo
              </>
            )}
          </button>
        </div>

        {/* Main Content */}
        
        
        {/* <p style={{
          fontSize: '18px',
          color: '#6b7280',
          margin: '0 0 32px 0',
          lineHeight: '1.6'
        }}>
          Welcome to <strong style={{ color: '#1f2937' }}>{restaurantName || 'Your Restaurant'}</strong>! 
          <br />
          
        </p> */}

        {/* AI Upload Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
          border: '2px solid #ef4444',
          marginBottom: '24px',
          position: 'relative'
        }}>
          {/* AI Badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FaMagic size={12} />
            AI Powered
          </div>

          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 10px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaCloudUploadAlt size={28} style={{ color: '#ef4444' }} />
            Upload Your Menu
          </h3>

          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 24px 0',
            lineHeight: '1.5'
          }}>
            Take a photo or upload your menu. Our AI will automatically extract items, prices, and categories.
          </p>

          {/* Upload Options */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Camera Upload */}
            <button
              onClick={handleCameraCapture}
              disabled={uploading}
              style={{
                flex: 1,
                background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '18px 16px',
                borderRadius: '14px',
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                boxShadow: uploading ? 'none' : '0 4px 16px rgba(239, 68, 68, 0.3)'
              }}
            >
              {uploading ? (
                <FaSpinner size={22} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaCamera size={22} />
              )}
              <span style={{ fontWeight: '600', fontSize: '16px' }}>
                {uploading ? 'Processing...' : 'Take Photo'}
              </span>
            </button>

            {/* Gallery Upload */}
            <button
              onClick={handleGalleryUpload}
              disabled={uploading}
              style={{
                flex: 1,
                background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                padding: '18px 16px',
                borderRadius: '14px',
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
                boxShadow: uploading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.3)'
              }}
            >
              {uploading ? (
                <FaSpinner size={22} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <FaImage size={22} />
              )}
              <span style={{ fontWeight: '600', fontSize: '16px' }}>
                {uploading ? 'Processing...' : 'From Gallery'}
              </span>
            </button>
          </div>

          {/* AI Features */}
          <div style={{
            background: '#fef3c7',
            padding: '14px 18px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaMagic size={14} /> AI Features:
            </span>
            <span>✓ Auto-extract items</span>
            <span>✓ Detect prices</span>
            <span>✓ Categorize dishes</span>
            <span>✓ Smart descriptions</span>
          </div>
        </div>

        {/* Alternative Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleAddMenu}
            disabled={isAnimating}
            style={{
              background: '#ef4444',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '15px',
              border: 'none',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <FaPlus size={14} />
            Add Items Manually
          </button>
          <span style={{ fontSize: '14px', color: '#9ca3af' }}>
            or upload images, PDFs, CSV
          </span>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000, // Higher than navigation (1000)
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowUploadModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <FaTimes />
            </button>

            {uploading ? (
              <>
                {/* AI Working Animation */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 24px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Outer rotating ring */}
                  <div style={{
                    position: 'absolute',
                    width: '120px',
                    height: '120px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #ef4444',
                    borderRadius: '50%',
                    animation: 'spin 2s linear infinite'
                  }} />
                  
                  {/* Inner pulsing circle */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
                  }}>
                    <FaMagic size={32} style={{ color: 'white' }} />
                  </div>
                  
                  {/* Floating dots */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'float 2s ease-in-out infinite'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'float 2s ease-in-out infinite 1s'
                  }} />
                </div>
                
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  {processingStep === 'Creating your restaurant...' 
                    ? 'Setting Up Your Restaurant...'
                    : processingStep === 'Uploading menu images...'
                    ? 'Uploading Your Menu...'
                    : processingStep === 'AI is analyzing your menu...'
                    ? 'AI is Working Magic...'
                    : processingStep === 'Saving menu items to database...'
                    ? 'Saving Your Menu...'
                    : processingStep === 'Menu is ready!'
                    ? 'Menu is Ready!'
                    : 'AI is Working Magic...'
                  }
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                  {processingStep === 'Creating your restaurant...' 
                    ? 'Setting up your restaurant account and preparing everything for your menu...'
                    : processingStep === 'Uploading menu images...'
                    ? 'Uploading your menu images to our secure servers. This usually takes just a few seconds...'
                    : processingStep === 'AI is analyzing your menu...'
                    ? 'Our advanced AI is analyzing your menu images, extracting items, prices, and categories. This may take 30-60 seconds...'
                    : processingStep === 'Saving menu items to database...'
                    ? 'Saving the extracted menu items to your restaurant database. Almost done!'
                    : processingStep === 'Menu is ready!'
                    ? 'Your menu has been successfully processed and is now ready to use!'
                    : 'Our AI is working on your menu. Please wait...'
                  }
                </p>
                
                {/* Progress steps */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: processingStep === 'Creating your restaurant...' ? 1 : 0.5
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: processingStep === 'Creating your restaurant...' ? '#ef4444' : '#e5e7eb',
                      borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Setup</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: processingStep === 'Uploading menu images...' ? 1 : 0.5
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: processingStep === 'Uploading menu images...' ? '#ef4444' : '#e5e7eb',
                      borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Upload</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: processingStep === 'AI is analyzing your menu...' ? 1 : 0.5
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: processingStep === 'AI is analyzing your menu...' ? '#ef4444' : '#e5e7eb',
                      borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>AI Analysis</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: processingStep === 'Saving menu items to database...' ? 1 : 0.5
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: processingStep === 'Saving menu items to database...' ? '#ef4444' : '#e5e7eb',
                      borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Saving</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: processingStep === 'Menu is ready!' ? 1 : 0.5
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: processingStep === 'Menu is ready!' ? '#10b981' : '#e5e7eb',
                      borderRadius: '50%'
                    }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Ready</span>
                  </div>
                </div>
                
                {/* Background processing notice */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '24px',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '14px', 
                    color: '#0369a1',
                    fontWeight: '500'
                  }}>
                    💡 You can navigate to other pages while we process your menu
                  </p>
                  <p style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '12px', 
                    color: '#0369a1',
                    opacity: 0.8
                  }}>
                    The upload will continue in the background and you&apos;ll be notified when it&apos;s ready
                  </p>
                  <button
                    onClick={() => {
                      setBackgroundProcessing(true);
                      setShowUploadModal(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0284c7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#0ea5e9'}
                  >
                    Continue in Background
                  </button>
                </div>
              </>
            ) : uploadError ? (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FaTimes size={40} style={{ color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  Upload Failed
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0' }}>
                  {uploadError}
                </p>
                <button
                  onClick={() => {
                    setUploadError('');
                    setShowUploadModal(false);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Try Again
                </button>
              </>
            ) : uploadSuccess ? (
              <>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FaCheckCircle size={40} style={{ color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  Menu Uploaded Successfully!
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0' }}>
                  Your menu items have been added to your restaurant.
                </p>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
                  Upload Your Menu
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 32px 0' }}>
                  Choose how you&apos;d like to upload your menu
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <button
                    onClick={handleCameraCapture}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '16px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaCamera size={32} />
                    <span style={{ fontWeight: '600' }}>Take Photo</span>
                  </button>

                  <button
                    onClick={handleGalleryUpload}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      padding: '20px',
                      borderRadius: '16px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaImage size={32} />
                    <span style={{ fontWeight: '600' }}>From Gallery</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default EmptyMenuPrompt;