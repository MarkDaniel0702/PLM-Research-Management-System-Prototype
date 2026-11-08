// Landing page for Faculty / Student / Employee: their own submissions and where each one stands in review.
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Btn, Card, EmptyState, FilterSelect, Icon, IconBtn, PageHeader, Pager, SearchInput } from '../components/ui.jsx';
import DriveBadge from '../components/DriveBadge.jsx';
import { getUser, useStore } from '../store.js';
import { ROLES, STATUS, TYPES } from '../schema.js';
import { canEdit, visibleTypes } from '../perm.js';
import { editPath, matchesQuery, newPath, semesterName, timeAgo, userName, visibleRecords } from '../lib/data.js';

const TILE_ICON = { pending: 'clock', review: 'eye', approved: 'check', rejected: 'undo' };
const TILE_COLOR = { pending: '#B7791F', review: '#1F3A93', approved: '#2E7D4F', rejected: '#9B1B1B' };

export default function MySubmissions() {
  const state = useStore();
  const { db } = state;
  const user = getUser(state);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const types = visibleTypes(user);

  const mine = useMemo(() => visibleRecords(db, user), [db, user]);
  const rows = useMemo(() => mine.filter((r) => (!status || r.status === status) && (!type || r.type === type) && (!q || matchesQuery(db, r, q)))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [mine, status, type, q, db]);
  const paged = rows.slice((page - 1) * 10, page * 10);
  const upd = (fn) => (v) => { fn(v); setPage(1); };
  const filtered = status || type || q;

  return (
    <div className="page">
      <PageHeader title="My Submissions" subtitle={`${ROLES[user.role].label} · track the review status of your research`}
        actions={types.map((t, i) => <Btn key={t.id} to={newPath(t.id)} icon="plus" variant={i === 0 ? 'primary' : 'secondary'}>Submit {t.singular.toLowerCase()}</Btn>)} />

      <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {Object.entries(STATUS).map(([k, s]) => {
          const on = status === k;
          return (
            <button key={k} type="button" aria-pressed={on} onClick={() => upd(setStatus)(on ? '' : k)} className="btn"
              style={{ textAlign: 'left', background: '#fff', border: `1.5px solid ${on ? TILE_COLOR[k] : '#D9DEE4'}`, borderRadius: 8, padding: '16px 18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#5C6B7A' }}>{s.label}</span>
                <span style={{ background: `${TILE_COLOR[k]}14`, borderRadius: 8, padding: '6px 7px', display: 'flex' }}><Icon name={TILE_ICON[k]} size={16} color={TILE_COLOR[k]} /></span>
              </span>
              <span style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{mine.filter((r) => r.status === k).length}</span>
              <span style={{ fontSize: 12, color: '#5C6B7A' }}>{s.hint}</span>
            </button>
          );
        })}
      </div>

      <div className="filter-bar">
        <SearchInput value={q} onChange={upd(setQ)} placeholder="Search my submissions…" style={{ flex: '1 1 200px', minWidth: 180 }} aria-label="Search my submissions" />
        <FilterSelect value={type} onChange={upd(setType)} placeholder="All types" options={types.map((t) => ({ value: t.id, label: t.label }))} />
        <FilterSelect value={status} onChange={upd(setStatus)} placeholder="All statuses" options={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))} />
        {filtered && <button type="button" onClick={() => { setStatus(''); setType(''); setQ(''); setPage(1); }} style={{ fontSize: 13, color: '#9B1B1B', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 8px', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="x" size={12} color="#9B1B1B" /> Clear filters</button>}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#5C6B7A' }}>{rows.length} submission{rows.length === 1 ? '' : 's'}</span>
      </div>

      <Card pad={false} style={{ overflow: 'hidden' }}>
        {rows.length === 0 ? (
          <EmptyState icon="file-text" title={filtered ? 'No submissions match your filters' : 'You have not submitted anything yet'}
            desc={filtered ? 'Try clearing the filters.' : 'Submit your first research entry. You will see its review status here.'}
            action={filtered ? <Btn variant="secondary" onClick={() => { setStatus(''); setType(''); setQ(''); }}>Clear filters</Btn> : <Btn to={newPath(types[0].id)} icon="plus">Submit {types[0].singular.toLowerCase()}</Btn>} />
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <caption style={{ position: 'absolute', left: -9999 }}>My submissions</caption>
                <thead><tr><th>Title</th><th>Type</th><th>Year / Semester</th><th>Status</th><th>Drive</th><th>Last update</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                <tbody>
                  {paged.map((r) => (
                    <tr key={r.id}>
                      <td style={{ maxWidth: 360 }}>
                        <Link to={`/records/${r.type}/${r.id}`} className="clip" style={{ fontWeight: 500, color: '#1F2933', textDecoration: 'none', display: 'block' }}>{r.title}</Link>
                        <div style={{ fontSize: 12, color: '#5C6B7A', marginTop: 2 }}>{r.id}</div>
                      </td>
                      <td><Badge color={TYPES[r.type].color}>{TYPES[r.type].singular}</Badge></td>
                      <td style={{ fontSize: 13, color: '#5C6B7A', whiteSpace: 'nowrap' }}>{r.year}<br /><span style={{ fontSize: 12 }}>{semesterName(db, r.semester)}</span></td>
                      <td style={{ maxWidth: 240 }}>
                        <Badge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</Badge>
                        {r.status === 'rejected' && r.returnReason && <div style={{ fontSize: 12, color: '#9B1B1B', marginTop: 4, lineHeight: 1.4 }}>{r.returnReason}</div>}
                      </td>
                      <td><DriveBadge db={db} user={user} r={r} /></td>
                      <td style={{ fontSize: 13, color: '#5C6B7A', whiteSpace: 'nowrap' }}>{timeAgo(r.updatedAt)}<br /><span style={{ fontSize: 12 }}>{r.updatedBy === user.id ? 'by you' : `by ${userName(db, r.updatedBy)}`}</span></td>
                      <td><div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <IconBtn icon="eye" label={`View ${r.id}`} to={`/records/${r.type}/${r.id}`} />
                        {canEdit(db, user, r) && <IconBtn icon="edit" label={r.status === 'rejected' ? `Edit and resubmit ${r.id}` : `Edit ${r.id}`} color="#1F3A93" to={editPath(r)} />}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager total={rows.length} page={page} pageSize={10} onPage={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
