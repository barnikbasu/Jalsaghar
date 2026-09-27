# জলসাঘর — JALSAGHAR

### A Digital Mehfil for Indian Classical Music

<p align="center">
  <strong>Artwork is the world. Music is the soul.</strong>
</p>

<p align="center">
  An immersive digital listening room inspired by Hindustani classical music,
  Bengali musical heritage, baithak culture, old Kolkata, and the quiet intimacy
  of an Indian mehfil.
</p>

<p align="center">
  <a href="https://jalsaghar.vercel.app/">Live Experience</a>
  ·
  <a href="https://github.com/barnikbasu/jalsaghar">GitHub</a>
</p>

---

## ✦ What is JALSAGHAR?

**জলসাঘর (JALSAGHAR)** is an immersive digital listening room built around Indian classical music, Bengali cultural memory, and the atmosphere of an old musical gathering.

It is intentionally **not** a Spotify clone, music dashboard, conventional streaming-library interface, or card-heavy media application.

Instead, JALSAGHAR imagines the web as an old musical room:

- a quiet baithak
- warm lamps
- fading aristocratic interiors
- rain outside
- listeners gathered without distraction
- a musician somewhere within the room
- old paintings and textiles
- the atmosphere of Kolkata and Bengal
- and music that feels older than the screen carrying it

The central idea is simple:

> **What if listening to Indian classical music on the web felt less like opening an application and more like entering a room?**

JALSAGHAR is that room.

---

## ✦ Design Philosophy

The entire experience is built around one principle:

> **The artwork is the world. Music is the soul. UI is the furniture.**

This means the interface deliberately avoids the visual language of conventional streaming platforms. There is no:

- sidebar
- dashboard
- album-grid homepage
- generic search-first experience
- profile page
- settings-heavy navigation
- oversized application chrome
- floating equalizers
- decorative musical notes
- unnecessary cards everywhere

Instead, the website prioritizes:

1. **Atmosphere**
2. **Artwork**
3. **Music**
4. **Cultural context**
5. **Minimal interaction**

The interface is deliberately quiet. The technology should feel almost invisible.

---

## ✦ The Experience

### 01 — Enter the Mehfil

The experience begins behind heavy burgundy and near-black curtains.

A narrow warm seam of light appears at the center. The Bengali wordmark emerges:

> **জলসাঘর**

The curtains then open outward, revealing the current musical room.

The intended emotional transition is:

```text
outside
   ↓
threshold
   ↓
curtain
   ↓
musical room
   ↓
mehfil
```

The curtain animation is designed to feel like entering an old performance room rather than opening a website. The movement is intentionally:

- theatrical
- restrained
- tactile
- slightly imperfect
- warm
- ceremonial

The curtains should feel like physical fabric with mass and inertia rather than a generic CSS reveal. Reduced-motion preferences are respected so the experience remains accessible.

---

### 02 — A Room That Changes With Time

JALSAGHAR uses **Asia/Kolkata** time to determine the visual atmosphere of the room.

The day is divided into four periods:

| Period     | Time        | Visual    |
| ---------- | ----------- | --------- |
| **SHOKAL** | 05:00–10:59 | Morning   |
| **DUPUR**  | 11:00–15:59 | Afternoon |
| **BIKEL**  | 16:00–18:59 | Evening   |
| **RAAT**   | 19:00–04:59 | Night     |

The current time is displayed as a quiet, read-only clock. The artwork changes automatically as the day moves through these periods, without requiring a page reload.

The visual change is deliberately subtle:

- no abrupt image swap
- no zoom
- no parallax
- no Ken Burns effect
- no unnecessary animation
- no manual atmosphere selector

Instead, the room quietly becomes another moment of the day — a soft crossfade rather than a hard image swap.

**Time affects the world — not the music.** The clock is informational. The time-of-day system controls the artwork and atmosphere, not the playlist or recording selection.

---

## ✦ The Artwork

The artwork is the visual heart of JALSAGHAR — the primary environment, not decoration.

It represents an imagined world of:

- Bengali zamindar houses
- old Kolkata
- intimate baithaks
- Hindustani classical mehfils
- Indian musical salons
- monsoon evenings
- fading estates
- old paintings
- traditional textiles
- brass lamps
- red oxide floors
- rain-washed courtyards
- quiet aristocratic interiors

The visual language takes inspiration from the emotional atmosphere associated with:

- *Jalsaghar*
- *Qala*
- *Bandish Bandits*
- *Ek Je Chhilo Raja*
- Indian miniature painting
- watercolor and gouache
- restrained oil painting
- sophisticated Indian period production design

