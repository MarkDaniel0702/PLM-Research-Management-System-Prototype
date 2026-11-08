// Table indicator: does this record have a Google Drive document? (only shown to people allowed to see it)
import React from 'react';
import { Badge, Icon } from './ui.jsx';
import { canSeeDrive } from '../perm.js';

export default function DriveBadge({ db, user, r }) {
  if (canSeeDrive(db, user, r) && r.driveLink) {
    return <Badge variant="success" style={{ gap: 4 }}><Icon name="link" size={12} />Linked</Badge>;
  }
  return <span style={{ color: '#6B7280' }} title="No Google Drive link">—</span>;
}
