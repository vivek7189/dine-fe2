'use client';

import { useEffect } from 'react';
import { captureReferral } from '../referral';

// Mounted once in the root layout: remembers ?partner=CODE from a partner's sign-up link.
export default function ReferralCapture() {
  useEffect(() => { captureReferral(); }, []);
  return null;
}
