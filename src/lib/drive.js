// Google Drive / Docs link handling (prototype: the link is stored as text and embedded; no Google login or API keys).
const ID = /^[A-Za-z0-9_-]{10,}$/;
const bad = (error) => ({ ok: false, error });

export const DRIVE_HELP = 'Paste the share link of the full research file (Google Drive file, Doc, Sheet or Slides). Set its sharing to “Anyone with the link can view” so reviewers can open it.';
export const DRIVE_FORMAT_ERROR = 'Enter a valid Google Drive or Google Docs link, e.g. https://drive.google.com/file/d/… or https://docs.google.com/document/d/…';

// Returns { ok, id, previewUrl, openUrl, placeholder } or { ok: false, error }. An empty value is { ok: false, empty: true }.
export function parseDriveLink(raw) {
  const v = (raw || '').trim();
  if (!v) return { ok: false, empty: true };
  let u;
  try { u = new URL(v); } catch { return bad(DRIVE_FORMAT_ERROR); }
  if (u.protocol !== 'https:') return bad('The link must start with https://');
  const host = u.hostname.toLowerCase();
  const parts = u.pathname.split('/').filter(Boolean);
  let id = null; let previewUrl; let openUrl;

  if (host === 'drive.google.com') {
    if (parts.includes('folders')) return bad('That is a folder link. Share the research file itself, not a folder.');
    const d = parts.indexOf('d'); // /file/d/ID/view, /file/u/0/d/ID/view
    if (parts[0] === 'file' && d > 0) id = parts[d + 1];
    else if (parts[0] === 'open' || parts[0] === 'uc') id = u.searchParams.get('id');
    previewUrl = `https://drive.google.com/file/d/${id}/preview`;
    openUrl = `https://drive.google.com/file/d/${id}/view`;
  } else if (host === 'docs.google.com') {
    const kind = parts[0];
    if (!['document', 'spreadsheets', 'presentation'].includes(kind) || parts[1] !== 'd') return bad(DRIVE_FORMAT_ERROR);
    id = parts[2];
    previewUrl = `https://docs.google.com/${kind}/d/${id}/preview`;
    openUrl = `https://docs.google.com/${kind}/d/${id}/edit`;
  } else return bad('Only Google Drive (drive.google.com) and Google Docs (docs.google.com) links are accepted.');

  if (!id || !ID.test(id)) return bad('The link is missing a valid file ID. Copy it again using “Share → Copy link”.');
  return { ok: true, id, previewUrl, openUrl, placeholder: id.startsWith('PLACEHOLDER') };
}
