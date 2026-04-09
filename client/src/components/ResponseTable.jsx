export default function ResponseTable({ families, responses }) {
  const responseMap = new Map(responses.map(r => [r.familyName, r]));

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
            <th>Family</th>
            <th>Available Dates</th>
            <th>Notes</th>
            <th>Responded</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {families.map(name => {
            const r = responseMap.get(name);
            return (
              <tr key={name}>
                <td style={{ fontWeight: 700, color: '#1C1917' }}>{name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '.8rem', color: '#78716C' }}>
                  {r ? formatDates(r.availableDates) : '—'}
                </td>
                <td style={{ color: '#A8A29E', maxWidth: 200, fontSize: '.9rem' }}>
                  {r?.notes || '—'}
                </td>
                <td style={{ whiteSpace: 'nowrap', color: '#A8A29E', fontSize: '.85rem' }}>
                  {r ? formatDate(r.updatedAt) : '—'}
                </td>
                <td>
                  {r ? (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '.75rem',
                      fontWeight: 800,
                      color: '#65A30D',
                      background: '#ECFCCB',
                      padding: '3px 10px',
                      borderRadius: 999,
                      letterSpacing: '.02em',
                    }}>✓ Done</span>
                  ) : (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '.75rem',
                      fontWeight: 700,
                      color: '#A8A29E',
                      background: '#F5F0EB',
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
