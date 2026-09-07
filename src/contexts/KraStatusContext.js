'use client';

/**
 * KraStatusContext — shares the KRA/eTIMS retry-queue status (from useKraRetryQueue,
 * mounted once in the dashboard layout) with any page that wants to render it.
 *
 * The retry WORKER keeps running in the layout on every page (so pending sales drain in
 * the background regardless of where the user is). The health BANNER, however, is only
 * rendered on the KRA settings page — it consumes this context instead of mounting a
 * second worker. Value shape: { active, status, retryNow, testConnection } or null.
 */

import { createContext, useContext } from 'react';

export const KraStatusContext = createContext(null);

export const useKraStatus = () => useContext(KraStatusContext);
