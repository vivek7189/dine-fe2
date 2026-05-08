'use client';

/**
 * useHubEvents — Listens to LAN Hub WebSocket events forwarded via IPC
 *
 * When on LAN (paired with hub), the Electron main process connects to the hub
 * WebSocket and forwards events to the renderer via IPC ('hub-event').
 * This hook subscribes to those events and calls the same handlers used by Pusher,
 * so the UI code doesn't need any changes.
 *
 * Usage:
 *   useHubEvents({
 *     'order-created': handleOrderCreated,
 *     'order-status-updated': handleOrderStatusUpdated,
 *   });
 */

import { useEffect, useRef } from 'react';
import { isElectron } from '../utils/platform';

export function useHubEvents(eventHandlers) {
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    if (!isElectron() || !window.electronAPI?.onHubEvent) return;

    const unsubscribe = window.electronAPI.onHubEvent((msg) => {
      if (msg.type === 'event' && msg.event && handlersRef.current[msg.event]) {
        try {
          handlersRef.current[msg.event](msg.data);
        } catch (e) {
          console.error('[useHubEvents] Handler error:', e);
        }
      }

      // Also handle 'change' type messages for entity-level updates
      if (msg.type === 'change' && msg.entityType) {
        const changeEvent = msg.entityType + '-changed';
        if (handlersRef.current[changeEvent]) {
          try {
            handlersRef.current[changeEvent](msg);
          } catch (e) {
            console.error('[useHubEvents] Change handler error:', e);
          }
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);
}

export default useHubEvents;
