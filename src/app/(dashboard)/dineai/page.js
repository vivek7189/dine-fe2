'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useDineAI } from '../../../contexts/DineAIContext';
import {
  FaRobot,
  FaUpload,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaLink,
  FaQuestionCircle,
  FaTrash,
  FaSearch,
  FaCog,
  FaMicrophone,
  FaPlay,
  FaStop,
  FaChartBar,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPlus,
  FaEdit,
  FaSave,
  FaSync,
  FaVolumeUp,
  FaBrain,
  FaDatabase,
  FaCloudUploadAlt,
  FaGlobe,
  FaBook,
  FaLightbulb
} from 'react-icons/fa';

export default function DineAIPage() {
  const router = useRouter();
  const { open: openDineAI, settings, updateSettings } = useDineAI();

  const [activeTab, setActiveTab] = useState('knowledge');
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  // Knowledge state
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // FAQ state
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general' });
  const [addingFaq, setAddingFaq] = useState(false);

  // URL state
  const [urlInput, setUrlInput] = useState('');
  const [processingUrl, setProcessingUrl] = useState(false);

  // Settings state
  const [localSettings, setLocalSettings] = useState({
    enabled: true,
    defaultVoice: 'alloy',
    voiceMode: 'push-to-talk',
    responseMode: 'voice',
    enableKnowledgeBase: true,
    enableGreetings: true,
    greetingStyle: 'friendly'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const fileInputRef = useRef(null);

  // Load restaurant ID
  useEffect(() => {
    const id = localStorage.getItem('selectedRestaurantId');
    if (!id) {
      router.push('/restaurants');
      return;
    }
    setRestaurantId(id);
  }, [router]);

  // Load data when restaurant ID is available
  useEffect(() => {
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKnowledgeItems(),
        loadStats(),
        loadSettings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeItems = async () => {
    try {
      const response = await apiClient.get(`/api/dineai/knowledge/${restaurantId}`);
      if (response.success) {
        const items = response.items || [];
        setKnowledgeItems(items);
        setFaqs(items.filter(i => i.type === 'faq') || []);
      }
    } catch (error) {
      console.error('Error loading knowledge items:', error);
      setKnowledgeItems([]);
      setFaqs([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get(`/api/dineai/knowledge/${restaurantId}/stats`);
      if (response.success) {
        setStats({
          totalDocuments: response.statistics?.totalDocuments || 0,
          totalChunks: response.statistics?.totalChunks || 0,
          faqCount: response.statistics?.byType?.faq || 0,
          queriesThisWeek: 0 // TODO: Add query tracking
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await apiClient.get(`/api/dineai/settings/${restaurantId}`);
      if (response.success) {
        setLocalSettings(prev => ({ ...prev, ...response.settings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      formData.append('category', 'general');

      const response = await apiClient.upload('/api/dineai/knowledge/upload', formData, {
        onProgress: (progress) => setUploadProgress(progress)
      });

      if (response.success) {
        alert(`Successfully uploaded ${response.processed} file(s)`);
        loadKnowledgeItems();
        loadStats();
      } else {
        alert(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // URL processing handler
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setProcessingUrl(true);
    try {
      const response = await apiClient.post('/api/dineai/knowledge/url', {
        url: urlInput.trim()
      });

      if (response.success) {
        alert('URL content added to knowledge base');
        setUrlInput('');
        loadKnowledgeItems();
        loadStats();
      } else {
        alert(response.error || 'Failed to process URL');
      }
    } catch (error) {
      console.error('URL processing error:', error);
      alert('Failed to process URL');
    } finally {
      setProcessingUrl(false);
    }
  };

  // FAQ handlers
  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      alert('Please enter both question and answer');
      return;
    }

    setAddingFaq(true);
    try {
      const response = await apiClient.post('/api/dineai/knowledge/faq', newFaq);

      if (response.success) {
        setNewFaq({ question: '', answer: '', category: 'general' });
        loadKnowledgeItems();
        loadStats();
      } else {
        alert(response.error || 'Failed to add FAQ');
      }
    } catch (error) {
      console.error('FAQ add error:', error);
      alert('Failed to add FAQ');
    } finally {
      setAddingFaq(false);
    }
  };

  // Delete knowledge item
  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await apiClient.delete(`/api/dineai/knowledge/${docId}`);
      if (response.success) {
        loadKnowledgeItems();
        loadStats();
      } else {
        alert(response.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item');
    }
  };

  // Search knowledge base
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await apiClient.post('/api/dineai/knowledge/search', {
        query: searchQuery.trim(),
        limit: 5
      });

      if (response.success) {
        setSearchResults(response.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await apiClient.put(`/api/dineai/settings/${restaurantId}`, localSettings);
      if (response.success) {
        updateSettings(localSettings);
        alert('Settings saved successfully');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Re-index knowledge
  const handleReindex = async () => {
    if (!confirm('Re-index all knowledge? This may take a while.')) return;

    try {
      const response = await apiClient.post('/api/dineai/knowledge/reindex');
      if (response.success) {
        alert('Re-indexing complete');
        loadStats();
      }
    } catch (error) {
      console.error('Reindex error:', error);
      alert('Failed to re-index');
    }
  };

  // Get file icon
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'word': return <FaFileWord className="text-blue-500" />;
      case 'excel': return <FaFileExcel className="text-green-500" />;
      case 'url': return <FaLink className="text-purple-500" />;
      case 'faq': return <FaQuestionCircle className="text-yellow-500" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <FaRobot className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">DineAI Studio</h1>
                <p className="text-indigo-200">Train and configure your AI assistant</p>
              </div>
            </div>
            <button
              onClick={openDineAI}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
            >
              <FaMicrophone />
              Test Voice Assistant
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaDatabase className="text-2xl text-indigo-200" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalDocuments || 0}</p>
                    <p className="text-indigo-200 text-sm">Documents</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaBrain className="text-2xl text-indigo-200" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalChunks || 0}</p>
                    <p className="text-indigo-200 text-sm">Embeddings</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaQuestionCircle className="text-2xl text-indigo-200" />
                  <div>
                    <p className="text-2xl font-bold">{stats.faqCount || 0}</p>
                    <p className="text-indigo-200 text-sm">FAQs</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FaChartBar className="text-2xl text-indigo-200" />
                  <div>
                    <p className="text-2xl font-bold">{stats.queriesThisWeek || 0}</p>
                    <p className="text-indigo-200 text-sm">Queries/Week</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'knowledge', label: 'Knowledge Base', icon: FaBook },
              { id: 'upload', label: 'Upload & Train', icon: FaCloudUploadAlt },
              { id: 'faq', label: 'FAQ Manager', icon: FaQuestionCircle },
              { id: 'settings', label: 'Settings', icon: FaCog }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Knowledge Base Tab */}
            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                {/* Search */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Test your knowledge base - ask a question..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                    Search
                  </button>
                </div>

                {/* Search Results */}
                {searchResults && (
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h3 className="font-semibold text-indigo-800 mb-3">Search Results</h3>
                    {searchResults.length > 0 ? (
                      <div className="space-y-3">
                        {searchResults.map((result, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-gray-800">{result.text}</p>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                  <span className="px-2 py-1 bg-gray-100 rounded">{result.source}</span>
                                  <span>Score: {(result.score * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No results found. Try uploading more documents.</p>
                    )}
                  </div>
                )}

                {/* Knowledge Items List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">All Knowledge Items</h3>
                    <button
                      onClick={handleReindex}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <FaSync />
                      Re-index All
                    </button>
                  </div>

                  {knowledgeItems.length > 0 ? (
                    <div className="grid gap-4">
                      {knowledgeItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-2xl">
                            {getFileIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 truncate">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">{item.type}</span>
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{item.category}</span>
                              {item.chunks && <span>{item.chunks} chunks</span>}
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <FaDatabase className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No knowledge items yet</p>
                      <p className="text-sm text-gray-500 mt-1">Upload documents or add FAQs to train your AI</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-8">
                {/* File Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Documents</h3>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      uploading ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <>
                        <FaSpinner className="text-4xl text-indigo-500 mx-auto mb-4 animate-spin" />
                        <p className="text-indigo-600 font-medium">Uploading... {uploadProgress}%</p>
                        <div className="w-64 h-2 bg-indigo-100 rounded-full mx-auto mt-4 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-2">PDF, Word, Excel, TXT, CSV (max 30MB)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* URL Import */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Import from URL</h3>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/your-content"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleUrlSubmit}
                      disabled={processingUrl || !urlInput.trim()}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingUrl ? <FaSpinner className="animate-spin" /> : <FaLink />}
                      Import
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Import content from web pages - great for menus, policies, or FAQs hosted online
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <FaLightbulb className="text-amber-500 text-xl flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-2">Training Tips</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>Upload your menu, policies, and procedures for best results</li>
                        <li>Add FAQs for common customer questions</li>
                        <li>Keep documents focused and well-organized</li>
                        <li>Update your knowledge base regularly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                {/* Add FAQ */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New FAQ</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <input
                        type="text"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="What are your opening hours?"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <textarea
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                        placeholder="We are open Monday to Sunday, 11 AM to 10 PM..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <select
                        value={newFaq.category}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, category: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="general">General</option>
                        <option value="menu">Menu</option>
                        <option value="ordering">Ordering</option>
                        <option value="delivery">Delivery</option>
                        <option value="policy">Policy</option>
                      </select>
                      <button
                        onClick={handleAddFaq}
                        disabled={addingFaq}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {addingFaq ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                        Add FAQ
                      </button>
                    </div>
                  </div>
                </div>

                {/* FAQ List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing FAQs</h3>
                  {faqs.length > 0 ? (
                    <div className="space-y-4">
                      {faqs.map((faq) => (
                        <div key={faq.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                                <FaQuestionCircle className="text-indigo-500" />
                                {faq.question || faq.title}
                              </h4>
                              <p className="text-gray-600 mt-2">{faq.answer || faq.content}</p>
                              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {faq.category}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No FAQs yet</p>
                      <p className="text-sm text-gray-500 mt-1">Add frequently asked questions above</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800">Enable DineAI</h4>
                    <p className="text-sm text-gray-500">Allow staff to use the voice assistant</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`w-14 h-7 rounded-full transition-colors ${
                      localSettings.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      localSettings.enabled ? 'translate-x-7' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Voice Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Voice Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setLocalSettings(prev => ({ ...prev, voiceMode: 'push-to-talk' }))}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        localSettings.voiceMode === 'push-to-talk'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaMicrophone className={`text-xl mb-2 ${
                        localSettings.voiceMode === 'push-to-talk' ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      <h5 className="font-medium">Push-to-Talk</h5>
                      <p className="text-sm text-gray-500">Tap to speak, release to send</p>
                    </button>
                    <button
                      onClick={() => setLocalSettings(prev => ({ ...prev, voiceMode: 'realtime' }))}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${
                        localSettings.voiceMode === 'realtime'
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FaVolumeUp className={`text-xl mb-2 ${
                        localSettings.voiceMode === 'realtime' ? 'text-indigo-600' : 'text-gray-400'
                      }`} />
                      <h5 className="font-medium">Realtime</h5>
                      <p className="text-sm text-gray-500">Natural conversation (Beta)</p>
                    </button>
                  </div>
                </div>

                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Voice</label>
                  <select
                    value={localSettings.defaultVoice}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultVoice: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="alloy">Alloy (Neutral)</option>
                    <option value="echo">Echo (Male)</option>
                    <option value="fable">Fable (British)</option>
                    <option value="onyx">Onyx (Deep)</option>
                    <option value="nova">Nova (Female)</option>
                    <option value="shimmer">Shimmer (Soft)</option>
                  </select>
                </div>

                {/* Greeting Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Style</label>
                  <select
                    value={localSettings.greetingStyle}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, greetingStyle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>

                {/* Knowledge Base Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800">Use Knowledge Base</h4>
                    <p className="text-sm text-gray-500">Let AI search your uploaded documents</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, enableKnowledgeBase: !prev.enableKnowledgeBase }))}
                    className={`w-14 h-7 rounded-full transition-colors ${
                      localSettings.enableKnowledgeBase ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      localSettings.enableKnowledgeBase ? 'translate-x-7' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Greetings Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-800">Personalized Greetings</h4>
                    <p className="text-sm text-gray-500">Greet users by name with context</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, enableGreetings: !prev.enableGreetings }))}
                    className={`w-14 h-7 rounded-full transition-colors ${
                      localSettings.enableGreetings ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      localSettings.enableGreetings ? 'translate-x-7' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingSettings ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