These are references for **mood, materiality, composition, and cultural atmosphere**. They are not intended to reproduce copyrighted frames, characters, costumes, posters, or visual identities.

The objective is:

> **A painting that happens to feel like a film frame, not a film frame with a painting filter.**

### Artwork Direction

The visual hierarchy follows:

```text
atmosphere
    ↓
composition
    ↓
light
    ↓
human gesture
    ↓
architecture
    ↓
instruments
    ↓
texture
    ↓
micro-detail
```

The artwork favors:

- indigo
- midnight blue
- aged teal
- muted emerald
- burnt umber
- burgundy
- terracotta
- antique brown
- saffron
- warm cream / warm ivory
- dusty rose
- faded maroon
- old ivory
- restrained antique gold / muted gold

Material references include:

- aged paper and pigment
- dry brush
- hand-painted surfaces
- brass and terracotta
- wood
- handwoven textiles
- stone
- old plaster
- glass (used sparingly)

Lighting combines oil lamps, brass lamps, diyas, and warm interior light with indigo shadows, cool evening haze, and monsoon atmosphere. The scenes should feel lived-in rather than staged, and the result is intended to feel intimate rather than spectacular.

### Human Presence

People inside the artwork are environmental characters rather than fashion subjects. They should feel:

- natural
- culturally grounded
- relaxed
- proportionate
- quietly expressive
- unaware of the viewer

The intended atmosphere is an audience listening to music — not an audience performing for a camera.

There are deliberately no:

- fashion-model poses
- direct camera gazes
- exaggerated expressions
- celebrity likenesses
- artificial crowds
- smartphones
- modern concert stages
- LED walls
- DJ setups
- western-orchestra aesthetics

The people belong to the room. The room does not exist for the people.

### What the Artwork Deliberately Avoids

- generic fantasy palaces
- Bollywood-poster aesthetics
- wedding photography
- excessive gold
- modern concert stages / LED screens
- smartphones / DJ culture
- western orchestras
- giant crowds
- fashion-model posing
- celebrity likenesses
- floating musical notes
- artificial equalizers
- excessive HDR / neon lighting / lens flare
- generic AI-looking compositions

### Responsive Artwork

JALSAGHAR uses dedicated artwork compositions for different aspect ratios:

```text
public/bg/
├── shokal-wide.png
├── shokal-tall.png
├── dupur-wide.png
├── dupur-tall.png
├── bikel-wide.png
├── bikel-tall.png
├── raat-wide.png
└── raat-tall.png
```

The `wide` compositions are intended for desktop and landscape displays. The `tall` compositions are independently composed for portrait and mobile displays. The mobile experience does **not** simply crop the desktop artwork — this preserves the composition of the room across screen sizes.

---

## ✦ The Music

The musical catalogue is intentionally curated. JALSAGHAR is not attempting to compete with commercial streaming platforms in catalogue size — it presents a focused collection of Indian classical recordings selected for their musical and cultural character.

The current catalogue includes recordings associated with artists such as:

- Pt. Ajoy Chakraborty
- Ustad Rashid Khan
- Pt. Nikhil Banerjee
- Ustad Vilayat Khan
- Ustad Ali Akbar Khan
- Ravi Shankar
- Pt. Rajan-Sajan Mishra
- Pt. Bhimsen Joshi
- Ustad Bade Ghulam Ali Khan
- Ustad Munawar Ali Khan
- Pt. Buddhadev Dasgupta
- Ustad Zakir Hussain
- Abir Hussain

The collection is treated as a **curated musical shelf**, not an attempt to imitate an unlimited streaming catalogue.

Each recording is represented by metadata such as:

- Title
- Artist
- Raag
- YouTube URL

The application preserves the exact source URLs supplied for the catalogue and does not claim ownership of third-party recordings.

---

## ✦ Raag Index

Instead of building a conventional music-library search experience, JALSAGHAR provides a **Raag Index**. The index organizes available recordings around their raga context.

The conceptual hierarchy is:

```text
JALSAGHAR
    ↓
music
    ↓
raag
    ↓
recording
```

Rather than the conventional:

```text
Search
    ↓
Results
    ↓
Album
    ↓
Track
```

The Raag Index is intended to feel closer to opening an old musical register than browsing a modern database. Where confidently established raga information is unavailable, the catalogue does not invent metadata simply to make the interface look complete.

---

## ✦ Collections

JALSAGHAR organizes listening into simple thematic collections such as:

- Baithak
- Riyaz
- Mehfil

These are intentionally lightweight — meant to provide mood and context without creating a complex library-management system.

