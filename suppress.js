// npm run suppress -- <place_id> [reason]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'suppression.json');
const [id, ...rest] = process.argv.slice(2);

if (!id) {
  console.error('usage: npm run suppress -- <place_id> [reason]');
  process.exit(1);
}

let db = {};
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
db[id] = { date: new Date().toISOString().slice(0, 10), reason: rest.join(' ') || 'STOP' };
fs.writeFileSync(FILE, JSON.stringify(db, null, 2) + '\n');
console.log(`suppressed ${id} (${db[id].reason}). ${Object.keys(db).length} total. Commit this file.`);
