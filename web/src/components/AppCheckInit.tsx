'use client';

import { useEffect } from 'react';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAppInstance } from '@shared/firebaseConfig';
import '../lib/firebase'; // ensure Firebase app is initialized first

let initialized = false;

export function AppCheckInit() {
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || initialized) return;
    initialized = true;

    initializeAppCheck(getAppInstance(), {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }, []);

  return null;
}
