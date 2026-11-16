import { supabaseConfig } from '../config/runtimeMode.js';
import { getSchoolByCode } from './schoolStorage.js';

export function normalizeSchoolCode(value) {
  if (typeof value !== 'string') return null;
  const clean = value
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .replace(/[๐-๙]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x0E50 + 48))
    .replace(/\s+/g, '')
    .toUpperCase();
  return /^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(clean) ? clean : null;
}

export function readSchoolEntry(location) {
  const path = /^\/s\/([^/]+)\/?$/i.exec(location.pathname);
  if (path) {
    try {
      return { kind: 'school', code: normalizeSchoolCode(decodeURIComponent(path[1])) };
    } catch {
      return { kind: 'school', code: null };
    }
  }
  if (location.pathname.startsWith('/s/')) return { kind: 'school', code: null };
  const params = new URLSearchParams(location.search);
  const queryCode = params.get('school') || params.get('schoolCode');
  return queryCode ? { kind: 'school', code: normalizeSchoolCode(queryCode) } : { kind: 'general', code: null };
}

export function schoolEntryUrl(origin, code) {
  const validCode = normalizeSchoolCode(code);
  if (!validCode) return null;
  return `${origin.replace(/\/$/, '')}/s/${encodeURIComponent(validCode)}`;
}

export async function resolveStudentSchool(code, signal) {
  const validCode = normalizeSchoolCode(code);
  if (!validCode) throw new Error('invalid_school_code');

  if (supabaseConfig.url && supabaseConfig.anonKey) {
    let response = null;
    try {
      response = await fetch(`${supabaseConfig.url}/functions/v1/resolve-student-school`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
        },
        body: JSON.stringify({ school_code: validCode }),
        signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      response = null;
    }

    if (response) {
      if (response.status === 429) throw new Error('rate_limited');
      if (response.ok) {
        const payload = await response.json().catch(() => null);
        if (payload?.code === validCode && typeof payload?.name === 'string' && payload.name.trim()) {
          return { code: validCode, name: payload.name.trim() };
        }
        throw new Error('school_unavailable');
      }
      if (response.status === 404) {
        const payload = await response.json().catch(() => null);
        if (payload?.error === 'school_unavailable') {
          throw new Error('school_unavailable');
        }
      }
    }
  }

  // Fallback to local default school registry (e.g. BNS01 -> โรงเรียนบ้านนาสาร)
  const localSchool = getSchoolByCode(validCode);
  if (localSchool && localSchool.name && localSchool.status !== 'suspended') {
    return { code: validCode, name: localSchool.name.trim() };
  }

  throw new Error('school_unavailable');
}
