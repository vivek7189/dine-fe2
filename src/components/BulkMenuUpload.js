'use client';

import { useState, useRef, useCallback } from 'react';
import {
  FaUpload,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaTrash,
  FaSave,
  FaPlus,
  FaImage,
  FaFilePdf
} from 'react-icons/fa';
import apiClient from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';

const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'csv', 'xls', 'xlsx', 'doc', 'docx', 'txt'];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const MAX_TOTAL_SIZE = 300 * 1024 * 1024; // 300MB
const MAX_FILES = 10;

const BulkMenuUpload = ({
  isOpen,
  onClose,
  restaurantId,
  onMenuItemsAdded,
  currentMenuItems = [],
  mode = 'outlet',
  orgId = null,
  templateId = null,
  taxSettings = null,
}) => {
  const { formatCurrency } = useCurrency();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedMenus, setExtractedMenus] = useState([]);
  const [extractedCategories, setExtractedCategories] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [markTaxInclusive, setMarkTaxInclusive] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const validateAndAddFiles = useCallback((files) => {
    const fileList = Array.from(files);
    let errors = [];
    let validFiles = [];

    if (fileList.length + uploadedFiles.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed.`);
    }

    const totalSize = [...uploadedFiles, ...fileList].reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      errors.push(`Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit.`);
    }

    const remaining = MAX_FILES - uploadedFiles.length;
    fileList.slice(0, remaining).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Too large (${Math.round(file.size / (1024 * 1024))}MB). Max 30MB.`);
        return;
      }
      if (file.size === 0) {
        errors.push(`${file.name}: Empty file.`);
        return;
      }
      // Check extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type.includes('pdf');
      const isSupported = isImage || isPdf || SUPPORTED_EXTENSIONS.includes(ext);
      if (!isSupported) {
        errors.push(`${file.name}: Unsupported file type. Use images, PDF, Excel, CSV, or documents.`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(' '));
    } else {
      setError('');
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  }, [uploadedFiles]);

  const handleFileSelect = (event) => {
    validateAndAddFiles(event.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [validateAndAddFiles]);

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAndExtract = async () => {
    if (uploadedFiles.length === 0) { setError('Please select files to upload'); return; }
    if (!restaurantId) { setError('Restaurant ID is required'); return; }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      if (!token) { setError('Please log in to upload files'); setProcessing(false); return; }
      if (!userData) { setError('User session not found. Please log in again.'); setProcessing(false); return; }

      const formData = new FormData();
      uploadedFiles.forEach(file => formData.append('menuFiles', file));

      const response = await apiClient.bulkUploadMenu(restaurantId, formData);

      if (response.success === false) { setError(response.error || 'Upload failed'); return; }

      if (response.data && response.data.length > 0) {
        setExtractedMenus(response.data);
        setExtractedCategories(response.extractedCategories || []);

        const allMenuItems = response.data.flatMap(menu => menu.menuItems);
        const extractionResults = response.data;
        const noMenuDataFiles = extractionResults.filter(r => r.extractionStatus === 'no_menu_data');
        const failedFiles = extractionResults.filter(r => r.extractionStatus === 'failed');
        const successfulFiles = extractionResults.filter(r => r.extractionStatus === 'success');

        if (allMenuItems.length > 0) {
          try {
            setSuccess('Saving menu items to database...');
            setProcessing(true);
            let savedCount = 0;

            if (mode === 'template' && orgId && templateId) {
              for (const item of allMenuItems) {
                try {
                  await apiClient.addMenuTemplateItem(orgId, templateId, {
                    name: item.name || '', category: item.category || 'Uncategorized',
                    basePrice: item.price || 0, description: item.description || '',
                    isVeg: item.isVeg !== undefined ? item.isVeg : true,
                    variants: item.variants || [], customizations: item.customizations || [],
                    shortCode: item.shortCode || '', images: [],
                  });
                  savedCount++;
                } catch (itemErr) { console.error('Failed to save template item:', item.name, itemErr); }
              }
            } else {
              const itemsToSave = markTaxInclusive != null
                ? allMenuItems.map(item => ({ ...item, taxInclusive: markTaxInclusive }))
                : allMenuItems;
              const saveResponse = await apiClient.bulkSaveMenuItems(restaurantId, itemsToSave, response.extractedCategories || []);
              savedCount = saveResponse.savedCount || 0;
            }

            if (savedCount > 0) {
              let successMessage = `${savedCount} menu items extracted and saved successfully!`;
              if (successfulFiles.length > 0) successMessage += `\nFiles processed: ${successfulFiles.map(f => f.file).join(', ')}`;
              if (noMenuDataFiles.length > 0) successMessage += `\nNo menu data found in: ${noMenuDataFiles.map(f => f.file).join(', ')}`;
              if (failedFiles.length > 0) successMessage += `\nFailed to process: ${failedFiles.map(f => f.file).join(', ')}`;
              setSuccess(successMessage);
              onMenuItemsAdded && onMenuItemsAdded();
              setTimeout(() => { onClose(); resetForm(); }, 3000);
            } else {
              setError('Failed to save menu items to database. Please try again.');
            }
          } catch (saveError) {
            console.error('Auto-save error:', saveError);
            setError(`Menu items extracted but failed to save: ${saveError.message}`);
            setPreviewMode(true);
            setSuccess('Menu items extracted successfully. You can review and save them manually below.');
          } finally { setProcessing(false); }
        } else {
          let errorMessage = 'No menu data found in any of the uploaded files.\n\n';
          if (noMenuDataFiles.length > 0) errorMessage += `Files with no menu data:\n${noMenuDataFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
          if (failedFiles.length > 0) errorMessage += `Files that failed:\n${failedFiles.map(f => `• ${f.file}: ${f.message}`).join('\n')}\n\n`;
          errorMessage += 'Please try uploading:\n• Clear menu images\n• PDF files with menu content\n• Document files with menu data';
          setError(errorMessage);
        }
      } else {
        setError('No menu items were extracted from the uploaded files. Please try with clearer menu images.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed';
      if (error.response?.data) {
        const errorData = error.response.data;
        switch (errorData.errorType) {
          case 'STORAGE_ERROR': errorMessage = 'Failed to upload files to storage. Please check your connection.'; break;
          case 'AI_SERVICE_ERROR': errorMessage = 'AI service is currently unavailable. Please try again later.'; break;
          case 'PERMISSION_ERROR': errorMessage = 'You don\'t have permission to upload files.'; break;
          case 'NETWORK_ERROR': errorMessage = 'Network error. Please check your connection.'; break;
          default: errorMessage = errorData.error || errorData.message || 'An unexpected error occurred';
        }
      } else if (error.message) {
        if (error.message.includes('Network Error')) errorMessage = 'Network error. Please check your internet connection.';
        else if (error.message.includes('timeout')) errorMessage = 'Request timed out. Please try again.';
        else errorMessage = error.message;
      }
      setError(errorMessage);
    } finally { setProcessing(false); }
  };

  const handleSaveMenuItems = async () => {
    if (selectedItems.length === 0) { setError('Please select items to save'); return; }
    try {
      setProcessing(true);
      setError('');
      let savedCount = 0;
      if (mode === 'template' && orgId && templateId) {
        for (const item of selectedItems) {
          try {
            await apiClient.addMenuTemplateItem(orgId, templateId, {
              name: item.name || '', category: item.category || 'Uncategorized',
              basePrice: item.price || 0, description: item.description || '',
              isVeg: item.isVeg !== undefined ? item.isVeg : true,
              variants: item.variants || [], customizations: item.customizations || [],
              shortCode: item.shortCode || '', images: [],
            });
            savedCount++;
          } catch (itemErr) { console.error('Failed to save template item:', item.name, itemErr); }
        }
      } else {
        const itemsToSave = markTaxInclusive != null
          ? selectedItems.map(item => ({ ...item, taxInclusive: markTaxInclusive }))
          : selectedItems;
        const response = await apiClient.bulkSaveMenuItems(restaurantId, itemsToSave, extractedCategories);
        if (response.success === false) { setError(response.error || 'Save failed'); return; }
        savedCount = response.savedCount || 0;
      }
      if (savedCount > 0) {
        setSuccess(`Successfully saved ${savedCount} menu items!`);
        onMenuItemsAdded && onMenuItemsAdded();
        setTimeout(() => { onClose(); resetForm(); }, 2000);
      } else { setError('No items were saved. Please try again.'); }
    } catch (error) {
      console.error('Save error:', error);
      let errorMessage = 'Save failed';
      if (error.response?.data) errorMessage = error.response.data.error || error.response.data.message || 'Failed to save menu items';
      else if (error.message) errorMessage = error.message;
      setError(errorMessage);
    } finally { setProcessing(false); }
  };

  const handleEditItem = (item, fileIndex, itemIndex) => { setEditingItem({ ...item, fileIndex, itemIndex }); };
  const handleUpdateItem = (updatedItem) => {
    setExtractedMenus(prev => { const n = [...prev]; n[updatedItem.fileIndex].menuItems[updatedItem.itemIndex] = updatedItem; return n; });
    setEditingItem(null);
  };
  const handleSelectItem = (fileIndex, itemIndex, item) => {
    const itemKey = `${fileIndex}-${itemIndex}`;
    setSelectedItems(prev => prev.some(s => s.key === itemKey) ? prev.filter(s => s.key !== itemKey) : [...prev, { ...item, key: itemKey, fileIndex, itemIndex }]);
  };

  const resetForm = () => {
    setUploadedFiles([]); setExtractedMenus([]); setExtractedCategories([]);
    setSelectedItems([]); setEditingItem(null); setMarkTaxInclusive(null);
    setPreviewMode(false); setError(''); setSuccess(''); setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => { resetForm(); onClose(); };

  const getFileIcon = (file) => {
    const type = typeof file === 'string' ? file : file?.type || '';
    if (type.startsWith('image/')) return <FaImage size={14} style={{ color: '#3b82f6' }} />;
    if (type.includes('pdf')) return <FaFilePdf size={14} style={{ color: '#ef4444' }} />;
    return <FaUpload size={14} style={{ color: '#6b7280' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isShortScreen = typeof window !== 'undefined' && window.innerHeight < 700;

  // Action buttons component (reused top & bottom)
  const ActionButtons = () => !previewMode ? (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button onClick={handleClose} style={{
        padding: isShortScreen ? '8px 16px' : '10px 20px', backgroundColor: 'white', color: '#6b7280',
        fontSize: '13px', fontWeight: '500', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
      }}>Cancel</button>
      <button onClick={handleUploadAndExtract} disabled={uploadedFiles.length === 0 || processing} style={{
        padding: isShortScreen ? '8px 16px' : '10px 20px',
        background: uploadedFiles.length === 0 || processing ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white', fontSize: '13px', fontWeight: '600', border: 'none', borderRadius: '8px',
        cursor: uploadedFiles.length === 0 || processing ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
        boxShadow: uploadedFiles.length === 0 || processing ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
      }}>
        {processing ? <FaSpinner className="animate-spin" size={12} /> : <FaUpload size={12} />}
        {processing ? 'Extracting...' : 'Upload & Extract'}
      </button>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button onClick={() => setPreviewMode(false)} style={{
        padding: isShortScreen ? '8px 16px' : '10px 20px', backgroundColor: '#f3f4f6', color: '#6b7280',
        fontSize: '13px', fontWeight: '500', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
      }}>Back</button>
      <button onClick={handleSaveMenuItems} disabled={selectedItems.length === 0 || processing} style={{
        padding: isShortScreen ? '8px 16px' : '10px 20px',
        backgroundColor: processing ? '#d1d5db' : '#10b981', color: 'white',
        fontSize: '13px', fontWeight: '600', border: 'none', borderRadius: '8px',
        cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        {processing ? <FaSpinner className="animate-spin" size={12} /> : <FaSave size={12} />}
        {processing ? 'Saving...' : `Save ${selectedItems.length} Items`}
      </button>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10002, padding: isShortScreen ? '8px' : '20px', backdropFilter: 'blur(4px)'
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div style={{
        backgroundColor: 'white', borderRadius: isShortScreen ? '16px' : '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: previewMode ? '1200px' : '580px',
        maxHeight: isShortScreen ? '98vh' : '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header - compact on short screens */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
          padding: isShortScreen ? '14px 20px' : '24px 28px',
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: isShortScreen ? '28px' : '34px', height: isShortScreen ? '28px' : '34px',
                background: 'rgba(255,255,255,0.2)', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaUpload size={isShortScreen ? 12 : 14} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: isShortScreen ? '16px' : '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                  AI Menu Upload
                </h2>
                {!isShortScreen && (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0 0' }}>
                    Upload photos or files — AI extracts your menu
                  </p>
                )}
              </div>
            </div>
            <button onClick={handleClose} style={{
              backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer',
              padding: '6px', borderRadius: '8px', width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FaTimes size={12} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isShortScreen ? '14px 16px' : '20px 24px' }}>
          {!previewMode ? (
            <div>
              {/* Top action buttons on short screens */}
              {isShortScreen && uploadedFiles.length > 0 && (
                <div style={{ marginBottom: '12px' }}><ActionButtons /></div>
              )}

              {/* Drag & Drop Area */}
              <div
                style={{
                  border: `2px dashed ${isDragging ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '14px',
                  padding: isShortScreen ? '20px 16px' : '30px 20px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  backgroundColor: isDragging ? '#fef2f2' : '#fafafa',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div style={{
                  width: isShortScreen ? '40px' : '50px', height: isShortScreen ? '40px' : '50px',
                  background: isDragging ? 'linear-gradient(135deg, #ef4444, #fecaca)' : 'linear-gradient(135deg, #fecaca, #fef2f2)',
                  borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px auto', transition: 'all 0.2s',
                }}>
                  <FaUpload size={isShortScreen ? 16 : 20} style={{ color: isDragging ? '#fff' : '#ef4444' }} />
                </div>
                <h4 style={{ fontSize: isShortScreen ? '13px' : '15px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  {isDragging ? 'Drop files here!' : 'Click to upload or drag & drop'}
                </h4>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
                  Photos, PDFs, Excel, CSV, Documents — up to {MAX_FILES} files, {MAX_TOTAL_SIZE / (1024 * 1024)}MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Feature Chips */}
              {!isShortScreen && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', justifyContent: 'center' }}>
                  {['📸 Photos', '📄 PDFs', '📊 Excel/CSV', '🤖 AI Extract'].map(text => (
                    <span key={text} style={{
                      display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
                      backgroundColor: '#f3f4f6', borderRadius: '16px', fontSize: '11px', color: '#4b5563', fontWeight: '500'
                    }}>{text}</span>
                  ))}
                </div>
              )}

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Selected Files ({uploadedFiles.length})
                  </h4>
                  <div style={{ maxHeight: isShortScreen ? '120px' : '160px', overflowY: 'auto' }}>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px',
                        marginBottom: '4px', border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          {getFileIcon(file)}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '500', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {file.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveFile(index)} style={{
                          backgroundColor: 'transparent', color: '#9ca3af', border: 'none',
                          borderRadius: '4px', padding: '4px', cursor: 'pointer', flexShrink: 0,
                        }}>
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Inclusive Option */}
              {taxSettings?.enabled && uploadedFiles.length > 0 && (
                <div style={{
                  marginBottom: '14px', padding: '10px 14px', backgroundColor: '#f8fafc',
                  borderRadius: '8px', border: '1px solid #e2e8f0'
                }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
                    Tax Pricing for uploaded items
                  </label>
                  <select
                    value={markTaxInclusive === null || markTaxInclusive === undefined ? 'default' : markTaxInclusive ? 'inclusive' : 'exclusive'}
                    onChange={(e) => { const val = e.target.value; setMarkTaxInclusive(val === 'default' ? null : val === 'inclusive'); }}
                    style={{
                      width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #d1d5db',
                      fontSize: '12px', color: '#374151', backgroundColor: 'white', cursor: 'pointer'
                    }}
                  >
                    <option value="default">Follow restaurant setting{taxSettings?.taxInclusivePricing ? ' (Inclusive)' : ' (Exclusive)'}</option>
                    <option value="inclusive">All prices include GST</option>
                    <option value="exclusive">All prices exclude GST (add tax on top)</option>
                  </select>
                </div>
              )}

              {/* Bottom Action Buttons */}
              <ActionButtons />
            </div>
          ) : (
            // Preview Step
            <div>
              {/* Top action buttons */}
              {isShortScreen && <div style={{ marginBottom: '12px' }}><ActionButtons /></div>}

              {/* Success Message */}
              {success && (
                <div style={{
                  backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '10px',
                  marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px',
                  border: '1px solid #22c55e', fontSize: '13px',
                }}>
                  <FaCheckCircle size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#22c55e' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>Upload Successful</div>
                    <div style={{ lineHeight: '1.4' }}>{success}</div>
                  </div>
                </div>
              )}

              {/* Extracted Menu Items */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    Extracted Items ({extractedMenus.reduce((t, m) => t + m.menuItems.length, 0)})
                  </h4>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedItems.length} selected</div>
                </div>

                <div style={{ maxHeight: isShortScreen ? '35vh' : '50vh', overflowY: 'auto' }}>
                  {extractedMenus.map((menu, fileIndex) => (
                    <div key={fileIndex} style={{ marginBottom: '16px' }}>
                      <div style={{
                        backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px',
                        marginBottom: '8px', border: '1px solid #e2e8f0', fontSize: '13px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getFileIcon('image/jpeg')}
                          <span style={{ fontWeight: '500', color: '#1f2937' }}>
                            {menu.file} ({menu.menuItems.length} items)
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gap: '6px' }}>
                        {menu.menuItems.map((item, itemIndex) => {
                          const isSelected = selectedItems.some(s => s.key === `${fileIndex}-${itemIndex}`);
                          return (
                            <div key={itemIndex} style={{
                              display: 'flex', alignItems: 'center', padding: '10px 12px',
                              backgroundColor: isSelected ? '#dbeafe' : 'white',
                              border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                              borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease', fontSize: '13px',
                            }}
                            onClick={() => handleSelectItem(fileIndex, itemIndex, item)}>
                              <input type="checkbox" checked={isSelected} readOnly style={{ marginRight: '10px', flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{item.name}</span>
                                  <span style={{
                                    backgroundColor: item.isVeg ? '#dcfce7' : '#fecaca',
                                    color: item.isVeg ? '#166534' : '#dc2626',
                                    padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: '600'
                                  }}>
                                    {item.isVeg ? 'VEG' : 'NON-VEG'}
                                  </span>
                                  <span style={{
                                    backgroundColor: '#f3f4f6', color: '#6b7280',
                                    padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: '500'
                                  }}>
                                    {item.category}
                                  </span>
                                </div>
                                {item.description && (
                                  <div style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.description}
                                  </div>
                                )}
                              </div>

                              <div style={{ textAlign: 'right', marginRight: '8px', flexShrink: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>
                                  {formatCurrency(item.price)}
                                </div>
                                {item.shortCode && <div style={{ fontSize: '9px', color: '#6b7280' }}>{item.shortCode}</div>}
                              </div>

                              <button onClick={(e) => { e.stopPropagation(); handleEditItem(item, fileIndex, itemIndex); }}
                                style={{
                                  backgroundColor: '#3b82f6', color: 'white', border: 'none',
                                  borderRadius: '5px', padding: '5px 7px', cursor: 'pointer', flexShrink: 0,
                                }}
                              >
                                <FaEdit size={9} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <ActionButtons />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '10px',
              marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px',
              border: '1px solid #fecaca', fontSize: '13px',
            }}>
              <FaExclamationTriangle size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#dc2626' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>Error</div>
                <div style={{ lineHeight: '1.4', whiteSpace: 'pre-line' }}>{error}</div>
                <button onClick={() => { setError(''); setSuccess(''); setPreviewMode(false); setExtractedMenus([]); setExtractedCategories([]); setSelectedItems([]); }}
                  style={{
                    backgroundColor: '#dc2626', color: 'white', padding: '6px 12px',
                    borderRadius: '5px', border: 'none', fontSize: '11px', fontWeight: '600',
                    cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <FaUpload size={9} /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkMenuUpload;
