import { EXCLUDED_KEYWORDS } from './targets.js';

// A Facebook page is not a website. These hosts still count as "no website".
const SOCIAL_ONLY_HOSTS = [
  'facebook.com', 'fb.com', 'fb.me', 'm.facebook.com',
  'instagram.com', 'yelp.com', 'linktr.ee', 'business.site',
  'linkedin.com', 'twitter.com', 'x.com', 'tiktok.com',
  'nextdoor.com', 'google.com', 'sites.google.com'
];

const EXCLUDED_TYPES = new Set([
  'child_care_agency', 'preschool', 'primary_school', 'secondary_school',
  'school', 'university', 'day_care_center', 'nursing_home',
  'assisted_living_facility', 'hospice', 'hospital', 'doctor', 'dentist',
  'church', 'place_of_worship'
]);

const EXCLUDED_NAME_RE = new RegExp(
  '\\b(' + EXCLUDED_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'i'
);

const PO_BOX_RE = /\b(p\.?\s*o\.?\s*box|post\s+office\s+box)\b/i;
const STREET_NUMBER_RE = /^\s*\d+[A-Za-z]?(-\d+[A-Za-z]?)?\s+\S/;

export function isSocialOnly(uri) {
  if (!uri) return true;
  let host;
  try {
    host = new URL(uri).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return true; // unparseable = treat as no real website
  }
  return SOCIAL_ONLY_HOSTS.some((h) => host === h || host.endsWith('.' + h));
}

export function normalizePhone(raw) {
  if (!raw) return null;
  let d = String(raw).replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  if (d.length !== 10) return null;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(d)) return null;
  return d;
}

export function formatPhone(d) {
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function hasStreetAddress(addr) {
  if (!addr) return false;
  if (PO_BOX_RE.test(addr)) return false;
  const first = addr.split(',')[0].trim();
  return STREET_NUMBER_RE.test(first);
}

export const REASONS = [
  'has_website', 'no_phone', 'bad_phone', 'not_operational',
  'no_street_address', 'excluded_type', 'excluded_name', 'seen', 'suppressed'
];

/**
 * @returns {{ok: true, phone: string} | {ok: false, reason: string}}
 */
export function qualify(place, { seen = {}, suppression = {} } = {}) {
  const id = place.id;
  if (!id) return { ok: false, reason: 'excluded_type' };
  if (suppression[id]) return { ok: false, reason: 'suppressed' };
  if (seen[id]) return { ok: false, reason: 'seen' };

  if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') {
    return { ok: false, reason: 'not_operational' };
  }
  if (!place.businessStatus) return { ok: false, reason: 'not_operational' };

  if (place.websiteUri && !isSocialOnly(place.websiteUri)) {
    return { ok: false, reason: 'has_website' };
  }

  if (!place.nationalPhoneNumber) return { ok: false, reason: 'no_phone' };
  const phone = normalizePhone(place.nationalPhoneNumber);
  if (!phone) return { ok: false, reason: 'bad_phone' };

  if (!hasStreetAddress(place.formattedAddress)) {
    return { ok: false, reason: 'no_street_address' };
  }

  if (place.primaryType && EXCLUDED_TYPES.has(place.primaryType)) {
    return { ok: false, reason: 'excluded_type' };
  }
  const name = place.displayName?.text || '';
  if (EXCLUDED_NAME_RE.test(name)) return { ok: false, reason: 'excluded_name' };

  return { ok: true, phone };
}

export function newTally() {
  const t = { qualified: 0 };
  for (const r of REASONS) t[r] = 0;
  return t;
}
