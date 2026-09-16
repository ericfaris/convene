export default function AttendeeList({ attendees, respondedAttendees, selected, onSelect, disabled }) {
  const respondedSet = new Set(respondedAttendees || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {attendees.map(name => {
        const responded = respondedSet.has(name);
        const isSelected = selected === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => !disabled && onSelect(name)}
            disabled={disabled}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              border: '2px solid',
              borderColor: isSelected ? '#FF6B6B' : responded ? '#FFD1D1' : '#E2E8F0',
              borderRadius: 12,
              background: isSelected ? '#FFF1F1' : responded ? '#FFF8F8' : '#fff',
              cursor: disabled ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '1.05rem',
              fontWeight: 700,
              textAlign: 'left',
              color: '#16213E',
              transition: 'border-color .15s, background .15s, transform .1s',
              transform: isSelected ? 'scale(1.01)' : 'scale(1)',
              boxShadow: isSelected ? '0 3px 12px rgba(255,107,107,.18)' : 'none',
            }}
          >
            <span>{name}</span>
            {responded && (
              <span style={{
                fontSize: '.8rem',
                fontWeight: 800,
                color: '#0288D1',
                background: '#B3E5FC',
                padding: '2px 10px',
                borderRadius: 999,
                letterSpacing: '.02em',
              }}>
                ✓ Done
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
