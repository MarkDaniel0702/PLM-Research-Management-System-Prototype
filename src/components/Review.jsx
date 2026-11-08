// Review actions for coordinators & administrators: Start review → Approve / Reject (with a reason).
import React, { useState } from 'react';
import { Btn, FormField, IconBtn, Modal, Textarea, useToast } from './ui.jsx';
import { getUser, setRecordStatus, useStore } from '../store.js';
import { canApprove } from '../perm.js';

export default function ReviewActions({ rec, compact }) {
  const state = useStore();
  const user = getUser(state);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  if (!canApprove(state.db, user, rec)) return null;

  const startReview = () => { setRecordStatus(rec.id, 'review'); toast('Marked as under review.', 'info'); };
  const approve = () => { setRecordStatus(rec.id, 'approved'); toast('Record approved.', 'success'); };
  const reject = () => {
    if (reason.trim().length < 5) { setErr('Please give the author a reason (at least 5 characters).'); return; }
    setRecordStatus(rec.id, 'rejected', reason.trim());
    toast('Record rejected and sent back to the author.', 'info');
    setOpen(false); setReason(''); setErr('');
  };
  const pending = rec.status === 'pending';
  return (
    <>
      {compact ? <>
        {pending && <IconBtn icon="eye" label="Start review" color="#1F3A93" onClick={startReview} />}
        <IconBtn icon="check" label="Approve record" color="#2E7D4F" onClick={approve} />
        <IconBtn icon="undo" label="Reject record" color="#9B1B1B" onClick={() => setOpen(true)} />
      </> : <>
        {pending && <Btn variant="secondary" icon="eye" onClick={startReview}>Start review</Btn>}
        <Btn variant="success" icon="check" onClick={approve}>Approve</Btn>
        <Btn variant="ghost" icon="undo" onClick={() => setOpen(true)} style={{ color: '#9B1B1B' }}>Reject</Btn>
      </>}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Reject submission" width={460}
        footer={<><Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn><Btn variant="danger" onClick={reject}>Reject submission</Btn></>}>
        <p style={{ fontSize: 14, color: '#5C6B7A', marginBottom: 12, lineHeight: 1.5 }}>“{rec.title}” goes back to its author, who can edit and resubmit it.</p>
        <FormField label="Reason" required error={err}><Textarea value={reason} onChange={setReason} rows={3} placeholder="What should the author fix?" error={err} /></FormField>
      </Modal>
    </>
  );
}
