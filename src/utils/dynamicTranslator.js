// src/utils/dynamicTranslator.js
// ระบบแปลคำศัพท์และวลีแบบไฮบริด พร้อมแคชในเครื่องและการดึงคำแปลอัตโนมัติ (Dynamic Translation)

const CACHE_KEY = 'eq_dynamic_vocab_cache';

// In-memory cache for ultra-fast sync lookups
const memoryCache = new Map();

// Initialize memory cache from localStorage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      for (const [k, v] of Object.entries(parsed)) {
        memoryCache.set(k.toLowerCase().trim(), v);
      }
    }
  }
} catch {
  // Ignore localStorage parsing errors
}

function persistCache() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const obj = Object.fromEntries(memoryCache.entries());
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    }
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Normalizes an English word or phrase for dictionary lookup.
 */
export function normalizeWordToken(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().toLowerCase().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
}

/**
 * Checks if a translation is already known synchronously (in memory cache).
 */
export function getCachedMeaning(wordOrPhrase) {
  if (!wordOrPhrase) return null;
  const key = wordOrPhrase.toLowerCase().trim();
  return memoryCache.get(key) || null;
}

/**
 * Saves a translation to memory and persistent storage.
 */
export function saveCachedMeaning(wordOrPhrase, meaning) {
  if (!wordOrPhrase || !meaning) return;
  const key = wordOrPhrase.toLowerCase().trim();
  memoryCache.set(key, meaning.trim());
  persistCache();
}

// In-flight request tracker to prevent duplicate concurrent network calls
const pendingRequests = new Map();

/**
 * Fetches dynamic Thai translation for a word or phrase from translation service.
 * Automatically handles timeout, cleanups, and local caching.
 */
export async function fetchLiveTranslation(text) {
  const clean = text.trim();
  const key = clean.toLowerCase();
  
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const endpoint = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|th`;
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const data = await response.json();
      let translated = data?.responseData?.translatedText;

      if (!translated || typeof translated !== 'string') return null;

      // Decode common HTML entities if any
      translated = translated
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();

      // Ensure the translation contains Thai script or is a meaningful translation
      const hasThai = /[\u0E00-\u0E7F]/.test(translated);
      if (hasThai && translated.toLowerCase() !== clean.toLowerCase()) {
        saveCachedMeaning(clean, translated);
        return translated;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
}