---

## ✦ The Player

The JALSAGHAR player is intentionally minimal. It provides the essential controls for a focused listening experience:

- Play / Pause
- Previous / Next
- Seek
- Elapsed time / Duration
- Volume / Mute
- Shuffle / Repeat
- Queue / Up Next
- Raag Index
- Track information

The player is visually integrated into the room — it should feel like part of the environment rather than a separate application sitting on top of the artwork. The artwork remains dominant.

### Player Philosophy

> **Controls should exist when needed and disappear into the atmosphere when they are not.**

The interface avoids:

- giant playback controls
- decorative equalizers
- animated music notes
- unnecessary visualization
- oversized cards
- excessive metadata
- conventional streaming-app chrome

The player is functional furniture inside the room.

### Up Next

The Up Next experience provides access to the upcoming listening sequence without turning JALSAGHAR into a conventional playlist-management application. The queue supports deliberate track selection, next/previous navigation, repeat, shuffle, and collection-based listening. Explicit selection follows the same canonical playback path as normal next/previous navigation.

---

## ✦ YouTube Playback

JALSAGHAR currently uses the official **YouTube IFrame Player API** for YouTube-based playback. The custom JALSAGHAR interface controls the legitimate embedded YouTube player.

Conceptually:

```text
JALSAGHAR UI
      ↓
MusicPlayer
      ↓
YouTubePlayer
      ↓
YouTube IFrame API
      ↓
YouTube
```

JALSAGHAR does **not**:

- extract YouTube audio
- separate audio from video
- download YouTube recordings
- hide YouTube players
- move players off-screen
- use 1px or invisible players
- manipulate opacity to conceal playback
- bypass creator-controlled embedding restrictions
- circumvent YouTube playback controls

The YouTube player remains a legitimate embedded player.

### YouTube Embed Restrictions

Some recordings in the curated catalogue are publicly accessible directly on YouTube but do not permit embedded playback. When that happens, JALSAGHAR does not attempt to circumvent the restriction — instead, the application enters an explicit **YouTube-only** state. The user remains on the selected recording and receives a direct link to the original source.

The intended presentation is:

```text
Raag Maru Bihag
Pt. Ajoy Chakraborty

AVAILABLE ON YOUTUBE

This recording can't be played inside JALSAGHAR.

[ Listen directly on YouTube ↗ ]
```

The recording is not necessarily unavailable — it is unavailable **inside the JALSAGHAR embedded player**. JALSAGHAR therefore does not describe such a recording simply as `RECORDING UNAVAILABLE`, because that would incorrectly imply the original recording no longer exists.

The intended decision flow is:

```text
Curated recording
       ↓
Try legitimate embedded playback
       ↓
Embedding permitted?
   ↙           ↘
 YES            NO
  ↓              ↓
Play inside      Keep recording selected
JALSAGHAR        ↓
                 AVAILABLE ON YOUTUBE
                 ↓
                 Listen directly on YouTube
```

### YouTube Error Handling

YouTube playback errors are treated according to their actual runtime error codes:

| Code  | Meaning                                                     |
| ----- | ------------------------------------------------------------ |
| `100` | Video unavailable, removed, private, or otherwise not found |
| `101` | Embedding not allowed                                       |
| `150` | Embedding not allowed                                       |
| `153` | Missing or invalid HTTP Referer / API client identification |
| `5`   | HTML5/player error                                           |

Autoplay blocking is treated separately from content/embed errors. The application does not silently convert different YouTube errors into the same diagnosis — the raw error code remains available for development diagnostics.

### Playback State Philosophy

JALSAGHAR distinguishes between selecting a recording and successfully playing a recording:

```text
idle
  ↓
loading
  ↓
playing
  ↓
paused
```

or:

```text
selected
   ↓
YouTube refuses embedded playback
   ↓
youtube-only
```

A selected track is therefore not automatically assumed to be playing. JALSAGHAR distinguishes between: selected recording, requested playback, actual player state, and embedding availability.

If a YouTube embedding restriction occurs:

- the selected recording remains selected
- no automatic next-track transition occurs
- no artificial progress is displayed
- no retry loop is started
- the original YouTube URL is preserved
- the user receives a direct listening option

### Playback Reliability

The player architecture is designed around a canonical playback path. Track selection from Queue, Raag Index, Up Next, Previous, Next, Repeat, or Shuffle all resolve through the same playback mechanism.

The implementation avoids:

- fake clicks
- artificial timers / fake progress
- retry loops / buffering watchdogs
- unnecessary player recreation
- automatic recording substitution
- duplicate playback commands

