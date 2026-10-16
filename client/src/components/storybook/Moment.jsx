// An illustrated state: printed art, an optional sticker with the key fact,
// a display headline, body copy and actions. See DESIGN.md §10.
export default function Moment({ art, sticker, stickerTone, eyebrow, title, children, actions, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  return (
    <section className="card moment">
      {art && (
        <figure className="moment-art">
          <div className="print anim-print">
            <img src={art.src} alt={art.alt} width="1024" height="768" decoding="async" />
          </div>
          {sticker && (
            <div className={`sticker sticker-pinned anim-stick${stickerTone === 'green' ? ' sticker-green' : ''}`}>
              {sticker}
            </div>
          )}
        </figure>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading className="moment-title">{title}</Heading>
      {children && <p className="moment-body">{children}</p>}
      {actions && <div className="moment-actions">{actions}</div>}
    </section>
  );
}
