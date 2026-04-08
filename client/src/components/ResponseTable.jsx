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
                <td style={{ fontWeight: 500 }}>{name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>
                  {r ? formatDates(r.availableDates) : '—'}
                </td>
                <td style={{ color: '#6b7280', maxWidth: 200 }}>
                  {r?.notes || '—'}
                </td>
                <td style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: '.85rem' }}>
                  {r ? formatDate(r.updatedAt) : '—'}
                </td>
                <td>
                  {r ? (
                    <span className="tag tag-open">Responded</span>
                  ) : (
                    <span className="tag" style={{ background: '#f3f4f6', color: '#6b7280' }}>Pending</span>
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
