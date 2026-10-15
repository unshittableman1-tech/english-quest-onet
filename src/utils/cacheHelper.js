/**
 * Clears all Service Workers, CacheStorage, and forces a clean reload from server
 * Directly redirects to targetRoute (defaults to 'student-login') to avoid student confusion
 */
export async function forceClearAppCache(targetRoute = 'student-login') {
  const doRedirect = () => {
    const routeQuery = targetRoute ? `route=${targetRoute}&` : '';
    const cleanUrl = window.location.origin + window.location.pathname + `?${routeQuery}refresh=` + Date.now();
    window.location.replace(cleanUrl);
  };

  // Immediate fallback safety timeout (400ms max wait)
  const timeoutId = setTimeout(doRedirect, 400);

  try {
    // 1. Unregister all Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // 2. Clear all CacheStorage (Workbox & PWA caches)
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }

    // 3. Clear session storage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn("Session storage clear failed:", e);
    }
  } catch (err) {
    console.error("Cache clear failed:", err);
  } finally {
    clearTimeout(timeoutId);
    doRedirect();
  }
}