The actual YouTube player state remains the source of truth for embedded playback.

---

## ✦ Time Is Visual, Not Algorithmic

The time-of-day system changes the visual room, not the listening algorithm.

```text
SHOKAL → morning artwork
DUPUR  → afternoon artwork
BIKEL  → evening artwork
RAAT   → night artwork
```

It does **not** mean:

- morning → automatically play Bhairav
- evening → automatically play Yaman
- night → automatically play Darbari

JALSAGHAR does not pretend to know what the listener should hear. The listener chooses the music — the room simply changes around them.

---

## ✦ Interface

The interface intentionally behaves more like an art installation than a dashboard.

### Top-Right Utilities

The top-right area intentionally remains compact, with two conceptual groups:

**Media & Streaming** (direct external destinations):

- YouTube Music
- Spotify

**Utility:**

- co-listening / group listening
- chai / support

External media destinations take the user to their respective services rather than attempting to reproduce those services inside JALSAGHAR.

### External Music Links

YouTube Music:
<a href="https://music.youtube.com/playlist?list=PLADmqUxNquMg&si=q0EfI8kpXyPBfULX">YouTube Music Playlist</a>

Spotify:
<a href="https://open.spotify.com/playlist/5v8AL0bXouWWTtiEjWAJb5?si=gConKLI8SW6w-kzwP8GIPg">Spotify Playlist</a>

### Made with Bhalobasha

> **Made with Bhalobasha by**
>
> ### Barnik Basu
> `Creator · Developer`

The card is intentionally compact and personal — it is not a portfolio section. It is a small acknowledgment of the person who made the room.

**Creator links**

- <a href="https://www.linkedin.com/in/barnik-basu/">LinkedIn</a>
- <a href="https://www.instagram.com/barnikbasu/">Instagram</a>
- <a href="mailto:barnikbasu@gmail.com">Email</a>

### Buy Us a Chai

JALSAGHAR includes a small voluntary support card:

> **Buy us a chai**
> Keep the mehfil playing.

UPI:

```text
barnikbasu@oksbi
```

The card includes a UPI ID, QR code, copy action, subtle copied confirmation, and scanning instruction. The support experience is intentionally compact, respectful, non-intrusive, and optional. There is no aggressive donation language.

---

## ✦ Typography

Typography is part of the cultural identity of JALSAGHAR.

**Bengali**

The Bengali wordmark uses **Mina**. Supporting Bengali typography may use **Galada** (as a controlled secondary/alternate display face) and **Hind Siliguri** for supporting text.

**English**

English display/interface typography uses **Rozha One**.

Typography is intentionally artistic and editorial rather than resembling a generic SaaS interface. Generic interface-first fonts such as Inter, Roboto, or Geist are not used as the primary visual identity. The typographic direction aims to balance Bengali identity, Indian classical heritage, editorial elegance, and modern digital clarity.

---

## ✦ Language

The primary Bengali brand identity is **জলসাঘর**. Supporting interface text remains primarily English.

This is intentional — the project is not trying to translate every interface element merely for the sake of bilingualism. The Bengali wordmark carries the cultural identity while English keeps the interactive layer accessible and concise.

---

## ✦ What JALSAGHAR Deliberately Avoids

JALSAGHAR intentionally avoids becoming:

- a Spotify clone
- a YouTube clone
- a generic music dashboard
- a conventional streaming library
- an AI-generated "Indian" stereotype
- a palace-themed fantasy interface
- a Bollywood poster
- a wedding aesthetic
- a luxury hotel website
- a generic meditation app
- a neon music visualizer
- a card-heavy SaaS dashboard
- a conventional portfolio website
- a social network
- a music marketplace
- a music analytics dashboard
- a recommendation engine
- a replacement for professional music archives

There are deliberately no:

- floating music notes
- giant equalizers
- neon gradients
- excessive gold
- throne rooms
- Maharaja stereotypes
- huge crowds
- modern LED stages
- DJ interfaces
- celebrity imagery
- copied movie frames
- fake metadata
- decorative UI for its own sake
- streaks, achievements, or engagement counters
- artificial recommendations
- social-feed mechanics

The visual objective is:

> **Quiet sophistication.**

---

## ✦ Cultural Direction

The project sits at the meeting point of:

```text
Bengali atmosphere
        +
Hindustani classical music
        +
old Indian musical culture
        +
digital design
```

The cultural details should feel lived-in rather than ornamental. JALSAGHAR is not intended to present Indian classical music as an exotic visual theme — the goal is to create an imagined digital memory of a musical India.

