/**
 * DineAI API Client
 * Dedicated client for DineAI endpoints
 */

import apiClient from './api';

class DineAIApi {
  /**
   * Session Management
   */

  async startSession(restaurantId, options = {}) {
    return apiClient.post('/api/dineai/session/start', {
      restaurantId,
      sessionType: options.sessionType || 'voice',
      responseMode: options.responseMode || 'voice',
      voice: options.voice || 'alloy'
    });
  }

  async endSession(restaurantId, sessionId) {
    return apiClient.post('/api/dineai/session/end', {
      restaurantId,
      sessionId
    });
  }

  async getSessionStatus(sessionId, restaurantId) {
    return apiClient.get(`/api/dineai/session/${sessionId}?restaurantId=${restaurantId}`);
  }

  async getEphemeralToken(sessionId, restaurantId) {
    return apiClient.post(`/api/dineai/session/${sessionId}/token`, {
      restaurantId
    });
  }

  /**
   * Text Query
   */

  async query(restaurantId, query, sessionId = null) {
    return apiClient.post('/api/dineai/query', {
      restaurantId,
      query,
      sessionId
    });
  }

  /**
   * Conversation History
   */

  async getConversations(restaurantId, options = {}) {
    const params = new URLSearchParams();
    if (options.userId) params.append('userId', options.userId);
    if (options.limit) params.append('limit', options.limit);

    return apiClient.get(`/api/dineai/conversations/${restaurantId}?${params}`);
  }

  async getConversation(conversationId, restaurantId) {
    return apiClient.get(`/api/dineai/conversation/${conversationId}?restaurantId=${restaurantId}`);
  }

  /**
   * Settings
   */

  async getSettings(restaurantId) {
    return apiClient.get(`/api/dineai/settings/${restaurantId}`);
  }

  async updateSettings(restaurantId, settings) {
    return apiClient.put(`/api/dineai/settings/${restaurantId}`, settings);
  }

  /**
   * Usage & Capabilities
   */

  async getUsage(restaurantId) {
    return apiClient.get(`/api/dineai/usage/${restaurantId}`);
  }

  async getCapabilities(restaurantId) {
    return apiClient.get(`/api/dineai/capabilities?restaurantId=${restaurantId}`);
  }

  async getSuggestions(restaurantId) {
    return apiClient.get(`/api/dineai/suggestions/${restaurantId}`);
  }

  /**
   * Knowledge Base
   */

  async uploadDocuments(restaurantId, files, options = {}) {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    if (options.category) {
      formData.append('category', options.category);
    }

    if (options.tags) {
      formData.append('tags', Array.isArray(options.tags) ? options.tags.join(',') : options.tags);
    }

    return apiClient.post(`/api/dineai/knowledge/upload?restaurantId=${restaurantId}`, formData);
  }

  async processUrl(restaurantId, url, options = {}) {
    return apiClient.post('/api/dineai/knowledge/url', {
      restaurantId,
      url,
      title: options.title,
      category: options.category,
      tags: options.tags
    });
  }

  async addFaq(restaurantId, question, answer, options = {}) {
    return apiClient.post('/api/dineai/knowledge/faq', {
      restaurantId,
      question,
      answer,
      category: options.category,
      tags: options.tags
    });
  }

  async getKnowledgeItems(restaurantId, options = {}) {
    const params = new URLSearchParams();
    if (options.type) params.append('type', options.type);
    if (options.category) params.append('category', options.category);
    if (options.limit) params.append('limit', options.limit);

    return apiClient.get(`/api/dineai/knowledge/${restaurantId}?${params}`);
  }

  async deleteKnowledgeItem(docId, restaurantId) {
    return apiClient.delete(`/api/dineai/knowledge/${docId}?restaurantId=${restaurantId}`);
  }

  async searchKnowledge(restaurantId, query, options = {}) {
    return apiClient.post('/api/dineai/knowledge/search', {
      restaurantId,
      query,
      category: options.category,
      limit: options.limit,
      minScore: options.minScore
    });
  }

  async reindexKnowledge(restaurantId) {
    return apiClient.post('/api/dineai/knowledge/reindex', {
      restaurantId
    });
  }

  async getKnowledgeStats(restaurantId) {
    return apiClient.get(`/api/dineai/knowledge/${restaurantId}/stats`);
  }

  /**
   * Function Execution (for WebSocket relay)
   */

  async executeFunction(restaurantId, sessionId, functionName, args) {
    return apiClient.post('/api/dineai/execute-function', {
      restaurantId,
      sessionId,
      functionName,
      arguments: args
    });
  }
}

const dineaiApi = new DineAIApi();
export default dineaiApi;
