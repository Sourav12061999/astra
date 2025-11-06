const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;
const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?$/;
const HOST_RE = /^[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+(?::\d{1,5})?$/i;
const LOCALHOST_RE = /^localhost(?::\d{1,5})?$/;

export function isProbablyURL(input: string): boolean {
  const s = input.trim();
  if (s === '') return false;
  if (SCHEME_RE.test(s)) return true;
  const noSpace = s.indexOf(' ') === -1;
  if (!noSpace) return false;
  const lower = s.toLowerCase();
  if (HOST_RE.test(lower)) return true;
  if (IPV4_RE.test(lower)) return true;
  if (LOCALHOST_RE.test(lower)) return true;
  if (lower.startsWith('www.')) return true;
  return false;
}

export function toNavigableURL(input: string): string {
  const s = input.trim();
  if (isProbablyURL(s)) {
    if (SCHEME_RE.test(s)) return s;
    return 'http://' + s;
  }
  const q = encodeURIComponent(s);
  return 'https://www.google.com/search?q=' + q;
}
