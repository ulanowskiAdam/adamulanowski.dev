import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

if (!process.argv[2]) {
  console.error('Usage: node scripts/contact-report.mjs contact-log.txt');
  process.exit(1);
}
const counts = {};
const allowed = new Set(['google', 'chatgpt', 'other-ai', 'recommendation', 'social', 'other', 'unknown']);
let total = 0;
const input = createReadStream(process.argv[2]);
input.on('error', () => { console.error('Cannot read the log file.'); process.exit(1); });
for await (const line of createInterface({ input, crlfDelay: Infinity })) {
  let event;
  try { event = JSON.parse(line); } catch { continue; }
  if (event?.event !== 'contact_accepted' || !allowed.has(event.source)) continue;
  counts[event.source] = (counts[event.source] ?? 0) + 1;
  total++;
}
console.log(JSON.stringify({ total, sources: counts, note: 'Provider-accepted submissions in the supplied logs; not unique people or confirmed delivery.' }, null, 2));
