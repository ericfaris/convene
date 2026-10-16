import { Link } from 'react-router-dom';

// Quiet "made with" footer on guest-facing pages; links new visitors to the story.
export default function PageFoot() {
  return (
    <footer className="page-foot">
      <img src="/logo.svg" alt="" width="18" height="18" />
      <span>Planned with Convene ·</span>
      <Link to="/">Plan your own</Link>
    </footer>
  );
}
