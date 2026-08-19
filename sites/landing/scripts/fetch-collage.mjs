import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "public", "collage");
const STAGE_DIR = join(HERE, "..", "public", "collage.staging");
const MANIFEST = join(HERE, "..", "src", "data", "collage.json");
const TILE_PX = 256;
const BLUR_SIGMA = 4.2;
const WEBP_QUALITY = 58;
const MINIMUM_COVERS = 60;
const API = "https://api.deezer.com";

const ARTISTS = [
  "Radiohead",
  "Pink Floyd",
  "Miles Davis",
  "Kendrick Lamar",
  "Fleetwood Mac",
  "Daft Punk",
  "The Beatles",
  "Nina Simone",
  "Aphex Twin",
  "Talking Heads",
  "Bjork",
  "Massive Attack",
  "John Coltrane",
  "Portishead",
  "Led Zeppelin",
  "Kraftwerk",
  "David Bowie",
  "Stevie Wonder",
  "The Velvet Underground",
  "Joy Division",
  "Nirvana",
  "A Tribe Called Quest",
  "Bob Marley",
  "Amy Winehouse",
  "Burial",
  "Boards of Canada",
  "The Clash",
  "Curtis Mayfield",
  "My Bloody Valentine",
  "Sufjan Stevens",
  "Erykah Badu",
  "Wu-Tang Clan",
  "Sigur Ros",
  "Beach House",
  "Frank Ocean",
  "Tame Impala",
  "The Cure",
  "New Order",
  "Bonobo",
  "Four Tet",
  "Khruangbin",
  "Thundercat",
  "Flying Lotus",
  "J Dilla",
  "Herbie Hancock",
  "Charles Mingus",
  "Bill Evans",
  "Ella Fitzgerald",
  "Etta James",
  "Marvin Gaye",
  "Al Green",
  "Sam Cooke",
  "Otis Redding",
  "The Rolling Stones",
  "Queen",
  "Prince",
  "Michael Jackson",
  "Tears for Fears",
  "Depeche Mode",
  "The Smiths",
  "Pixies",
  "Sonic Youth",
  "Slowdive",
  "Cocteau Twins",
  "Mazzy Star",
  "Arcade Fire",
  "LCD Soundsystem",
  "Vampire Weekend",
  "The National",
  "Bon Iver",
  "Fleet Foxes",
  "Grizzly Bear",
  "Alt-J",
  "Glass Animals",
  "Jamiroquai",
  "Gorillaz",
  "Blur",
  "Oasis",
  "Pulp",
  "Manu Chao",
  "Buena Vista Social Club",
  "Caetano Veloso",
  "Gilberto Gil",
  "Antonio Carlos Jobim",
  "Stan Getz",
  "Astor Piazzolla",
  "Rosalia",
  "Bad Bunny",
  "Mago de Oz",
  "Heroes del Silencio",
  "Soda Stereo",
  "Cafe Tacvba",
  "Los Fabulosos Cadillacs",
  "Fela Kuti",
  "Ali Farka Toure",
  "Tinariwen",
  "Ravi Shankar",
  "Ryuichi Sakamoto",
  "Nils Frahm",
  "Max Richter",
  "Olafur Arnalds",
  "Steve Reich",
  "Philip Glass",
  "Brian Eno",
  "Jon Hopkins",
  "Caribou",
  "Floating Points",
  "Moderat",
  "Rufus Du Sol",
  "The Chemical Brothers",
  "Underworld",
  "Orbital",
];

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "synthseek-landing-collage/1.0" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function coverForArtist(name) {
  const search = await getJson(`${API}/search/artist?q=${encodeURIComponent(name)}&limit=1`);
  const artist = search.data?.[0];
  if (!artist) return null;

  const top = await getJson(`${API}/artist/${artist.id}/top?limit=8`);
  for (const track of top.data ?? []) {
    const cover = track.album?.cover_xl ?? track.album?.cover_big;
    if (cover) return { artist: artist.name, album: track.album.title, cover };
  }

  const albums = await getJson(`${API}/artist/${artist.id}/albums?limit=8`);
  for (const album of albums.data ?? []) {
    const cover = album.cover_xl ?? album.cover_big;
    if (cover) return { artist: artist.name, album: album.title, cover };
  }
  return null;
}

async function main() {
  await rm(STAGE_DIR, { recursive: true, force: true });
  await mkdir(STAGE_DIR, { recursive: true });

  const seen = new Set();
  const manifest = [];

  for (const name of ARTISTS) {
    if (manifest.length >= 100) break;
    try {
      const found = await coverForArtist(name);
      if (!found) {
        console.warn(`skip (no cover): ${name}`);
        continue;
      }
      if (seen.has(found.cover)) {
        console.warn(`skip (duplicate cover): ${name}`);
        continue;
      }
      seen.add(found.cover);

      const res = await fetch(found.cover);
      if (!res.ok) throw new Error(`${res.status} cover`);
      const buf = Buffer.from(await res.arrayBuffer());

      const index = String(manifest.length).padStart(3, "0");
      const file = `${index}.webp`;
      await sharp(buf)
        .resize(TILE_PX, TILE_PX, { fit: "cover" })
        .blur(BLUR_SIGMA)
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toFile(join(STAGE_DIR, file));

      manifest.push({ file, artist: found.artist, album: found.album });
      console.log(`${index}  ${found.artist}, ${found.album}`);
    } catch (error) {
      console.warn(`skip (${error instanceof Error ? error.message : "error"}): ${name}`);
    }
  }

  if (manifest.length < MINIMUM_COVERS) {
    await rm(STAGE_DIR, { recursive: true, force: true });
    throw new Error(
      `only ${manifest.length} covers fetched, need at least ${MINIMUM_COVERS}. Existing pool left untouched.`,
    );
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await rename(STAGE_DIR, OUT_DIR);
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const files = await readdir(OUT_DIR);
  console.log(`\nwrote ${files.length} covers to public/collage and src/data/collage.json`);
}

await main();
