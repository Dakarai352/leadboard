import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchText, callCount, CALL_CAP, CapReachedError, capReached } from './places.js';
import { qualify, newTally } from './filter.js';
import { buildMessage } from './message.js';
import { renderPage } from './render.js';
import { citiesForToday, widenCities, verticalsForToday, dayOfYear } from './targets.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const DIST = path.join(ROOT, 'dist');
const TARGET_LEADS = 500;
const DEV = process.argv.includes('--dev');

const readJson = (f, fallback) => {
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; }
};

function todayISO() {
  // Pacific date — the run fires at 15:00 UTC, so shifting by -8h lands on the
  // correct local day year-round without a tz library.
  return new Date(Date.now() - 8 * 3600 * 1000).toISOString().slice(0, 10);
}

async function harvest({ cities, verticals, seen, suppression, leads, ids, tally }) {
  for (const { city, state } of cities) {
    for (const vertical of verticals) {
      if (capReached()) throw new CapReachedError();
      const query = `${vertical} in ${city}, ${state}`;
      let places;
      try {
        places = await searchText(query, { pages: DEV ? 1 : 3 });
      } catch (err) {
        if (err instanceof CapReachedError) throw err;
        console.error(`  ! ${query}: ${err.message}`);
        continue;
      }
      let hits = 0;
      for (const place of places) {
        const res = qualify(place, { seen, suppression });
        if (!res.ok) { tally[res.reason]++; continue; }
        if (ids.has(place.id)) { tally.seen++; continue; }

        const name = place.displayName?.text?.trim() || 'This business';
        ids.add(place.id);
        tally.qualified++;
        hits++;
        leads.push({
          placeId: place.id,
          name,
          vertical,
          city,
          state,
          phone: res.phone,
          message: buildMessage({ businessName: name, vertical })
        });
      }
      console.log(`  ${query} → ${places.length} screened, ${hits} qualified (total ${leads.length})`);
      if (leads.length >= TARGET_LEADS && !DEV) return;
    }
  }
}

async function main() {
  const date = todayISO();
  const doy = dayOfYear();
  const seen = readJson(path.join(DATA, 'seen.json'), {});
  const suppression = readJson(path.join(DATA, 'suppression.json'), {});

  const cities = DEV ? citiesForToday(doy, 1) : citiesForToday(doy, 8);
  const verticals = DEV ? verticalsForToday(doy, 2) : verticalsForToday(doy, 10);

  console.log(`leadboard ${date} (day ${doy})${DEV ? ' [dev]' : ''}`);
  console.log(`cities: ${cities.map((c) => `${c.city}, ${c.state}`).join(' | ')}`);
  console.log(`verticals: ${verticals.join(', ')}`);
  console.log(`known: ${Object.keys(seen).length} seen, ${Object.keys(suppression).length} suppressed`);

  const leads = [];
  const ids = new Set();
  const tally = newTally();
  let capped = false;

  try {
    await harvest({ cities, verticals, seen, suppression, leads, ids, tally });

    if (!DEV && leads.length < TARGET_LEADS) {
      const extra = widenCities(doy, 8, 4);
      console.log(`under target (${leads.length}) — widening to ${extra.map((c) => c.city).join(', ')}`);
      await harvest({ cities: extra, verticals, seen, suppression, leads, ids, tally });
    }
  } catch (err) {
    if (err instanceof CapReachedError) {
      capped = true;
      console.warn(`! ${err.message} — rendering ${leads.length} leads collected so far`);
    } else {
      throw err;
    }
  }

  console.log('\nrejections:', JSON.stringify(tally));
  console.log(`billable Text Search calls: ${callCount()} / ${CALL_CAP}`);

  if (leads.length === 0) {
    console.error('FAIL: zero qualified leads — not committing. Yesterday\'s page stays up.');
    process.exit(1);
  }

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'index.html'), renderPage(leads, { date, capped }));
  console.log(`wrote dist/index.html (${leads.length} leads)`);

  if (DEV) {
    console.log('dev run — seen.json not modified');
    return;
  }

  for (const lead of leads) seen[lead.placeId] = date;
  fs.writeFileSync(path.join(DATA, 'seen.json'), JSON.stringify(seen, null, 0) + '\n');
  console.log(`seen.json now ${Object.keys(seen).length} place_ids`);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
