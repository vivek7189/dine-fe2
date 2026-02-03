'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient from '../lib/api';

/**
 * DineAI Session Hook
 * Manages session lifecycle and state
 */
export const useDineAISession = (options = {}) => {
  const {
    autoStart = false,
    sessionType = 'voice',
    responseMode = 'voice'
  } = options;

  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionConfig, setSessionConfig] = useState(null);
  const [usage, setUsage] = useState(null);

  const sessionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Get restaurant ID from localStorage
  const getRestaurantId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('selectedRestaurantId');
  }, []);

  // Start session
  const startSession = useCallback(async (overrideOptions = {}) => {
    const restaurantId = getRestaurantId();

    if (!restaurantId) {
      setError('Please select a restaurant first');
      return { success: false, error: 'No restaurant selected' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/dineai/session/start', {
        restaurantId,
        sessionType: overrideOptions.sessionType || sessionType,
        responseMode: overrideOptions.responseMode || responseMode,
        voice: overrideOptions.voice || 'alloy'
      });

      if (response.success) {
        setSessionId(response.sessionId);
        setSessionConfig(response.config);
        setIsActive(true);
        sessionRef.current = response.sessionId;

        if (response.limits) {
          setUsage({
            remaining: response.limits.remaining,
            total: response.limits.total
          });
        }

        // Set session timeout (default: 10 minutes)
        const maxDuration = response.config?.maxSessionDuration || 600;
        timeoutRef.current = setTimeout(() => {
          console.log('DineAI session timeout');
          endSession();
        }, maxDuration * 1000);

        console.log('DineAI session started:', response.sessionId);
        return { success: true, sessionId: response.sessionId };
      } else {
        setError(response.error || 'Failed to start session');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to start session';
      setError(errorMessage);
      console.error('Error starting DineAI session:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [getRestaurantId, sessionType, responseMode]);

  // End session
  const endSession = useCallback(async () => {
    const currentSessionId = sessionRef.current || sessionId;

    if (!currentSessionId) return;

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      const restaurantId = getRestaurantId();

      await apiClient.post('/api/dineai/session/end', {
        restaurantId,
        sessionId: currentSessionId
      });

      console.log('DineAI session ended:', currentSessionId);
    } catch (err) {
      console.error('Error ending session:', err);
    } finally {
      setSessionId(null);
      setIsActive(false);
      setSessionConfig(null);
      sessionRef.current = null;
    }
  }, [sessionId, getRestaurantId]);

  // Get session status
  const getSessionStatus = useCallback(async () => {
    if (!sessionId) return null;

    try {
      const restaurantId = getRestaurantId();

      const response = await apiClient.get(
        `/api/dineai/session/${sessionId}?restaurantId=${restaurantId}`
      );

      return response.success ? response.session : null;
    } catch (err) {
      console.error('Error getting session status:', err);
      return null;
    }
  }, [sessionId, getRestaurantId]);

  // Get ephemeral token for Realtime API
  const getEphemeralToken = useCallback(async () => {
    if (!sessionId) return null;

    try {
      const restaurantId = getRestaurantId();

      const response = await apiClient.post(
        `/api/dineai/session/${sessionId}/token`,
        { restaurantId }
      );

      return response.success
        ? { token: response.token, expiresAt: response.expiresAt }
        : null;
    } catch (err) {
      console.error('Error getting ephemeral token:', err);
      return null;
    }
  }, [sessionId, getRestaurantId]);

  // Refresh usage stats
  const refreshUsage = useCallback(async () => {
    const restaurantId = getRestaurantId();

    if (!restaurantId) return;

    try {
      const response = await apiClient.get(`/api/dineai/usage/${restaurantId}`);

      if (response.success) {
        setUsage(response.usage);
      }
    } catch (err) {
      console.error('Error refreshing usage:', err);
    }
  }, [getRestaurantId]);

  // Auto-start session if configured
  useEffect(() => {
    if (autoStart && !sessionId && !isLoading) {
      startSession();
    }
  }, [autoStart, sessionId, isLoading, startSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Don't auto-end session on unmount - let it persist
    };
  }, []);

  return {
    sessionId,
    isActive,
    isLoading,
    error,
    sessionConfig,
    usage,
    startSession,
    endSession,
    getSessionStatus,
    getEphemeralToken,
    refreshUsage,
    setError
  };
};

export default useDineAISession;
