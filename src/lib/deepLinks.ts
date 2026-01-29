interface DeepLinkConfig {
  android: {
    intent: string;
    fallback: string;
  };
  ios: {
    scheme: string;
    fallback: string;
  };
  web: string;
}

export const DEEP_LINKS: Record<string, DeepLinkConfig> = {
  nutrium: {
    android: {
      intent: 'intent://#Intent;package=com.nutrium.nutrium;scheme=nutrium;end',
      fallback: 'https://play.google.com/store/apps/details?id=com.nutrium.nutrium',
    },
    ios: {
      scheme: 'nutrium://',
      fallback: 'https://apps.apple.com/app/nutrium/id1448823099',
    },
    web: 'https://app.nutrium.com',
  },
  teachable: {
    android: {
      intent: 'intent://#Intent;package=com.teachable.teachable;scheme=teachable;end',
      fallback: 'https://sso.teachable.com/secure/564301/identity/login/otp',
    },
    ios: {
      scheme: 'teachable://',
      fallback: 'https://sso.teachable.com/secure/564301/identity/login/otp',
    },
    web: 'https://sso.teachable.com/secure/564301/identity/login/otp',
  },
};

export function openNativeApp(appKey: keyof typeof DEEP_LINKS): void {
  const config = DEEP_LINKS[appKey];
  if (!config) {
    console.error(`Deep link config not found for: ${appKey}`);
    return;
  }

  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|ipod/.test(ua);

  if (isAndroid) {
    // Try to open the app via intent
    window.location.href = config.android.intent;
    
    // Fallback to Play Store after timeout
    setTimeout(() => {
      // Check if we're still on the same page (app didn't open)
      if (document.visibilityState !== 'hidden') {
        window.location.href = config.android.fallback;
      }
    }, 2500);
  } else if (isIOS) {
    // Try to open the app via custom scheme
    window.location.href = config.ios.scheme;
    
    // Fallback to App Store after timeout
    setTimeout(() => {
      if (document.visibilityState !== 'hidden') {
        window.location.href = config.ios.fallback;
      }
    }, 2500);
  } else {
    // Desktop - open web app in new tab
    window.open(config.web, '_blank');
  }
}

// Helper to detect platform
export function getPlatform(): 'android' | 'ios' | 'desktop' {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
}
