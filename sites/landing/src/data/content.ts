export const DOCS_URL = "https://docs.synthseek.dev";
const GITHUB_REPO = "arukaraz/synthseek";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export const NAV_LINKS = [
  { label: "Documentation", href: DOCS_URL, desktop: true },
  { label: "Releases", href: `${DOCS_URL}/patch-notes`, desktop: true },
  { label: "FAQ", href: `${DOCS_URL}/faq`, desktop: false },
];

export const SETUP_STEPS = [
  {
    title: "Start the container",
    body: "One Docker compose file, one command.",
  },
  {
    title: "Run the wizard",
    body: "Admin account, download source, media server sign-in, optional API keys.",
  },
  {
    title: "Invite your people",
    body: "Accounts and roles for the whole household.",
  },
  {
    title: "Request away",
    body: "Tracks, albums, whole playlists. They arrive verified and tagged.",
  },
];

export const COMPARISON_ROWS = [
  { label: "Search that ranks every candidate", synthseek: "yes", diy: "scripts" },
  { label: "Fingerprint verification before import", synthseek: "with a free key", diy: "no" },
  { label: "Tagging with embedded art and album positions", synthseek: "yes", diy: "manual runs" },
  { label: "Playlists that sync to your media server", synthseek: "yes", diy: "no" },
  { label: "Play straight from any Subsonic music app", synthseek: "yes", diy: "another container" },
  { label: "Accounts, roles, and per-user requests", synthseek: "yes", diy: "no" },
  { label: "An AI assistant that can request for you", synthseek: "yes", diy: "no" },
  { label: "Containers to maintain", synthseek: "2, with slskd", diy: "4 to 6" },
];

export const FAQ_ITEMS = [
  {
    question: "What do I need before installing?",
    answer:
      "Docker, a running slskd instance with its own Soulseek account, and two folders: one where slskd puts completed downloads, one where your library lives. Everything else, including your media server connection, is set up from the wizard.",
  },
  {
    question: "What happens when a download is wrong?",
    answer:
      "It is held back instead of imported. The file waits in a review queue with the reason it was rejected, you can listen to it there, and that exact peer and file pairing is set aside so a retry looks elsewhere.",
  },
  {
    question: "Do I need any API keys?",
    answer:
      "None are required. One free AcoustID key is strongly recommended: it unlocks audio fingerprinting, the check that catches a file whose tags look right but whose audio is by a different artist.",
  },
  {
    question: "Can I control what other users do?",
    answer:
      "Yes. Roles decide who administers, whose requests import directly, and whose wait for approval. Administrator-only sections are hidden from members entirely.",
  },
];
