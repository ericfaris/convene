export default function FamilyList({ families, respondedFamilies, selected, onSelect, disabled }) {
  const respondedSet = new Set(respondedFamilies || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {families.map(name => {
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
              borderColor: isSelected ? '#F97316' : responded ? '#FED7AA' : '#E8DDD4',
              borderRadius: 12,
              background: isSelected ? '#FFF7ED' : responded ? '#FFFBF7' : '#fff',
              cursor: disabled ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '1.05rem',
              fontWeight: 700,
              textAlign: 'left',
              color: '#1C1917',
              transition: 'border-color .15s, background .15s, transform .1s',
              transform: isSelected ? 'scale(1.01)' : 'scale(1)',
              boxShadow: isSelected ? '0 3px 12px rgba(249,115,22,.15)' : 'none',
            }}
          >
            <span>{name}</span>
            {responded && (
              <span style={{
                fontSize: '.8rem',
                fontWeight: 800,
                color: '#65A30D',
                background: '#ECFCCB',
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
