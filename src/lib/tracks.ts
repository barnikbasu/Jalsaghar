import { PlaylistId, Track, RaagInfo } from '../types';

export const EXTERNAL_LINKS = {
  youtubeMusic: 'https://music.youtube.com/playlist?list=PLADmqUxNquMg',
  spotify: 'https://open.spotify.com/playlist/1zVKSwcN1UDYBXsBWQlp16?si=-F4hxElZQqiGYqkdMnrgfg&nd=1&dlsi=9058ad3b40b24163',
};

/**
 * INITIAL JALSAGHAR RECORDING CATALOGUE
 * Curated Hindustani Classical Recitals and Baithak Recordings.
 * Single source of truth: youtubeUrl
 */
export const TRACK_CATALOG: Track[] = [
  // TRACK 01
  {
    id: 'maru-bihag-ajoy-chakraborty',
    title: 'Raag Maru Bihag',
    artist: 'Pt. Ajoy Chakraborty',
    raga: 'Maru Bihag',
    youtubeUrl: 'https://youtu.be/cTZVhluhuXo?si=ZZ5-okWkJKKApnI0',
    playlistId: 'baithak',
  },
  // TRACK 02
  {
    id: 'behag-rashid-khan',
    title: 'Raga Behag',
    artist: 'Ustad Rashid Khan',
    raga: 'Behag',
    youtubeUrl: 'https://youtu.be/9yKmsoFiHWc?si=crZMyKKj2Veo2Cow',
    playlistId: 'baithak',
  },
  // TRACK 03
  {
    id: 'jhinjhoti-nikhil-banerjee',
    title: 'Raga Jhinjhoti',
    artist: 'Pt. Nikhil Banerjee',
    raga: 'Jhinjhoti',
    youtubeUrl: 'https://youtu.be/Oq1RdHuPDSo?si=Krk-ReG1Fj6Uzfe8',
    playlistId: 'baithak',
  },
  // TRACK 04
  {
    id: 'yaman-vilayat-khan',
    title: 'Raga Yaman',
    artist: 'Ustad Vilayat Khan',
    raga: 'Yaman',
    youtubeUrl: 'https://youtu.be/tGBKs7swowk?si=wmAvZe-QzWm12pS1',
    playlistId: 'baithak',
  },
  // TRACK 05
  {
    id: 'kafi-ali-akbar-khan',
    title: 'Raag Kafi',
    artist: 'Ustad Ali Akbar Khan',
    raga: 'Kafi',
    youtubeUrl: 'https://youtu.be/_swvClUvudM?si=O9iiVw2FcLFKtmA1',
    playlistId: 'baithak',
  },
  // TRACK 06
  {
    id: 'manj-khamaj-ravi-shankar-ali-akbar-khan',
    title: 'Raag Manj Khamaj',
    artist: 'Ravi Shankar & Ali Akbar Khan',
    raga: 'Manj Khamaj',
    youtubeUrl: 'https://youtu.be/R0rt4wBMoes?si=MsJtPAkCEz9zaaJ',
    playlistId: 'riyaz',
  },
  // TRACK 07
  {
    id: 'yaman-kalyan-rajan-sajan-mishra',
    title: 'Yaman Kalyan',
    artist: 'Pt. Rajan-Sajan Mishra',
    raga: 'Yaman Kalyan',
    youtubeUrl: 'https://youtu.be/D_VEnj0znMk?si=BjM-y1ccAeq8u9lJ',
    playlistId: 'riyaz',
  },
  // TRACK 08
  {
    id: 'rashid-khan-ajoy-chakraborty',
    title: 'Ustad Rashid Khan & Pt. Ajoy Chakraborty',
    artist: 'Ustad Rashid Khan & Pt. Ajoy Chakraborty',
    youtubeUrl: 'https://youtu.be/PjXjsEbt4dw?si=Ni-cK4eOXGgAFHJc',
    playlistId: 'baithak',
  },
  // TRACK 09
  {
    id: 'bihag-ali-akbar-khan-vilayat-khan',
    title: 'Raga Bihag',
    artist: 'Ustad Ali Akbar Khan & Ustad Vilayat Khan',
    raga: 'Bihag',
    youtubeUrl: 'https://youtu.be/_P9j0fjn0XU?si=M8jFYW_6Zdqh34c7',
    playlistId: 'mehfil',
  },
  // TRACK 10
  {
    id: 'yaman-kalyan-bhimsen-joshi',
    title: 'Raag Yaman Kalyan',
    artist: 'Pt. Bhimsen Joshi',
    raga: 'Yaman Kalyan',
    youtubeUrl: 'https://youtu.be/xH-5Z_IMnmc?si=j44yFNm_bjZ9SOov',
    playlistId: 'mehfil',
  },
  // TRACK 11
  {
    id: 'bihag-bade-ghulam-ali-khan-munawar-ali-khan',
    title: 'Raag Bihag',
    artist: 'Ustad Bade Ghulam Ali Khan & Ustad Munawar Ali Khan',
    raga: 'Bihag',
    youtubeUrl: 'https://youtu.be/5dE6goFUrAw?si=skwxc0yesGHhP2sJ',
    playlistId: 'mehfil',
  },
  // TRACK 12
  {
    id: 'bhimpalasi-ali-akbar-khan-nikhil-banerjee',
    title: 'Raag Bhimpalasi',
    artist: 'Ustad Ali Akbar Khan & Pt. Nikhil Banerjee',
    raga: 'Bhimpalasi',
    youtubeUrl: 'https://youtu.be/xh0LuGC7qO4?si=eXM5eTVAmYa56yfe',
    playlistId: 'baithak',
  },
  // TRACK 13
  {
    id: 'desh-buddhadev-dasgupta-zakir-hussain',
    title: 'Raga Desh',
    artist: 'Pt. Buddhadev Dasgupta & Ustad Zakir Hussain',
    raga: 'Desh',
    youtubeUrl: 'https://music.youtube.com/watch?v=-M2qaC_CRdQ&si=bnIcW8mlRfUumqb4',
    playlistId: 'baithak',
  },
  // TRACK 14
  {
    id: 'jhinjhoti-abir-hussain',
    title: 'Raga Jhinjhoti',
    artist: 'Abir Hussain',
    raga: 'Jhinjhoti',
    instrument: 'Sarod',
    youtubeUrl: 'https://youtu.be/18JwAmSTsY8?si=KrIxbENyU1qgMyg2',
    playlistId: 'riyaz',
  },
];

