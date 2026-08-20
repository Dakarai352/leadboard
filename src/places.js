// Google Places API (New) — Text Search only.
// Never call Place Details: Text Search already returns every field the page
// uses, and per-place Details calls would multiply the bill ~20x for the
// identical data.

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

// Billing decision. Do NOT add fields. nationalPhoneNumber + websiteUri put the
// whole request on the Enterprise SKU; that is budgeted. nextPageToken is a
// response-level field, not a place field, and is required to paginate at all.
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.primaryType',
  'places.businessStatus',
  'nextPageToken'
].join(',');

export const CALL_CAP = 150;

let billableCalls = 0;
export const callCount = () => billableCalls;
export const capReached = () => billableCalls >= CALL_CAP;

export class CapReachedError extends Error {
  constructor() {
    super(`Text Search call cap reached (${CALL_CAP}/day)`);
    this.name = 'CapReachedError';
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(body) {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_KEY is not set');
  if (capReached()) throw new CapReachedError();

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    billableCalls++;
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': FIELD_MASK
      },
      body: JSON.stringify(body)
    });
    if (res.ok) return res.json();

    const text = await res.text();
    lastErr = new Error(`Places API ${res.status}: ${text.slice(0, 300)}`);
    // 4xx other than 429 will not fix themselves.
    if (res.status !== 429 && res.status < 500) throw lastErr;
    if (capReached()) throw new CapReachedError();
    await sleep(1000 * (attempt + 1) * 2);
  }
  throw lastErr;
}

/**
 * Text Search with pagination. Returns up to pages*20 raw places.
 * Throws CapReachedError once the daily call cap is hit — run.js catches it
 * and renders whatever qualified so far.
 */
export async function searchText(textQuery, { pages = 3 } = {}) {
  const results = [];
  let pageToken;

  for (let page = 0; page < pages; page++) {
    const body = { textQuery, pageSize: 20, languageCode: 'en' };
    if (pageToken) body.pageToken = pageToken;

    const json = await post(body);
    if (Array.isArray(json.places)) results.push(...json.places);

    pageToken = json.nextPageToken;
    if (!pageToken) break;
    // Page tokens need a moment to become valid.
    await sleep(1200);
  }
  return results;
}
