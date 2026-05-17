import { loadMeaningsCache, saveMeaningToCache } from './storage';
import meaningsData from '../data/meanings.json';

type CachedMeaning = { definition: string; type: string; example: string };
const embeddedMeanings = meaningsData as Record<string, CachedMeaning | null>;

export interface WordMeaning {
  word: string;
  type: string;
  definition: string;
  example: string;
}

async function fetchFromTDK(word: string): Promise<any> {
  const directUrl = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`;

  // Try direct (works on mobile, blocked by CORS on web)
  try {
    const res = await fetch(directUrl, { headers: { 'Referer': 'https://sozluk.gov.tr/' } });
    if (res.ok) return await res.json();
  } catch {}

  // Try corsproxy.io (works from browser localhost)
  try {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(directUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) return await res.json();
  } catch {}

  return null;
}

function parseResponse(data: any): { definition: string; type: string; example: string } | null {
  try {
    if (!Array.isArray(data) || data.length === 0) return null;
    const entry = data[0];
    const list = entry.anlamlarListe || entry.anlamlar || [];
    if (list.length === 0) return null;
    const first = list[0];
    const definition = first.anlam || '';
    if (!definition) return null;

    const ozellikler = first.ozelliklerListe || [];
    const type = ozellikler.length > 0 ? ozellikler[0].tam_adi || '' : '';

    const ornekler = first.orneklerListe || [];
    const example = ornekler.length > 0 ? ornekler[0].ornek || '' : '';

    return { definition, type, example };
  } catch {
    return null;
  }
}

function extractFromEntry(word: string, data: any): { definition: string; type: string; example: string } | null {
  const parsed = parseResponse(data);
  if (parsed) return parsed;

  // Try alternate: maybe the response is already a meaning object
  if (data && data.anlam) {
    return { definition: data.anlam, type: data.tip || '', example: data.ornek || '' };
  }
  return null;
}

export async function getWordMeaning(word: string): Promise<WordMeaning | null> {
  const upper = word.toUpperCase();
  const lower = word.toLowerCase();

  // 1. Embedded dictionary
  const embedded = embeddedMeanings[upper];
  if (embedded) {
    return { word: upper, ...embedded };
  }

  // 2. AsyncStorage cache
  try {
    const cache = await loadMeaningsCache();
    const cached = cache[upper];
    if (cached && cached.definition) {
      return { word: upper, ...cached };
    }
  } catch {}

  // 3. Fetch from TDK via direct or proxy (try lowercase first, then uppercase)
  for (const variant of [lower, upper]) {
    const data = await fetchFromTDK(variant);
    const extracted = extractFromEntry(upper, data);
    if (extracted) {
      saveMeaningToCache(upper, extracted).catch(() => {});
      return { word: upper, ...extracted };
    }
  }

  return null;
}
