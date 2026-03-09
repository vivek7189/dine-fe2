'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.dineopen.com';

export default function useAITool(toolName) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);

  const generate = async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/public/tools/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolName, params }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.message || 'Daily limit reached. Try again tomorrow or sign up for unlimited access.');
          setRemaining(0);
          return null;
        }
        setError(data.error || 'Something went wrong. Please try again.');
        return null;
      }

      if (data.remaining !== null && data.remaining !== undefined) {
        setRemaining(data.remaining);
      }

      return data.result;
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generate, isGenerating, error, remaining, setError };
}