---

## ✦ Why the Name "JALSAGHAR"?

**জলসাঘর (Jalsaghar)** evokes the traditional world of musical gatherings, salons, and rooms associated with music and performance.

```text
জলসা
  ↓
gathering / celebration / musical assembly

ঘর
  ↓
room / home / intimate space
```

The name carries associations with music, gathering, listening, Bengali cultural memory, old-world interiors, performance, hospitality, and nostalgia.

For this project, JALSAGHAR is more than a title. It describes the central metaphor:

> **A room made for music.**

---

## ✦ Design References

JALSAGHAR draws inspiration from:

- Indian classical mehfils
- Bengali baithak culture
- old Kolkata
- zamindar-era interiors
- Indian miniature painting
- traditional musical gatherings
- monsoon evenings
- old radio listening
- Satyajit Ray's visual language
- contemporary Indian period cinema
- physical music rooms
- personal listening rituals

The project also takes conceptual inspiration from nostalgic and artistic playlist websites. These references inform atmosphere, composition, interaction philosophy, cultural context, and materiality. They do not represent an attempt to copy another website's branding, layout, artwork, text, or identity.

---

## ✦ Product Philosophy

JALSAGHAR is intentionally small. It does not need:

```text
more screens
more buttons
more cards
more categories
more notifications
more recommendations
```

It needs:

```text
better atmosphere
better music
better curation
better listening
better transitions
better details
```

The goal is not to maximize time spent on the website. The goal is to make the time spent there feel meaningful.

Every future feature should be evaluated against a few simple questions:

- **Does it strengthen the room?** If yes, consider it.
- **Does it make JALSAGHAR look like a generic music app?** Avoid it.
- **Does it compete with the artwork?** Reduce it.
- **Does it make listening easier without adding visual noise?** Keep it.
- **Does it exist only because another streaming service has it?** Question whether it belongs.
- **Does it make the cultural experience feel more authentic?** Consider it carefully.

The guiding principle remains:

> **More atmosphere. Less interface.**

---

## ✦ Design Rules

The following principles should remain stable even as the implementation evolves.

1. **Artwork first** — The artwork should always be the dominant visual layer.
2. **Music second** — The current recording should remain easy to understand and control.
3. **UI third** — Controls should exist when needed without dominating the room.
4. **No unnecessary gamification** — no streaks, achievements, engagement counters, artificial recommendations, or social-feed mechanics.
5. **No fake complexity** — JALSAGHAR should not add features simply because a conventional music application has them.
6. **Respect the listener** — the user chooses what to hear.
7. **Respect the music** — recordings should be presented with context and restraint.
8. **Respect the platforms** — third-party playback restrictions should not be bypassed.
9. **Respect the culture** — Indian classical music should not be reduced to decorative "Indian" aesthetics.
10. **Keep the room quiet** — the interface should know when to disappear.

---

## ✦ Interaction Principles

Every interaction follows one principle:

> **The user should understand what happened without the interface shouting about it.**

The preferred interaction model is:

```text
click
  ↓
small visual response
  ↓
state changes
  ↓
room remains calm
```

rather than:

```text
click
  ↓
toast
  ↓
modal
  ↓
notification
  ↓
animation
  ↓
layout shift
```

JALSAGHAR favors quiet feedback.

---

## ✦ Keyboard Controls

The player supports keyboard interaction for desktop listening:

| Key     | Action                    |
| ------- | ------------------------- |
| `Space` | Play / Pause              |
| `←`     | Seek backward              |
| `→`     | Seek forward                |
| `M`     | Mute / Unmute              |
| `N`     | Next track                 |
| `P`     | Previous track             |
| `L`     | Toggle loop / repeat       |
| `Q`     | Queue / Up Next            |

Keyboard shortcuts should not interfere with text-entry fields or modal interactions, and should never create unexpected playback commands.

---

## ✦ Responsive Design

JALSAGHAR is designed around the idea that the room should remain the room regardless of the device.

**Desktop / Landscape** emphasizes:

- cinematic wide artwork
- spacious composition
- restrained floating controls
- full player interaction
- atmospheric negative space

**Mobile / Portrait** emphasizes:

- dedicated tall artwork
- compact controls
- touch-friendly interaction
- safe-area awareness
- readable metadata
- usable modals
- accessible QR code
- preserved artwork composition
- reduced visual density

The interface should never become a conventional mobile dashboard simply because the viewport is smaller. The mobile experience is not a simple cropped version of the desktop composition.

---

## ✦ Accessibility

