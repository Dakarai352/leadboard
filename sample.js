// Offline shape check — no API calls. Writes dist/sample.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMessage } from './message.js';
import { renderPage } from './render.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = [
  { placeId: 'ChIJSAMPLE0001', name: "Ramirez & Sons Plumbing", vertical: 'plumber', city: 'Spokane', state: 'WA', phone: '5095550142' },
  { placeId: 'ChIJSAMPLE0002', name: 'Coastal Cuts Barbershop', vertical: 'barbershop', city: 'Charleston', state: 'SC', phone: '8435550178' },
  { placeId: 'ChIJSAMPLE0003', name: 'Taqueria La Bandera', vertical: 'taqueria', city: 'San Diego', state: 'CA', phone: '6195550109' }
];

const leads = fixtures.map((f) => ({ ...f, message: buildMessage({ businessName: f.name, vertical: f.vertical }) }));
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'sample.html'), renderPage(leads, { date: new Date().toISOString().slice(0, 10) }));
console.log('wrote dist/sample.html');
leads.forEach((l) => console.log(`\n[${l.message.length} chars]\n${l.message}`));
