// Read-only record view: label/value pairs, authors' other outputs, audit metadata and change history.
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Btn, Card, CardTitle, ConfirmModal, EmptyState, Icon, IndexBadge, PageHeader, useToast } from '../components/ui.jsx';
import ReviewActions from '../components/Review.jsx';
import { deleteRecord, getUser, useStore } from '../store.js';
import { KINDS, STATUS, TYPES, metaOf } from '../schema.js';
import { canDelete, canEdit, canSee, recordCollege } from '../perm.js';
import { authorList, editPath, fmtDate, fmtDateTime, indexOf, nameOf, semesterName, userName, visibleRecords } from '../lib/data.js';
import NotFound from './NotFound.jsx';

// Submitted -> Under review -> Decision (Approved / Rejected)
function StatusSteps({ status }) {
  const decided = status === 'approved' || status === 'rejected';
  const cur = status === 'pending' ? 0 : status === 'review' ? 1 : 2;
  const steps = [['Submitted', 'check'], ['Under review', 'eye'], [decided ? STATUS[status].label : 'Decision', status === 'rejected' ? 'x' : 'check']];
  const col = (i) => (i < cur || (i === cur && decided) ? (i === 2 && status === 'rejected' ? '#9B1B1B' : '#2E7D4F') : i === cur ? '#1F3A93' : '#C0C6CE');
  return (
    <ol aria-label="Submission progress" style={{ display: 'flex', alignItems: 'center', gap: 8, listStyle: 'none', margin: '0 0 16px', padding: 0, flexWrap: 'wrap' }}>
      {steps.map(([label, icon], i) => (
        <li key={label} aria-current={i === cur ? 'step' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: i === cur ? 600 : 500, color: i <= cur ? '#1F2933' : '#6B7280' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: i <= cur ? col(i) : '#fff', border: `2px solid ${col(i)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={i <= cur ? icon : 'clock'} size={13} color={i <= cur ? '#fff' : '#9CA3AF'} strokeWidth={2.5} />
          </span>{label}{i < 2 && <span style={{ width: 28, height: 2, background: i < cur ? col(i) : '#D9DEE4', marginLeft: 4 }} />}
        </li>
      ))}
    </ol>
  );
}

const KV = ({ label, children }) => (
  <div className="kv"><span style={{ fontSize: 13, fontWeight: 500, color: '#5C6B7A' }}>{label}</span><span style={{ fontSize: 14, minWidth: 0, overflowWrap: 'anywhere' }}>{children || '—'}</span></div>
);

export default function RecordDetail() {
  const { type, id } = useParams();
  const state = useStore();
  const { db } = state;
  const user = getUser(state);
  const nav = useNavigate();
  const toast = useToast();
  const [del, setDel] = useState(false);
  const t = TYPES[type];
  const r = db.records.find((x) => x.id === id && x.type === type);
  const m = r ? metaOf(r) : t;
  if (!t) return <NotFound />;
  if (!r || !canSee(db, user, r)) {
    return <div className="page"><Card pad={false}><EmptyState icon="search" title="Record not found" desc="It may have been deleted, or you may not have access to it." action={<Btn to={`/records/${type}`} variant="secondary">Back to {t.label}</Btn>} /></Card></div>;
  }

  const authors = authorList(db, r);
  const history = db.audit.filter((a) => a.recordId === r.id).slice(0, 12);
  const collegeId = recordCollege(db, r);
  const related = visibleRecords(db, user).filter((x) => x.id !== r.id && x.authors.some((a) => r.authors.includes(a) && metaOf(x).people === m.people)).slice(0, 6);
  const idx = indexOf(db, r.indexing);

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <PageHeader back={{ to: `/records/${type}`, label: `Back to ${t.label}` }} title={r.title}
        subtitle={<span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><span>{t.singular} · {r.id}</span><Badge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</Badge></span>}
        actions={<>
          <ReviewActions rec={r} />
          {canEdit(db, user, r) && <Btn icon="edit" to={editPath(r, true)}>Edit</Btn>}
          {canDelete(db, user, r) && <Btn variant="ghost" icon="trash" onClick={() => setDel(true)} style={{ color: '#9B1B1B' }}>Delete</Btn>}
        </>} />

      <StatusSteps status={r.status} />
      {r.status === 'rejected' && (
        <div role="alert" style={{ background: '#F7E5E5', border: '1px solid #9B1B1B33', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
          <strong style={{ color: '#9B1B1B' }}>Rejected.</strong> {r.returnReason} {canEdit(db, user, r) && 'Edit the record to correct it and resubmit.'}
        </div>
      )}
      {r.status === 'pending' && <div style={{ background: '#FEF3E2', border: '1px solid #B7791F33', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#7A5110' }}>Submitted — waiting for the college coordinator or Research Office to start the review.</div>}
      {r.status === 'review' && <div style={{ background: '#E9EDF7', border: '1px solid #1F3A9333', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#1F3A93' }}>A reviewer is checking this submission. You will be notified of the decision.</div>}

      <div className="grid-bottom" style={{ gridTemplateColumns: '1fr 340px' }}>
        <Card>
          <CardTitle title="Record details" />
          <KV label="Record type">{t.singular}</KV>
          {t.kinds && <KV label="Author type">{KINDS[m.people].kindLabel}</KV>}
          <KV label={m.people === 'students' ? 'Students' : m.people === 'employees' ? 'Employees' : 'Authors'}>
            {authors.map((p, i) => <div key={p.id}>{p.name}{i === 0 && authors.length > 1 && <span style={{ color: '#5C6B7A', fontSize: 12 }}> (lead)</span>}<span style={{ color: '#5C6B7A', fontSize: 12 }}> — {m.unit === 'office' ? nameOf(db, 'offices', p.office) : nameOf(db, 'colleges', p.college, 'abbr')}</span></div>)}
          </KV>
          <KV label="Number of authors">{r.authors.length}</KV>
          {m.unit === 'office'
            ? <><KV label="Office">{nameOf(db, 'offices', r.office)}</KV><KV label="Office category">{nameOf(db, 'offices', r.office, 'category')}</KV></>
            : <KV label="College">{nameOf(db, 'colleges', r.college)}</KV>}
          {m.unit === 'office' && collegeId && <KV label="Attached college">{nameOf(db, 'colleges', collegeId)}</KV>}
          {m.course && <KV label="Course">{nameOf(db, 'courses', r.course)}</KV>}
          <KV label="Academic year">{r.year}</KV>
          <KV label="Semester">{semesterName(db, r.semester)}</KV>
          {t.event && <><KV label="Event">{r.event}</KV><KV label="Venue">{r.venue}</KV><KV label="Event date">{fmtDate(r.eventDate)}</KV></>}
          {t.journal && <>
            <KV label="Journal">{r.journal}</KV><KV label="ISSN">{r.issn}</KV><KV label="Volume">{r.volume}</KV><KV label="Year published">{r.yearPublished}</KV>
            <KV label="DOI">{r.doi && <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer">{r.doi}</a>}</KV>
            <KV label="Indexing">{idx && <IndexBadge idx={idx} />}</KV>
          </>}
          {t.funding && <>
            <KV label="Funding status"><Badge variant={r.funded ? 'funded' : 'unfunded'}>{r.funded ? 'Funded' : 'Not funded'}</Badge></KV>
            {r.funded && <KV label="Funding agency">{nameOf(db, 'fundingAgencies', r.fundingAgency)}</KV>}
          </>}
          <div style={{ marginTop: 16, background: '#F7F8FA', borderRadius: 6, padding: '12px 14px', fontSize: 12.5, color: '#5C6B7A', display: 'flex', gap: '6px 24px', flexWrap: 'wrap' }}>
            <span>Created by <strong>{userName(db, r.createdBy)}</strong> on {fmtDateTime(r.createdAt)}</span>
            <span>Last edited by <strong>{userName(db, r.updatedBy)}</strong> on {fmtDateTime(r.updatedAt)}</span>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <Card>
            <CardTitle title="Other outputs by these authors" />
            {related.length === 0 && <p style={{ fontSize: 13.5, color: '#5C6B7A' }}>No other records.</p>}
            {related.map((x) => (
              <Link key={x.id} to={`/records/${x.type}/${x.id}`} style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid #F0F2F4', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.35 }}>{x.title}</div>
                <div style={{ fontSize: 12, color: '#5C6B7A' }}>{TYPES[x.type].label} · {x.year}</div>
              </Link>
            ))}
          </Card>
          <Card>
            <CardTitle title="Record history" sub="From the audit log" />
            {history.length === 0 && <p style={{ fontSize: 13.5, color: '#5C6B7A' }}>No history recorded.</p>}
            {history.map((a) => (
              <div key={a.id} style={{ padding: '7px 0', borderBottom: '1px solid #F0F2F4', fontSize: 13 }}>
                <div><strong>{a.summary}</strong></div>
                <div style={{ fontSize: 12, color: '#5C6B7A' }}>{a.userName} · {fmtDateTime(a.ts)}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <ConfirmModal isOpen={del} onClose={() => setDel(false)} title="Delete record" message={`Delete “${r.title}”? This cannot be undone, and the deletion will be recorded in the audit log.`}
        onConfirm={() => { deleteRecord(r.id); toast('Record deleted.', 'success'); nav(`/records/${type}`); }} />
    </div>
  );
}
