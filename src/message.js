const MAX_CHARS = 320;

/**
 * Identify by name + business in line one, business name only (never an
 * owner's personal name — not consented from this source), STOP line always.
 */
export function buildMessage({ businessName, vertical }) {
  const make = (name) =>
    `Hi — this is DK with Wove. I build websites for ${vertical} businesses.\n` +
    `Noticed ${name} doesn't have one listed. Worth a quick look?\n` +
    `Reply STOP and I won't message again.`;

  let msg = make(businessName);
  if (msg.length <= MAX_CHARS) return msg;

  // Trim the business name, never the identification or the STOP line.
  const overflow = msg.length - MAX_CHARS;
  const short = businessName.slice(0, Math.max(3, businessName.length - overflow - 1)).trim();
  msg = make(short);
  return msg.length <= MAX_CHARS ? msg : msg.slice(0, MAX_CHARS);
}

export const MESSAGE_MAX_CHARS = MAX_CHARS;
