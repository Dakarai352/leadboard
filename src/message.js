const MAX_CHARS = 320;

export function buildMessage({ businessName }) {
  const msg = `Hey, i came across ${businessName} and noticed you don't have a website. Is that more of a money thing or a time thing?`;
  return msg.length <= MAX_CHARS ? msg : msg.slice(0, MAX_CHARS);
}

export const MESSAGE_MAX_CHARS = MAX_CHARS;
