'use client';

import { useEffect, useState } from 'react';
import { subscribeUpdate, startUpdateCheck, getUpdateState } from '../lib/updateStore';

/**
 * Subscribe to shared app-update state and trigger the one-per-session background
 * check. Returns { status, currentVersion, newVersion, dismissed }.
 * Desktop only — on web it stays 'idle' forever (renders nothing).
 */
export default function useAppUpdate() {
  const [s, setS] = useState(getUpdateState());
  useEffect(() => {
    const unsub = subscribeUpdate(setS);
    startUpdateCheck();
    return unsub;
  }, []);
  return s;
}
