export default function AttendeeList({ attendees, respondedAttendees, selected, onSelect, disabled }) {
  const respondedSet = new Set(respondedAttendees || []);

  return (
    <div className="attendee-list">
      {attendees.map(name => {
        const responded = respondedSet.has(name);
        const isSelected = selected === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => !disabled && onSelect(name)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={`attendee-btn${responded ? ' is-done' : ''}${isSelected ? ' is-selected' : ''}`}
          >
            <span>{name}</span>
            {responded && <span className="tag tag-open">✓ Done</span>}
          </button>
        );
      })}
    </div>
  );
}