Although JALSAGHAR is highly visual, accessibility remains part of the implementation. The interface aims to provide:

- semantic controls and accessible labels
- keyboard interaction
- Escape-to-close modal behavior
- visible focus states where appropriate
- reduced-motion support
- readable contrast
- touch-friendly controls
- accessible external links
- meaningful playback status messages
- focus management and safe-area spacing on mobile

Decorative elements should never become interaction barriers. The immersive design should never require sacrificing basic usability.

---

## ✦ Performance Philosophy

JALSAGHAR is visually rich, but visual richness should not require unnecessary technical weight. The implementation aims to:

- avoid unnecessary dependencies
- avoid unnecessary global state
- avoid unnecessary rerenders
- maintain stable YouTube player instances
- load artwork responsibly (correct orientation, avoid loading unnecessary scenes)
- keep animations efficient (CSS transitions where appropriate)
- avoid playback retry loops
- preserve responsive performance

The goal is rich atmosphere without turning the experience into a heavy application.

---

## ✦ Content Integrity

The musical catalogue is intentionally conservative about metadata. Where the project knows the title, artist, and raga, it presents that information. Where information is uncertain, it is not invented merely to make the interface look complete.

This principle is particularly important for Indian classical music, where incorrect attribution or raga labeling can distort cultural context.

---

## ✦ Copyright & Content

JALSAGHAR is an independent interface, curation, and digital-experience project.

The project does not claim ownership of third-party recordings, photographs, artworks, performances, trademarks, or other copyrighted material that may be referenced or linked through the experience merely because they are linked from the website.

Third-party recordings are accessed through their respective platforms and/or official embedded playback mechanisms where permitted. JALSAGHAR does not:

- rip or download YouTube videos
- extract YouTube audio
- separate audio from video
- bypass embedding restrictions
- circumvent DRM or creator controls
- hide YouTube players to create an unofficial audio-only transport
- redistribute or host unauthorized copies of third-party recordings

When YouTube does not permit embedded playback, JALSAGHAR provides a direct link to the original YouTube destination instead.

All third-party rights remain with their respective copyright holders, artists, labels, publishers, platforms, or other rights owners. If you are a rights holder and believe material associated with the project requires correction or removal, please contact the project maintainer.

### YouTube

YouTube and the YouTube logo are trademarks of Google LLC. JALSAGHAR uses the official YouTube IFrame Player API where embedded playback is supported. Availability is determined by YouTube and by the rights/settings associated with individual recordings. An individual recording may play normally inside JALSAGHAR, permit direct YouTube playback but prohibit embedding, become unavailable, or require a different playback context — JALSAGHAR does not attempt to circumvent these restrictions. For recordings that cannot be embedded, the original YouTube URL remains the canonical destination.

### Spotify & YouTube Music

JALSAGHAR may provide external links to curated playlists on YouTube Music and Spotify. These are third-party platforms, and JALSAGHAR does not attempt to reproduce their functionality — the links are optional continuation points for listeners who want to explore the wider musical collection.

---

## ✦ Privacy & Data

JALSAGHAR is designed to remain lightweight. The project does not require a user account to experience the core interface. There is no requirement for:

- social profiles
- personal music libraries
- cloud-synced playlists
- personal listening histories
- a custom account system

Third-party services such as YouTube, Spotify, YouTube Music, Vercel, or analytics systems may have their own privacy policies and data practices when their services are used. Users should consult those services' respective policies for details.

---

## ✦ Technology

JALSAGHAR is built as a lightweight, modern client-side React application.

**Core stack**

- React 19
- TypeScript
- Vite
- Tailwind CSS v4

**Playback**

- YouTube IFrame Player API

**Deployment**

- Vercel

**Development**

- Git
- GitHub
- VS Code
- modern browser APIs

The project intentionally avoids unnecessary infrastructure. It does not currently require:

- Supabase
- Firebase
- a custom backend / database
- a state-management framework
- a separate audio streaming or extraction service

---

## ✦ Project Structure

