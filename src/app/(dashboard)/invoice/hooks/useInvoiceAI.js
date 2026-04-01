'use client';

import { useState, useCallback } from 'react';
import apiClient from '../../../../lib/api';

export default function useInvoiceAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async (endpoint, params) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await apiClient.post(`/api/invoice/ai/${endpoint}`, params);
      return result;
    } catch (err) {
      const msg = err.message || 'AI generation failed';
      setError(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generate, isGenerating, error, setError };
}
