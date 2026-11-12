// Passes a just-computed file fingerprint from the verify home page to the result page,
// where it is compared against the registry hash again. Never trusted on its own.
const key = (id: string) => `fv-check:${id}`;

export type CheckedFile = { hash: string; name: string; size: number };

export function saveChecked(id: string, f: CheckedFile) {
  try {
    sessionStorage.setItem(key(id), JSON.stringify(f));
  } catch {}
}

export function takeChecked(id: string): CheckedFile | null {
  try {
    const raw = sessionStorage.getItem(key(id));
    sessionStorage.removeItem(key(id));
    const v = raw ? (JSON.parse(raw) as CheckedFile) : null;
    return v && typeof v.hash === "string" ? v : null;
  } catch {
    return null;
  }
}