```text
jalsaghar/
├── public/
│   └── bg/
│       ├── shokal-wide.png
│       ├── shokal-tall.png
│       ├── dupur-wide.png
│       ├── dupur-tall.png
│       ├── bikel-wide.png
│       ├── bikel-tall.png
│       ├── raat-wide.png
│       └── raat-tall.png
│
├── src/
│   ├── App.tsx
│   ├── types.ts
│   ├── index.css
│   │
│   ├── components/
│   │   ├── ArtworkView.tsx
│   │   ├── ContextualModals.tsx
│   │   ├── CurtainIntro.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── TopBar.tsx
│   │   ├── Wordmark.tsx
│   │   ├── YouTubePlayer.tsx
│   │   │
│   │   └── player/
│   │       ├── ProgressBar.tsx
│   │       ├── RaagIndexModal.tsx
│   │       ├── UpNextPanel.tsx
│   │       └── VolumeControl.tsx
│   │
│   └── lib/
│       ├── analytics.ts
│       ├── time.ts
│       ├── tracks.ts
│       └── youtube.ts
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

> The repository structure may evolve as implementation details change.

---

## ✦ Time-of-Day System

The time-of-day system uses the `Asia/Kolkata` timezone rather than relying on the visitor's local timezone.

The conceptual implementation is:

```ts
Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true
});
```

The room changes automatically at:

```text
05:00 → SHOKAL
11:00 → DUPUR
16:00 → BIKEL
19:00 → RAAT
05:00 → SHOKAL
```

The clock updates continuously, and the visual transition happens without requiring a reload.

---

## ✦ Visual Transition Principles

Artwork transitions use a restrained crossfade. The experience deliberately avoids:

- parallax
- Ken Burns effects
- artificial zooming
- constant motion
- animated equalizers
- floating musical symbols
- excessive particles

The room should feel alive because of its light, texture, and atmosphere — not because every element is moving.

---

## ✦ Running Locally

Clone the repository:

```bash
git clone https://github.com/barnikbasu/jalsaghar.git
cd jalsaghar
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local Vite development URL shown in the terminal.

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## ✦ Environment

JALSAGHAR is designed to work without a complex backend environment. YouTube playback is handled through the official YouTube IFrame Player API. The application primarily relies on browser APIs, static artwork, the curated track catalogue, the official YouTube IFrame API, and Vercel deployment.

If additional services or environment variables are introduced in the future, they should be documented here rather than hard-coded into the application, and never committed to source control. Never commit:

```text
.env
.env.local
API keys
private credentials
service-account files
private tokens
```

---

## ✦ Deployment

The production experience is deployed through Vercel:

<p align="center">
  <a href="https://jalsaghar.vercel.app/">
    <strong>জলসাঘর — Live Experience</strong>
  </a>
</p>

The repository is hosted on GitHub:

<p align="center">
  <a href="https://github.com/barnikbasu/jalsaghar">
    <strong>GitHub Repository</strong>
  </a>
</p>

The production deployment should always be runtime-tested separately from local development.

---

## ✦ Testing Checklist

Before considering a release complete, verify the following.

**Visual**

- [ ] Curtain intro works
- [ ] Reduced-motion behavior works
- [ ] Wordmark renders correctly
- [ ] SHOKAL / DUPUR / BIKEL / RAAT artwork all work
- [ ] Desktop artwork uses wide compositions
- [ ] Mobile artwork uses tall compositions
- [ ] Artwork transitions smoothly
- [ ] No unintended image cropping
- [ ] No layout shifts
- [ ] Artwork remains visually dominant

**Player**

- [ ] Play / Pause / Next / Previous / Seek / Volume / Mute all work
- [ ] Queue works
- [ ] Up Next works
- [ ] Raag Index works
- [ ] Shuffle works
- [ ] Repeat works
- [ ] Keyboard shortcuts work
- [ ] Selected track remains correct
- [ ] Actual playback state is reflected in the UI

**YouTube**

- [ ] YouTube player initializes correctly
- [ ] IFrame is legitimately visible
- [ ] Player dimensions satisfy YouTube requirements
- [ ] `origin` is configured correctly
- [ ] `allow` attributes are present
- [ ] YouTube errors are surfaced correctly
- [ ] `101` is distinguished from `150`
- [ ] `150` is treated as embedding restriction
- [ ] `153` is distinguished from `150`
- [ ] `100` is distinguished from embed restrictions
- [ ] `5` is distinguished from content restrictions
- [ ] Autoplay blocking is distinguished from content errors
- [ ] YouTube-only fallback works
- [ ] Direct YouTube link works
- [ ] No retry loop exists
- [ ] No hidden-player workaround exists
- [ ] No automatic recording substitution occurs

**Modals**

- [ ] Creator card opens/closes
- [ ] Chai card opens/closes
- [ ] Raag Index opens and scrolls
- [ ] Outside click works
- [ ] Escape works
- [ ] Focus behavior works
- [ ] Body scrolling is restored correctly

**Mobile**

- [ ] 375px / 390px / 412px viewports
- [ ] Tall artwork works
- [ ] Player remains usable
- [ ] Touch targets are sufficient
- [ ] Modals fit the viewport
- [ ] QR remains scannable
- [ ] Safe-area padding works
- [ ] No horizontal overflow exists

