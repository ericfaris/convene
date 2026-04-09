export default function FamilyList({ families, respondedFamilies, selected, onSelect, disabled }) {
  const respondedSet = new Set(respondedFamilies || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              padding: '10px 14px',
              border: '2px solid',
              borderColor: isSelected ? '#2563eb' : '#e5e7eb',
              borderRadius: 8,
              background: isSelected ? '#eff6ff' : '#fff',
              cursor: disabled ? 'default' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '1rem',
              textAlign: 'left',
              fontWeight: isSelected ? 600 : 400,
              transition: 'border-color .15s, background .15s',
            }}
          >
            <span>{name}</span>
            <span style={{ fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              {responded && (
                <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Responded</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
