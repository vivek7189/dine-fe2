'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FaUpload,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaSave,
  FaImage,
  FaFilePdf
} from 'react-icons/fa';
import apiClient from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFirebaseRealtime } from '../hooks/useFirebaseRealtime';

const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'csv', 'xls', 'xlsx', 'doc', 'docx', 'txt'];
const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB (GCS direct upload supports large files)
const MAX_TOTAL_SIZE = 300 * 1024 * 1024;
const MAX_FILES = 10;
// Vercel serverless body limit — files above this use signed URL flow
const MULTIPART_SIZE_LIMIT = 4.5 * 1024 * 1024; // 4.5MB (Vercel body limit)

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

  // ─── Signed URL pipeline state (used when multipart fails / large files) ──
  const [processingPhase, setProcessingPhase] = useState(null); // 'uploading' | 'extracting' | null
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState({ page: 0, total: 0, items: 0 });
  const [currentJobId, setCurrentJobId] = useState(null);

  // ─── RTDB listener for extraction progress (signed URL flow only) ─────────
  useFirebaseRealtime(restaurantId, 'bulk-upload', useCallback((event) => {
    if (!currentJobId || event.jobId !== currentJobId) return;
    switch (event.type) {
      case 'bulk-upload-started':
        setExtractionProgress({ page: 0, total: event.totalPages || 1, items: 0 });
        break;
      case 'bulk-upload-page-done':
        setExtractionProgress(prev => ({
          page: event.page,
          total: event.totalPages,
          items: prev.items + (event.itemsFound || 0),
        }));
        break;
      case 'bulk-upload-page-error':
        setExtractionProgress(prev => ({
          ...prev,
          page: event.page,
          total: event.totalPages,
        }));
        break;
      case 'bulk-upload-complete':
        fetchResultAndShow(event.jobId);
        break;
      case 'bulk-upload-failed':
        setError(event.error || 'Processing failed. Please try again.');
        setProcessingPhase(null);
        setProcessing(false);
        break;
    }
  }, [currentJobId]), processingPhase === 'extracting');

  // ─── Fetch extraction result from backend (signed URL flow) ───────────────
  const fetchResultAndShow = async (jobId) => {
    try {
      const result = await apiClient.getMenuUploadResult(restaurantId, jobId);
      const categories = result.extractedCategories || result.categories || [];
      const menuItems = result.menuItems || [];
      if (menuItems.length > 0) {
        handleExtractionSuccess([{ file: 'Uploaded Menu', menuItems, extractionStatus: 'success' }], categories, menuItems);
      } else {
        setError('No menu items were extracted. Please try with clearer files.');
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError('Failed to fetch extraction results. Please try again.');
    } finally {
      setProcessingPhase(null);
      setProcessing(false);
    }
  };

  // ─── Shared: handle successful extraction (used by both flows) ────────────
  const handleExtractionSuccess = async (menus, categories, allItems) => {
    setExtractedMenus(menus);
    setExtractedCategories(categories);
    setSelectedItems(allItems.map((item, i) => {
      const fileIndex = menus.findIndex(m => (m.menuItems || []).includes(item));
      const itemIndex = (menus[fileIndex >= 0 ? fileIndex : 0]?.menuItems || []).indexOf(item);
      return { ...item, key: `${Math.max(fileIndex, 0)}-${Math.max(itemIndex, 0)}`, fileIndex: Math.max(fileIndex, 0), itemIndex: Math.max(itemIndex, 0) };
    }));

    // Auto-save extracted items
    try {
      setSuccess('Saving menu items to database...');
      let savedCount = 0;

      if (mode === 'template' && orgId && templateId) {
        for (const item of allItems) {
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
          ? allItems.map(item => ({ ...item, taxInclusive: markTaxInclusive }))
          : allItems;
        const saveResponse = await apiClient.bulkSaveMenuItems(restaurantId, itemsToSave, categories);
        savedCount = saveResponse.savedCount || 0;
      }

      if (savedCount > 0) {
        setSuccess(`${savedCount} menu items extracted and saved successfully!`);
        onMenuItemsAdded && onMenuItemsAdded();
        setTimeout(() => { onClose(); resetForm(); }, 3000);
      } else {
        setError('Failed to save menu items to database. Please try again.');
        setPreviewMode(true);
      }
    } catch (saveError) {
      console.error('Auto-save error:', saveError);
      setError(`Menu items extracted but failed to save: ${saveError.message}`);
      setPreviewMode(true);
      setSuccess('Menu items extracted successfully. You can review and save them manually below.');
    }
  };

  // ─── Signed URL upload (GCP / large files) ───────────────────────────────
  const uploadViaSignedUrl = async (file) => {
    // Step 1: Get signed URL from backend
    const { jobId, uploadUrl, gcsPath } = await apiClient.getMenuUploadUrl(restaurantId, {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
    });

    setCurrentJobId(jobId);

    // Step 2: Upload directly to GCS with progress
    setProcessingPhase('uploading');
    setUploadProgress(0);

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });

    // Step 3: Trigger async processing (returns 202 immediately)
    setProcessingPhase('extracting');
    setExtractionProgress({ page: 0, total: 0, items: 0 });

    await apiClient.processMenuUpload(restaurantId, {
      jobId,
      gcsPath,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
    });

    // Now RTDB events handle progress + completion via useFirebaseRealtime above
  };

  // ─── Multipart upload (Vercel / small files) ─────────────────────────────
  const uploadViaMultipart = async () => {
    const formData = new FormData();
    uploadedFiles.forEach(file => formData.append('menuFiles', file));

    const result = await apiClient.bulkUploadMenu(restaurantId, formData);

    const menus = result.data || [];
    const categories = result.extractedCategories || [];
    const allItems = menus.flatMap(m => m.menuItems || []);

    if (allItems.length > 0) {
      await handleExtractionSuccess(menus, categories, allItems);
    } else {
      setError('No menu items were extracted. Please try with clearer files.');
    }
  };

  // ─── Main upload handler — auto-detects which flow to use ─────────────────
  const handleUploadAndExtract = async () => {
    if (uploadedFiles.length === 0) { setError('Please select files to upload'); return; }
    if (!restaurantId) { setError('Restaurant ID is required'); return; }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('authToken');
      if (!token) { setError('Please log in to upload files'); setProcessing(false); return; }

      const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);

      // If total file size is small enough, use multipart (works on Vercel + GCP)
      // If files are large, try signed URL first (GCP), fall back to multipart
      if (totalSize <= MULTIPART_SIZE_LIMIT) {
        // Small files — multipart works everywhere
        await uploadViaMultipart();
      } else {
        // Large files — try signed URL (GCP async processing)
        // If signed URL endpoint doesn't exist (Vercel), fall back to multipart
        try {
          // For signed URL flow, process first file (most users upload one PDF/image)
          await uploadViaSignedUrl(uploadedFiles[0]);
          // Async flow — RTDB events handle the rest, don't setProcessing(false) here
          return;
        } catch (signedUrlError) {
          console.warn('Signed URL upload not available, falling back to multipart:', signedUrlError.message);
          // Signed URL endpoints don't exist on this backend — fall back to multipart
          setProcessingPhase(null);
          setCurrentJobId(null);
          await uploadViaMultipart();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed';
      if (error.message) {
        if (error.message.includes('Network')) errorMessage = 'Network error. Please check your connection.';
        else if (error.message.includes('timeout')) errorMessage = 'Request timed out. The file may be too large for this server. Try a smaller file or fewer pages.';
        else if (error.message.includes('413') || error.message.includes('too large') || error.message.includes('payload')) errorMessage = 'File too large for this server. Try a smaller file or fewer pages.';
        else errorMessage = error.message;
      }
      setError(errorMessage);
      setProcessingPhase(null);
    } finally {
      // Only clear processing if not in async signed URL flow
      if (processingPhase !== 'extracting') {
        setProcessing(false);
      }
    }
  };

  // ─── Fallback: poll for result if RTDB event missed (signed URL flow) ─────
  useEffect(() => {
    if (processingPhase !== 'extracting' || !currentJobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await apiClient.getMenuUploadResult(restaurantId, currentJobId);
        if (result && result.menuItems) {
          clearInterval(pollInterval);
          fetchResultAndShow(currentJobId);
        }
      } catch {
        // Not ready yet — keep polling
      }
    }, 10000);

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (processingPhase === 'extracting') {
        setError('Processing is taking longer than expected. Please check back later.');
        setProcessingPhase(null);
        setProcessing(false);
      }
    }, 5 * 60 * 1000);

    return () => { clearInterval(pollInterval); clearTimeout(timeout); };
  }, [processingPhase, currentJobId, restaurantId]);

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
        errors.push(`${file.name}: Too large (${Math.round(file.size / (1024 * 1024))}MB). Max ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }
      if (file.size === 0) {
        errors.push(`${file.name}: Empty file.`);
        return;
      }
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
    setProcessingPhase(null); setUploadProgress(0);
    setExtractionProgress({ page: 0, total: 0, items: 0 });
    setCurrentJobId(null);
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

  // ─── Progress UI (signed URL flow shows detailed progress) ────────────────
  const ProgressDisplay = () => {
    if (!processing) return null;

    // Signed URL flow — show detailed upload/extraction progress
    if (processingPhase) {
      const isUploading = processingPhase === 'uploading';
      const progressPercent = isUploading
        ? uploadProgress
        : extractionProgress.total > 0
          ? Math.round((extractionProgress.page / extractionProgress.total) * 100)
          : 0;

      return (
        <div style={{
          padding: '12px', backgroundColor: '#eff6ff', borderRadius: '10px',
          border: '1px solid #bfdbfe', marginBottom: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FaSpinner className="animate-spin" size={14} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>
              {isUploading
                ? `Uploading file... ${uploadProgress}%`
                : extractionProgress.total > 1
                  ? `AI reading your menu — Page ${extractionProgress.page} of ${extractionProgress.total}`
                  : 'AI reading your menu...'
              }
            </span>
          </div>
          <div style={{
            height: '5px', backgroundColor: '#dbeafe', borderRadius: '3px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: '#3b82f6',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          {!isUploading && extractionProgress.items > 0 && (
            <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '6px', fontWeight: '500' }}>
              {extractionProgress.items} items found so far
            </div>
          )}
        </div>
      );
    }

    // Multipart flow — simple spinner
    return (
      <div style={{
        padding: '12px', backgroundColor: '#eff6ff', borderRadius: '10px',
        border: '1px solid #bfdbfe', marginBottom: '12px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <FaSpinner className="animate-spin" size={14} style={{ color: '#3b82f6' }} />
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>
          Uploading & extracting menu items with AI...
        </span>
      </div>
    );
  };

  // Action buttons component (reused top & bottom)
  const ActionButtons = () => !previewMode ? (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button onClick={handleClose} disabled={processing} style={{
        padding: '7px 14px', backgroundColor: 'white', color: '#6b7280',
        fontSize: '12px', fontWeight: '500', border: '1px solid #e5e7eb', borderRadius: '8px',
        cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.5 : 1,
      }}>Cancel</button>
      <button onClick={handleUploadAndExtract} disabled={uploadedFiles.length === 0 || processing} style={{
        padding: '7px 14px',
        background: uploadedFiles.length === 0 || processing ? '#d1d5db' : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white', fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '8px',
        cursor: uploadedFiles.length === 0 || processing ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
        boxShadow: uploadedFiles.length === 0 || processing ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
      }}>
        {processing ? <FaSpinner className="animate-spin" size={11} /> : <FaUpload size={11} />}
        {processing ? 'Processing...' : 'Upload & Extract'}
      </button>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <button onClick={() => setPreviewMode(false)} style={{
        padding: '7px 14px', backgroundColor: '#f3f4f6', color: '#6b7280',
        fontSize: '12px', fontWeight: '500', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
      }}>Back</button>
      <button onClick={handleSaveMenuItems} disabled={selectedItems.length === 0 || processing} style={{
        padding: '7px 14px',
        backgroundColor: processing ? '#d1d5db' : '#10b981', color: 'white',
        fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '8px',
        cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        {processing ? <FaSpinner className="animate-spin" size={11} /> : <FaSave size={11} />}
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
        backgroundColor: 'white', borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: previewMode ? '1200px' : '520px',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          padding: '8px 16px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaUpload size={13} color="rgba(255,255,255,0.9)" />
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: 0 }}>
                AI Menu Upload
              </h2>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                — photos, PDFs, Excel
              </span>
            </div>
            <button onClick={handleClose} disabled={processing} style={{
              backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: processing ? 'not-allowed' : 'pointer',
              padding: '5px', borderRadius: '6px', width: '26px', height: '26px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: processing ? 0.5 : 1,
            }}>
              <FaTimes size={11} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
          {!previewMode ? (
            <div>
              {/* Top action buttons on short screens */}
              {isShortScreen && uploadedFiles.length > 0 && !processing && (
                <div style={{ marginBottom: '12px' }}><ActionButtons /></div>
              )}

              {/* Progress Display */}
              <ProgressDisplay />

              {/* Drag & Drop Area */}
              {!processing && (
                <div
                  style={{
                    border: `2px dashed ${isDragging ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    marginBottom: '12px',
                    backgroundColor: isDragging ? '#fef2f2' : '#fafafa',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}>
                    <div style={{
                      width: '36px', height: '36px',
                      background: isDragging ? 'linear-gradient(135deg, #ef4444, #fecaca)' : 'linear-gradient(135deg, #fecaca, #fef2f2)',
                      borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FaUpload size={14} style={{ color: isDragging ? '#fff' : '#ef4444' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        {isDragging ? 'Drop files here!' : 'Click to upload or drag & drop'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        Photos, PDFs, Excel, CSV — up to {MAX_FILES} files, {MAX_TOTAL_SIZE / (1024 * 1024)}MB
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {/* Feature Chips — hidden on short screens or when files selected */}
              {!isShortScreen && !processing && uploadedFiles.length === 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px', justifyContent: 'center' }}>
                  {['📸 Photos', '📄 PDFs', '📊 Excel/CSV', '🤖 AI Extract'].map(text => (
                    <span key={text} style={{
                      display: 'inline-flex', alignItems: 'center', padding: '3px 8px',
                      backgroundColor: '#f3f4f6', borderRadius: '12px', fontSize: '10px', color: '#4b5563', fontWeight: '500'
                    }}>{text}</span>
                  ))}
                </div>
              )}

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Selected Files ({uploadedFiles.length})
                  </h4>
                  <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
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
                        {!processing && (
                          <button onClick={() => handleRemoveFile(index)} style={{
                            backgroundColor: 'transparent', color: '#9ca3af', border: 'none',
                            borderRadius: '4px', padding: '4px', cursor: 'pointer', flexShrink: 0,
                          }}>
                            <FaTimes size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Inclusive Option */}
              {taxSettings?.enabled && uploadedFiles.length > 0 && !processing && (
                <div style={{
                  marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f8fafc',
                  borderRadius: '8px', border: '1px solid #e2e8f0'
                }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '3px' }}>
                    Tax Pricing
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
              {!processing && <ActionButtons />}
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
                <button onClick={() => { setError(''); setSuccess(''); setPreviewMode(false); setExtractedMenus([]); setExtractedCategories([]); setSelectedItems([]); setProcessingPhase(null); setProcessing(false); }}
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

          {/* Success Message (non-preview mode) */}
          {!previewMode && success && (
            <div style={{
              backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '10px',
              marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px',
              border: '1px solid #22c55e', fontSize: '13px',
            }}>
              <FaCheckCircle size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#22c55e' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>Success</div>
                <div style={{ lineHeight: '1.4' }}>{success}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkMenuUpload;
