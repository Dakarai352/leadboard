# DECISIONS

Choices made where the build prompt left a detail open.

1. **`nextPageToken` added to the field mask.** The prompt froze the field mask,
   but Places API (New) will not return `nextPageToken` unless it is in the mask.
   It is a response-level field, not a place field, so it triggers no SKU. Without
   it, pagination is impossible and every query caps at 20 results.
2. **City pool = exactly 120**, spanning WA, SC, NC, CA (incl. San Diego), TX, FL,
   AZ, GA, OH, Midwest, Northeast, South, Mountain/West. Rotation is
   `dayOfYear % 120`, 8 cities per run, so the pool takes 15 days to walk.
3. **Vertical slice** rotates as `(dayOfYear * 10) % 28`, 10 per run.
4. **`sms:` separator is chosen client-side.** The prompt asks for `?body=` on iOS
   and `&body=` on Android — that cannot be baked into static HTML, so the anchor
   ships with `data-phone` / `data-body` and the inline script sets `href` on load
   after a UA sniff. Non-JS fallback href is a bare `sms:+1XXXXXXXXXX`.
5. **Sent-state key is date-scoped**: `leadboard:<YYYY-MM-DD>:<place_id>`. The
   "Sent today" counter therefore resets each morning instead of growing forever.
6. **Rejection reasons are counted, not logged per-place.** One JSON line at the
   end of the run — enough to see why a run came up short without a wall of text.
7. **Cap behaviour**: hitting 150 calls renders whatever qualified so far and
   exits 0 (page marked "API cap hit"). Zero qualified leads or an API failure
   exits non-zero and commits nothing, so yesterday's page stays up.
8. **Missing `businessStatus` is treated as not-operational.** The field is
   requested; a place that omits it is not confirmably open.
9. **Unparseable `websiteUri` counts as no website.** Rare, and the downside of a
   false positive here is one wasted text, not a compliance problem.
10. **Retry policy**: 3 attempts on 429/5xx with 2s/4s backoff. Each attempt
    counts against the 150-call cap, because Google bills it.
11. **No `npm` dependencies.** Node 20 has `fetch` built in, so `package.json` has
    an empty dependency tree and `npm ci` falls back to `npm install` in CI.
12. **Excluded-keyword list extended** with `academy` and `tutoring` — same
    home-based/institutional profile as the daycare and senior-care terms.
13. **Caching compliance**: `data/seen.json` holds `place_id → first-seen date`
    only. Names, addresses, and phones exist in memory during the run and in
    `dist/index.html`, which is overwritten every morning. Nothing else persists.
