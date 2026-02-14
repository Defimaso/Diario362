/**
 * Analytics utility — wraps Meta Pixel + Google Analytics 4
 * Respects GDPR cookie consent from CookieBanner (localStorage key: 362gradi_cookie_consent)
 */

const COOKIE_CONSENT_KEY = '362gradi_cookie_consent';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

/* ─── Cookie consent helpers ─── */

function getConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.analytics === true;
}

function hasMarketingConsent(): boolean {
  const consent = getConsent();
  return consent?.marketing === true;
}

/* ─── UTM Parameters ─── */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const UTM_STORAGE_KEY = '362gradi_utm_params';

export function captureUTMParams(): void {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });

  if (Object.keys(utm).length > 0) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }
}

export function getStoredUTMParams(): Record<string, string> {
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/* ─── Meta Pixel ─── */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function metaPixelTrack(event: string, params?: Record<string, unknown>): void {
  if (!hasMarketingConsent()) return;
  if (typeof window.fbq === 'function') {
    if (params) {
      window.fbq('track', event, params);
    } else {
      window.fbq('track', event);
    }
  }
}

function metaPixelCustom(event: string, params?: Record<string, unknown>): void {
  if (!hasMarketingConsent()) return;
  if (typeof window.fbq === 'function') {
    if (params) {
      window.fbq('trackCustom', event, params);
    } else {
      window.fbq('trackCustom', event);
    }
  }
}

/* ─── Google Analytics 4 ─── */

function ga4Event(event: string, params?: Record<string, unknown>): void {
  if (!hasAnalyticsConsent()) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

/* ─── Unified tracking API ─── */

export function trackPageView(): void {
  metaPixelTrack('PageView');
  ga4Event('page_view');
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  // Send to both Meta Pixel (as custom event) and GA4
  metaPixelCustom(name, params);
  ga4Event(name, params);
}

export function trackConversion(type: 'lead' | 'signup' | 'premium' | 'calendly_click'): void {
  switch (type) {
    case 'lead':
      metaPixelTrack('Lead');
      ga4Event('generate_lead');
      break;
    case 'signup':
      metaPixelTrack('CompleteRegistration');
      ga4Event('sign_up');
      break;
    case 'premium':
      metaPixelTrack('Purchase');
      ga4Event('purchase');
      break;
    case 'calendly_click':
      metaPixelTrack('Schedule');
      ga4Event('calendly_click');
      break;
  }
}

/* ─── App-specific events ─── */

export function trackDiaryCompleted(): void {
  trackEvent('DiaryCompleted');
}

export function trackCheckCompleted(): void {
  trackEvent('CheckCompleted');
}

export function trackStreakMilestone(days: number): void {
  trackEvent('StreakMilestone', { streak_days: days });
}

export function trackQuizStep(step: number, totalSteps: number): void {
  trackEvent('QuizStep', { step, total_steps: totalSteps });
}

export function trackQuizCompleted(): void {
  trackConversion('lead');
  trackEvent('QuizCompleted');
}

/* ─── Initialize on app load ─── */

export function initAnalytics(): void {
  captureUTMParams();
  trackPageView();
}