---

## ✦ Future Possibilities / Roadmap

JALSAGHAR is intentionally evolving slowly. Possible future directions include:

- more curated recordings
- richer raga metadata and artist context
- archival notes and deeper listening context
- additional visual scenes / more time-based visual scenes
- more regional musical traditions
- carefully curated playlists and expanded cultural notes
- richer cultural storytelling
- collaborative / optional co-listening experiences
- optional authorized local audio sources
- improved embeddable playback coverage
- more refined mobile interactions
- enhanced accessibility
- additional musical collections

Any future feature should preserve the central principle:

> **JALSAGHAR should remain a room, not become a dashboard.**

The project should evolve through refinement rather than feature accumulation. The next improvements should prioritize:

1. Playback reliability
2. YouTube-only fallback quality
3. Mobile polish
4. Interaction consistency
5. Performance
6. Accessibility
7. Visual refinement
8. Cultural depth

The project does not need more UI for the sake of having more UI. It needs the existing experience to become quieter, smoother, and more intentional.

---

## ✦ What JALSAGHAR Is Not

JALSAGHAR is not intended to be:

- Spotify
- YouTube Music
- a social network
- a music marketplace
- a generic portfolio website
- a music analytics dashboard
- a recommendation engine
- an AI-generated "Indian aesthetic" landing page
- a replacement for professional music archives

It is a digital listening room.

---

## ✦ Philosophy

A good interface tells you where to click.
A great environment makes you want to stay.

JALSAGHAR is trying to build the second.

```text
music
  +
memory
  +
art
  +
place
  +
silence
  =
জলসাঘর
```

---

## ✦ Why I Built It

Indian classical music has never really needed a louder interface. It already has:

- history
- silence
- patience
- improvisation
- atmosphere
- lineage
- memory
- emotion

Modern music applications are exceptionally good at organizing music. JALSAGHAR asks a different question:

> Can a website make the act of listening feel meaningful before the first note is even played?

The project is an attempt to explore that question. It is inspired by the feeling of sitting somewhere in an old room while a raga slowly unfolds.

No feed. No noise. No urgency.

Just a room, a recording, and time.

---

## ✦ The Idea in One Sentence

> **JALSAGHAR is an immersive digital mehfil where Indian classical music, Bengali atmosphere, and contemporary web technology meet inside a living visual room.**

---

## ✦ Closing Note

If the website works as intended, the technology should eventually become invisible. You should not be thinking about React, TypeScript, Vite, APIs, components, state, browser windows, or implementation details.

You should simply feel like you entered somewhere.

A room in an old house. The lamps are already on. Someone has been playing for a while. The audience is quiet. Outside, Kolkata is somewhere beyond the rain.

And the music continues.

<p align="center">
  <strong>এসো, জলসাঘরে।</strong>
</p>

<p align="center">
  <em>Come, enter the Jalsaghar.</em>
</p>

<p align="center">
  <a href="https://jalsaghar.vercel.app/">Enter JALSAGHAR ↗</a>
</p>

---

## ✦ Credits

<p align="center">
  <strong>Made with Bhalobasha by</strong>
</p>

<p align="center">
  <strong>Barnik Basu</strong><br>
  Creator · Developer
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/barnik-basu/">LinkedIn</a>
  ·
  <a href="https://www.instagram.com/barnikbasu/">Instagram</a>
  ·
  <a href="mailto:barnikbasu@gmail.com">Email</a>
</p>

---

## ✦ Links

<p align="center">

<a href="https://jalsaghar.vercel.app/">Live Experience</a>
&nbsp;·&nbsp;
<a href="https://github.com/barnikbasu/jalsaghar">GitHub Repository</a>
&nbsp;·&nbsp;
<a href="https://music.youtube.com/playlist?list=PLADmqUxNquMg&si=q0EfI8kpXyPBfULX">YouTube Music</a>
&nbsp;·&nbsp;
<a href="https://open.spotify.com/playlist/5v8AL0bXouWWTtiEjWAJb5?si=gConKLI8SW6w-kzwP8GIPg">Spotify</a>

</p>

---

<p align="center">
  <strong>জলসাঘর</strong>
</p>

<p align="center">
  <em>Enter the room. Let the music stay.</em>
</p>

<p align="center">
  <strong>Artwork is the world. Music is the soul.</strong>
</p>

<p align="center">
  Made with ❤️ and <strong>bhalobasha</strong> · Music · Memory · Code
</p>
