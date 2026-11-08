// Role → capability rules (see Documentation §4 permissions matrix) and record scoping.
import { ROLE_KIND, TYPES, TYPE_LIST, metaOf } from './schema.js';

const isApprover = (u) => u.role === 'admin' || u.role === 'coordinator';

// Which college a record belongs to (employee research resolves through the office).
export const recordCollege = (db, r) => r.college || db.offices.find((o) => o.id === r.office)?.college || null;

// Record types a user may create/edit (contributors only their own kind of output).
export const isContributor = (u) => !!ROLE_KIND[u.role];
// A College Research Coordinator manages professors and students of their own college only: never employee data.
const coordBlocked = (u, r) => u.role === 'coordinator' && metaOf(r).people === 'employees';
export function canCreateType(u, type) {
  const t = TYPES[type];
  if (u.role === 'admin') return true;
  if (u.role === 'coordinator') return type !== 'employee-research';
  if (isContributor(u)) return !!t.kinds || t.people === ROLE_KIND[u.role]; // shared types are open to every contributor kind
  return false;
}

// Is the user an author/owner of the record?
export const isOwner = (u, r) => !!u.personId && (r.authors.includes(u.personId) || r.createdBy === u.id);

const inScope = (db, u, r) => u.role !== 'coordinator' || recordCollege(db, r) === u.college;

// Records the user is allowed to see at all (repository, lists, reports, dashboard).
export function canSee(db, u, r) {
  if (coordBlocked(u, r)) return false;
  if (r.status !== 'approved' && !(isApprover(u) && inScope(db, u, r)) && !isOwner(u, r)) return false;
  switch (u.role) {
    case 'admin': case 'auditor': return true;
    case 'coordinator': return inScope(db, u, r);
    default: return isOwner(u, r); // faculty / student / employee: own records only
  }
}

export const canEdit = (db, u, r) => !coordBlocked(u, r) && canCreateType(u, r.type) && (u.role === 'admin' || (u.role === 'coordinator' ? inScope(db, u, r) : isOwner(u, r)));
export const canDelete = (db, u, r) => !coordBlocked(u, r) && (u.role === 'admin' || (u.role === 'coordinator' && inScope(db, u, r)));
export const canApprove = (db, u, r) => !coordBlocked(u, r) && isApprover(u) && inScope(db, u, r) && (r.status === 'pending' || r.status === 'review');

export const canReports = (u) => ['admin', 'coordinator', 'auditor'].includes(u.role);
export const canAudit = (u) => ['admin', 'coordinator', 'auditor'].includes(u.role);
export const isAdmin = (u) => u.role === 'admin';

// Record types that appear in this user's navigation.
// Sidebar / dropdown record types per role. Coordinators: faculty and student research side by side, no employee research.
export const visibleTypes = (u) => (u.role === 'coordinator'
  ? ['faculty-research', 'student-research', 'presented-papers', 'published-journals'].map((id) => TYPES[id])
  : TYPE_LIST.filter((t) => (isContributor(u) ? canCreateType(u, t.id) : true)));

// Google Drive document: the owner, the coordinator (own college, via canSee) and the administrator. Not auditors.
export const canSeeDrive = (db, u, r) => u.role === 'admin' || (u.role === 'coordinator' && canSee(db, u, r)) || (isContributor(u) && isOwner(u, r));

// Can this user reach the screen at `path` (first segment matters)?
export function canRoute(u, path) {
  const [, seg, sub] = path.split('/');
  switch (seg) {
    case 'reports': return canReports(u);
    case 'repository': return !isContributor(u);
    case 'maintenance': return isAdmin(u);
    case 'admin': return sub === 'audit' ? canAudit(u) : isAdmin(u);
    case 'records': return !TYPES[sub] || visibleTypes(u).some((t) => t.id === sub); // detail pages are filtered by canSee
    default: return true;
  }
}

// Apply the active setting "official figures only" (dashboard & reports).
export const officialOnly = (db, rows) => (db.settings.verifiedOnly ? rows.filter((r) => r.status === 'approved') : rows);
