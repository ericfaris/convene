export default function ResponseTable({ attendees, responses }) {
  const responseMap = new Map(responses.map(r => [r.attendeeName, r]));

  function formatDates(dates) {
    if (!dates || dates.length === 0) return '—';
    if (dates.length <= 4) return dates.join(', ');
    return `${dates.slice(0, 3).join(', ')} +${dates.length - 3} more`;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Attendee</th>
            <th>Available Dates</th>
            <th>Notes</th>
            <th>Responded</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map(name => {
            const r = responseMap.get(name);
            return (
              <tr key={name}>
                <td style={{ fontWeight: 700, color: 'var(--text)' }}>{name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                  {r ? formatDates(r.availableDates) : '—'}
                </td>
                <td style={{ color: 'var(--text-faint)', maxWidth: 200, fontSize: '.9rem' }}>
                  {r?.notes || '—'}
                </td>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-faint)', fontSize: '.85rem' }}>
                  {r ? formatDate(r.updatedAt) : '—'}
                </td>
                <td>
                  {r ? (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '.75rem',
                      fontWeight: 800,
                      color: 'var(--green)',
                      background: 'var(--green-light)',
                      padding: '3px 10px',
                      borderRadius: 999,
                      letterSpacing: '.02em',
                    }}>✓ Done</span>
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '.75rem',
                      fontWeight: 700,
                      color: 'var(--text-faint)',
                      background: 'var(--gray-light)',
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}>Pending</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