/**
 * Known classical raga context dictionary for generating rich archival notes
 * without manual duplicate databases.
 */
const KNOWN_RAGA_ATTRIBUTES: Record<string, { timeOfDay: string; thaat: string; mood: string }> = {
  yaman: {
    timeOfDay: 'First prahar of the night (Evening twilight / 7 PM – 10 PM)',
    thaat: 'Kalyan',
    mood: 'Serenity, romantic devotion, divine tranquility, and evening grace',
  },
  'yaman kalyan': {
    timeOfDay: 'First prahar of the night (Evening twilight / 7 PM – 10 PM)',
    thaat: 'Kalyan',
    mood: 'Expansive peace, nocturnal grandeur, solemn romantic majesty',
  },
  bihag: {
    timeOfDay: 'Second prahar of the night (Late evening / 10 PM – Midnight)',
    thaat: 'Bilawal',
    mood: 'Sensuous nocturnal joy, gentle celebration, aristocratic yearning',
  },
  'maru bihag': {
    timeOfDay: 'Late evening to midnight',
    thaat: 'Kalyan',
    mood: 'Tender contemplation, delicate romantic longing, poignant serenity',
  },
  jhinjhoti: {
    timeOfDay: 'Late night (Second/third prahar)',
    thaat: 'Khamaj',
    mood: 'Soulful melody, romantic charm, wistful thumri mood and grace',
  },
  kafi: {
    timeOfDay: 'Late night / Spring seasonal',
    thaat: 'Kafi',
    mood: 'Devotional joy, lively romantic expression, earthy sweetness',
  },
  'manj khamaj': {
    timeOfDay: 'Late evening / Night',
    thaat: 'Khamaj',
    mood: 'Lyrical romanticism, playful melodic contours, intimate mehfil beauty',
  },
  bhimpalasi: {
    timeOfDay: 'Late afternoon (Triteeya Prahar / 3 PM – 6 PM)',
    thaat: 'Kafi',
    mood: 'Passionate longing, tender devotion, melancholic afternoon beauty',
  },
  desh: {
    timeOfDay: 'Second prahar of the night / Monsoon',
    thaat: 'Khamaj',
    mood: 'Evocative romanticism, nostalgic yearning, joyous monsoon sentiment',
  },
};

/**
 * Dynamically derived Raag Catalog.
 * Extracts unique ragas from the recording catalogue and groups track IDs automatically.
 */
export function buildRaagCatalog(tracks: Track[]): RaagInfo[] {
  const ragaMap = new Map<string, { name: string; tracks: string[] }>();

  tracks.forEach((track) => {
    if (!track.raga) return;
    const cleanRagaName = track.raga.trim();
    // Normalize key for grouping: e.g. "Raga Yaman" -> "yaman", "Raag Bihag" -> "bihag"
    const normalizedKey = cleanRagaName.toLowerCase().replace(/^(raag|raga)\s+/i, '').trim();

    if (!ragaMap.has(normalizedKey)) {
      ragaMap.set(normalizedKey, {
        name: cleanRagaName.startsWith('Raag ') || cleanRagaName.startsWith('Raga ')
          ? cleanRagaName
          : `Raag ${cleanRagaName}`,
        tracks: [],
      });
    }

    ragaMap.get(normalizedKey)!.tracks.push(track.id);
  });

  const catalog: RaagInfo[] = [];

  ragaMap.forEach((entry, key) => {
    const known = KNOWN_RAGA_ATTRIBUTES[key] || {
      timeOfDay: 'Classical Mehfil Hour',
      thaat: 'Traditional',
      mood: 'Immersive meditative baithak recital',
    };

    catalog.push({
      name: entry.name,
      timeOfDay: known.timeOfDay,
      thaat: known.thaat,
      mood: known.mood,
      tracks: entry.tracks,
    });
  });

  return catalog;
}

export const RAAG_CATALOG: RaagInfo[] = buildRaagCatalog(TRACK_CATALOG);

export function getTracksByPlaylist(playlistId: PlaylistId): Track[] {
  const matches = TRACK_CATALOG.filter((t) => t.playlistId === playlistId);
  return matches.length > 0 ? matches : TRACK_CATALOG;
}
