'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaUpload,
  FaLink,
  FaQuestionCircle,
  FaTrash,
  FaSearch,
  FaSync,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaImage,
  FaGlobe,
  FaTimes,
  FaPlus,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import dineaiApi from '../../lib/dineai-api';

/**
 * DineAI Knowledge Manager
 * Admin interface for managing the knowledge base
 */
const DineAIKnowledgeManager = ({ restaurantId }) => {
  // State
  const [activeTab, setActiveTab] = useState('documents'); // 'documents', 'faq', 'url'
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // FAQ form state
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('faq');

  // URL form state
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');

  // File upload
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  // Load knowledge items
  const loadKnowledgeItems = useCallback(async () => {
    if (!restaurantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [itemsResponse, statsResponse] = await Promise.all([
        dineaiApi.getKnowledgeItems(restaurantId),
        dineaiApi.getKnowledgeStats(restaurantId)
      ]);

      if (itemsResponse.success) {
        setKnowledgeItems(itemsResponse.items || []);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.statistics);
      }
    } catch (err) {
      console.error('Error loading knowledge items:', err);
      setError('Failed to load knowledge base');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadKnowledgeItems();
  }, [loadKnowledgeItems]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await dineaiApi.uploadDocuments(restaurantId, selectedFiles);

      if (response.success) {
        setSuccess(`Successfully uploaded ${response.processed} document(s)`);
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        loadKnowledgeItems();
      } else {
        setError(response.error || 'Failed to upload documents');
      }
    } catch (err) {
      console.error('Error uploading documents:', err);
      setError(err.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle FAQ submission
  const handleFaqSubmit = async (e) => {
    e.preventDefault();

    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      setError('Question and answer are required');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await dineaiApi.addFaq(
        restaurantId,
        faqQuestion,
        faqAnswer,
        { category: faqCategory }
      );

      if (response.success) {
        setSuccess('FAQ added successfully');
        setFaqQuestion('');
        setFaqAnswer('');
        loadKnowledgeItems();
      } else {
        setError(response.error || 'Failed to add FAQ');
      }
    } catch (err) {
      console.error('Error adding FAQ:', err);
      setError(err.message || 'Failed to add FAQ');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle URL submission
  const handleUrlSubmit = async (e) => {
    e.preventDefault();

    if (!urlInput.trim()) {
      setError('URL is required');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await dineaiApi.processUrl(restaurantId, urlInput, {
        title: urlTitle || undefined
      });

      if (response.success) {
        setSuccess('URL content added successfully');
        setUrlInput('');
        setUrlTitle('');
        loadKnowledgeItems();
      } else {
        setError(response.error || 'Failed to process URL');
      }
    } catch (err) {
      console.error('Error processing URL:', err);
      setError(err.message || 'Failed to process URL');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await dineaiApi.deleteKnowledgeItem(docId, restaurantId);

      if (response.success) {
        setSuccess('Item deleted successfully');
        loadKnowledgeItems();
      } else {
        setError(response.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message || 'Failed to delete item');
    }
  };

  // Handle reindex
  const handleReindex = async () => {
    if (!confirm('This will re-index all knowledge items. Continue?')) return;

    setIsLoading(true);

    try {
      const response = await dineaiApi.reindexKnowledge(restaurantId);

      if (response.success) {
        setSuccess(response.message || 'Re-indexing complete');
      } else {
        setError(response.error || 'Failed to re-index');
      }
    } catch (err) {
      console.error('Error re-indexing:', err);
      setError(err.message || 'Failed to re-index');
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon for document type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FaFilePdf color="#dc2626" />;
      case 'docx':
      case 'doc':
        return <FaFileWord color="#2563eb" />;
      case 'xlsx':
      case 'xls':
        return <FaFileExcel color="#16a34a" />;
      case 'image':
        return <FaImage color="#8b5cf6" />;
      case 'url':
        return <FaGlobe color="#0891b2" />;
      case 'faq':
        return <FaQuestionCircle color="#f59e0b" />;
      default:
        return <FaFile color="#6b7280" />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
            DineAI Knowledge Base
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            Upload documents, add FAQs, and manage your AI assistant's knowledge
          </p>
        </div>

        <button
          onClick={handleReindex}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: '#374151'
          }}
        >
          <FaSync size={14} className={isLoading ? 'animate-spin' : ''} />
          Re-index
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              padding: '16px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}
          >
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#6366f1' }}>
              {statistics.totalDocuments}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
              Total Documents
            </p>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}
          >
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#10b981' }}>
              {statistics.totalChunks}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
              Knowledge Chunks
            </p>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}
          >
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#f59e0b' }}>
              {statistics.byType?.faq || 0}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
              FAQs
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '14px'
          }}
        >
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#16a34a',
            fontSize: '14px'
          }}
        >
          <FaCheck />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '8px'
        }}
      >
        {[
          { id: 'documents', label: 'Upload Documents', icon: FaUpload },
          { id: 'faq', label: 'Add FAQ', icon: FaQuestionCircle },
          { id: 'url', label: 'Add URL', icon: FaLink }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: activeTab === tab.id ? '#6366f1' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px'
        }}
      >
        {/* Documents Upload */}
        {activeTab === 'documents' && (
          <div>
            <div
              style={{
                border: '2px dashed #e5e7eb',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#6366f1';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#e5e7eb';
                const files = Array.from(e.dataTransfer.files);
                setSelectedFiles(files);
              }}
            >
              <FaUpload size={32} color="#9ca3af" style={{ marginBottom: '12px' }} />
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
                Drop files here or click to browse
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                Supports PDF, Word, Excel, images (max 30MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Selected files */}
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Selected files ({selectedFiles.length}):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: '#f3f4f6',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                    >
                      <FaFile size={12} color="#6b7280" />
                      <span>{file.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFiles(files => files.filter((_, i) => i !== index));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          color: '#9ca3af'
                        }}
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleFileUpload}
                  disabled={isUploading}
                  style={{
                    marginTop: '16px',
                    padding: '12px 24px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Upload {selectedFiles.length} file(s)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* FAQ Form */}
        {activeTab === 'faq' && (
          <form onSubmit={handleFaqSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Question
              </label>
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="e.g., What are your opening hours?"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Answer
              </label>
              <textarea
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="Provide a detailed answer..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Category
              </label>
              <select
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="faq">FAQ</option>
                <option value="policy">Policy</option>
                <option value="menu">Menu</option>
                <option value="procedure">Procedure</option>
                <option value="general">General</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              style={{
                padding: '12px 24px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isUploading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              Add FAQ
            </button>
          </form>
        )}

        {/* URL Form */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                URL
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/page"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Title (optional)
              </label>
              <input
                type="text"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                placeholder="Custom title for this content"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              style={{
                padding: '12px 24px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isUploading ? <FaSpinner className="animate-spin" /> : <FaLink />}
              Process URL
            </button>
          </form>
        )}
      </div>

      {/* Knowledge Items List */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            Knowledge Items
          </h3>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {knowledgeItems.length} items
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <FaSpinner size={24} color="#6b7280" className="animate-spin" />
            <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Loading knowledge base...
            </p>
          </div>
        ) : knowledgeItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <FaFile size={32} color="#d1d5db" />
            <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              No knowledge items yet. Upload documents or add FAQs to get started.
            </p>
          </div>
        ) : (
          <div>
            {knowledgeItems.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  padding: '16px 20px',
                  borderBottom: index < knowledgeItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getTypeIcon(item.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#6b7280',
                          textTransform: 'uppercase'
                        }}
                      >
                        {item.type}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          background: '#f0fdf4',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#16a34a'
                        }}
                      >
                        {item.category}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {item.chunkCount} chunks
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DineAIKnowledgeManager;
