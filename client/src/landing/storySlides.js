// The landing-page story: one organizer (Maya) taking a gathering from
// group-chat chaos to a finalized date. Art lives in /public/story and was
// generated with Ideogram (see DESIGN.md §6 for the prompt direction).
//
// `chip` is a tiny piece of real UI rendered over each illustration, so the
// story shows what the app actually looks like at that step.

export const STORY_SLIDES = [
  {
    id: 'problem',
    chapter: 'The problem',
    title: 'Forty-seven messages. Still no date.',
    body:
      "Maya wants the whole family together this summer. The group chat has opinions, conflicts, and one cousin who only replies with a thumbs-up. Nobody can see the whole picture — so nobody decides.",
    image: '/story/01-chaos.webp',
    alt: 'A woman on a couch frowning at her phone while a cloud of chat bubbles and question marks swirls overhead.',
    chip: { kind: 'bubble', text: 'wait which weekend?? 🤷' },
  },
  {
    id: 'suggest',
    chapter: 'Suggest',
    title: 'Maya suggests a window. That’s it.',
    body:
      'She names the get-together, picks a range of dates, and types in who’s invited. No account. No password. No email. About a minute, start to finish.',
    image: '/story/02-suggest.webp',
    alt: 'The same woman relaxed at her kitchen table with tea, tapping a calendar on a tablet.',
    chip: { kind: 'field', label: 'Summer Reunion', text: 'Jun 1 – Aug 31 · 9 invited' },
  },
  {
    id: 'share',
    chapter: 'Share',
    title: 'One link. Drop it anywhere.',
    body:
      'Convene hands her a link to share and a private one to keep. She pastes it in the group chat. Nobody downloads an app or signs up for anything.',
    image: '/story/03-share.webp',
    alt: 'A paper airplane flies from a phone along a dotted trail to a cluster of houses on a hill.',
    chip: { kind: 'link', text: 'convene…/e/summer-reunion' },
  },
  {
    id: 'pick',
    chapter: 'Pick',
    title: 'Everyone taps their name, then their days.',
    body:
      'Grandma, the cousins, the couple with the newborn — each opens the link, taps who they are, and taps the dates that work. Plans change? Come back and update.',
    image: '/story/04-pick.webp',
    alt: 'A grandmother, a couple, a dad holding a toddler and a teenager each tap their phones as green checkmarks float up.',
    chip: { kind: 'days', days: ['Sat 12', 'Sun 13', 'Sat 19'] },
  },
  {
    id: 'decide',
    chapter: 'Decide',
    title: 'The best date lights up.',
    body:
      'Maya’s private link shows a heatmap of who’s free when. No spreadsheet, no counting thumbs — the date that works for the most people glows.',
    image: '/story/05-decide.webp',
    alt: 'The woman points at a calendar where one square glows like the sun among shaded squares.',
    chip: { kind: 'heat', levels: [1, 2, 4, 3, 1, 2, 0] },
  },
  {
    id: 'finalize',
    chapter: 'Finalize',
    title: 'Lock it in. See you there.',
    body:
      'One tap finalizes the date, and everyone with the link sees it. Forty-seven messages became one answer — and a long table under the trees.',
    image: '/story/06-gather.webp',
    alt: 'A big family laughing around a long picnic table under a tree with string lights at sunset.',
    chip: { kind: 'final', text: 'Sat, Jul 12' },
  },
];

export const AUTOPLAY_MS = 7000;

/** Wraps an index into [0, count). */
export function wrapIndex(i, count) {
  return ((i % count) + count) % count;
}
