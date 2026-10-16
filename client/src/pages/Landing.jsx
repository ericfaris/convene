import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { STORY_SLIDES, AUTOPLAY_MS, wrapIndex } from '../landing/storySlides.js';
import '../landing/landing.css';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Chip({ chip }) {
  switch (chip.kind) {
    case 'bubble':
      return <div className="sticker sticker-pinned sticker-bubble">{chip.text}</div>;
    case 'field':
      return (
        <div className="sticker sticker-pinned lp-chip-field">
          <span className="lp-chip-label">{chip.label}</span>
          <span>{chip.text}</span>
        </div>
      );
    case 'link':
      return (
        <div className="sticker sticker-pinned lp-chip-link">
          <span className="lp-chip-url">{chip.text}</span>
          <span className="lp-chip-btn">Copy</span>
        </div>
      );
    case 'days':
      return (
        <div className="sticker sticker-pinned lp-chip-days">
          {chip.days.map(d => <span key={d} className="lp-day">✓ {d}</span>)}
        </div>
      );
    case 'heat':
      return (
        <div className="sticker sticker-pinned lp-chip-heat">
          {chip.levels.map((l, i) => (
            <span key={i} className={`lp-heat lp-heat-${l}`} />
          ))}
        </div>
      );
    case 'final':
      return (
        <div className="sticker sticker-pinned sticker-green">
          <span className="tag tag-finalized">Finalized</span>
          <strong>{chip.text}</strong>
        </div>
      );
    default:
      return null;
  }
}

export default function Landing() {
  const count = STORY_SLIDES.length;
  const [index, setIndex] = useState(0);
  // `playing` is the user's choice (pause button); `held` is a transient
  // pause while the pointer/focus is inside the story.
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [held, setHeld] = useState(false);
  // Bumped whenever the timer restarts so the CSS progress fill restarts too.
  const [run, setRun] = useState(0);
  const touchX = useRef(null);

  const go = useCallback((i) => {
    setIndex(wrapIndex(i, count));
    setRun(r => r + 1);
  }, [count]);

  const active = playing && !held;

  useEffect(() => {
    if (!active) return undefined;
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, index, run, go]);

  // Restart the current slide's progress when autoplay resumes.
  useEffect(() => {
    if (active) setRun(r => r + 1);
  }, [active]);

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
  }

  const slide = STORY_SLIDES[index];
  const isLast = index === count - 1;

  return (
    <div className="lp">
      <header className="lp-nav">
        <Link to="/" className="lp-brand" aria-label="Convene home">
          <img src="/logo.svg" alt="" width="36" height="36" />
          <span>Convene</span>
        </Link>
        <Link to="/new" className="btn btn-primary lp-nav-cta">Start planning</Link>
      </header>

      <main>
        <section className="lp-hero">
          <p className="eyebrow lp-hero-eyebrow">Group scheduling, minus the group chat</p>
          <h1 className="lp-hero-title">
            Find the date <em className="ink-underline">everyone</em> can make.
          </h1>
          <p className="lp-hero-sub">
            Suggest a window. Share one link. Watch the best date light up.
            {' '}<br />No sign-ups, no app, no <span className="lp-nowrap">forty-seven-message</span> thread.
          </p>
        </section>

        <section
          className="lp-story"
          aria-roledescription="carousel"
          aria-label="How Convene works"
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="lp-progress" role="tablist" aria-label="Story chapters">
            {STORY_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls={`lp-slide-${s.id}`}
                aria-label={`Chapter ${i + 1}: ${s.chapter}`}
                className={`lp-seg${i < index ? ' is-done' : ''}${i === index ? ' is-active' : ''}`}
                onClick={() => go(i)}
              >
                <span
                  key={i === index ? `fill-${run}` : 'fill'}
                  className="lp-seg-fill"
                  style={{
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationPlayState: active ? 'running' : 'paused',
                  }}
                />
              </button>
            ))}
          </div>

          <div className="lp-stage">
            {STORY_SLIDES.map((s, i) => {
              const on = i === index;
              return (
                <article
                  key={s.id}
                  id={`lp-slide-${s.id}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}: ${s.chapter}`}
                  aria-hidden={!on}
                  inert={!on}
                  className={`lp-slide${on ? ' is-on' : ''}`}
                >
                  <figure className="lp-art">
                    <div className={`print${i % 2 ? ' print-alt' : ''}`}>
                      <img
                        src={s.image}
                        alt={s.alt}
                        width="1024"
                        height="768"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </div>
                    <Chip chip={s.chip} />
                  </figure>
                  <div className="lp-copy">
                    <p className="chapter">
                      <span className="chapter-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="eyebrow">{s.chapter}</span>
                    </p>
                    <h2 className="lp-title">{s.title}</h2>
                    <p className="lp-body">{s.body}</p>
                    {i === count - 1 && (
                      <Link to="/new" className="btn btn-primary lp-cta">
                        Plan your gathering →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="lp-controls">
            <button type="button" className="lp-ctl" onClick={() => go(index - 1)} aria-label="Previous chapter">←</button>
            <button
              type="button"
              className="lp-ctl lp-ctl-play"
              onClick={() => setPlaying(p => !p)}
              aria-label={playing ? 'Pause story' : 'Play story'}
            >
              {playing ? '❚❚' : '►'}
            </button>
            <button type="button" className="lp-ctl" onClick={() => go(index + 1)} aria-label={isLast ? 'Back to the start' : 'Next chapter'}>
              {isLast ? '↺' : '→'}
            </button>
          </div>

          <p className="lp-sr" aria-live={active ? 'off' : 'polite'}>
            {`Chapter ${index + 1} of ${count}: ${slide.title}`}
          </p>
        </section>

        <section className="lp-promises" aria-label="Why Convene">
          <div className="lp-promise">
            <span className="stamp" aria-hidden="true">✕</span>
            <h3>No sign-ups</h3>
            <p>Not for you, not for your guests. No accounts, passwords, or emails — ever.</p>
          </div>
          <div className="lp-promise">
            <span className="stamp" aria-hidden="true">↗</span>
            <h3>Just a link</h3>
            <p>Works in any browser, on any phone. If they can open a text, they can vote.</p>
          </div>
          <div className="lp-promise">
            <span className="stamp stamp-green" aria-hidden="true">●</span>
            <h3>One clear answer</h3>
            <p>See who’s free at a glance, then lock the date so everyone knows.</p>
          </div>
        </section>

        <section className="lp-final halftone">
          <h2 className="lp-final-title">Your people are waiting<br />for a date.</h2>
          <Link to="/new" className="btn btn-primary lp-cta lp-cta-lg">Start planning — it’s free</Link>
          <p className="lp-final-note">Takes about a minute. No account needed.</p>
        </section>
      </main>

      <footer className="lp-foot">
        <span>Convene</span>
        <span aria-hidden="true" className="lp-foot-dot">·</span>
        <span>Made for reunions, birthdays, and long tables under the trees.</span>
      </footer>
    </div>
  );
}
