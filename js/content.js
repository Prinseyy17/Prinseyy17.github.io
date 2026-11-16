/* ==========================================================================
   Prinseyy portfolio — editable content
   --------------------------------------------------------------------------
   Everything that grows over time lives here: websites, frames (photos),
   reel cuts and the lightbox galleries. Add an item, save, refresh.
   Set `published: false` to hide an item without deleting it.
   ========================================================================== */
window.PORTFOLIO = {
  site: {
    email: 'prinseandrewkatigbak@gmail.com',

    // Used by the live clock and the Open-Meteo "light report" (no key needed).
    location: { label: 'Dubai', lat: 25.2048, lon: 55.2708, timeZone: 'Asia/Dubai' },

    // Contact form: paste a free Web3Forms access key to receive messages by email
    // (https://web3forms.com). Leave empty and the form opens the visitor's email app instead.
    contactForm: { web3formsKey: '' },

    // "Live from GitHub" strip under Live websites. Set enabled: false to hide it.
    // `exclude` takes repo names you'd rather not show (this site's own repo is hidden by default).
    github: { enabled: true, user: 'Prinseyy17', exclude: ['Prinseyy17.github.io'], limit: 4 }
  },

  /* ---------- 03 · Live websites ---------- */
  websites: [
    {
      title: 'Elementesse',
      category: 'E-commerce',
      type: 'E-commerce website',
      status: 'Live',
      description: 'A budget-focused storefront built from the ground up, combining custom HTML, CSS and JavaScript with WordPress and WooCommerce, structured for clear product discovery.',
      url: 'https://elementesse.net/',
      domain: 'elementesse.net',
      screenshot: 'assets/img/web/elementesse.webp',
      meta: [['Role', 'Ground-up design & development'], ['Stack', 'HTML · CSS · JS · WordPress · WooCommerce'], ['For', 'Rayd Trading LLC']],
      published: true
    },
    {
      title: 'The Jewels Store',
      category: 'Luxury retail',
      type: 'Luxury e-commerce',
      status: 'Live',
      description: 'A WordPress and WooCommerce redesign with improved structure, presentation and shopping flow, aimed at a more premium customer experience.',
      url: 'https://thejewelsstore.com/',
      domain: 'thejewelsstore.com',
      screenshot: 'assets/img/web/the-jewels-store.webp',
      meta: [['Role', 'Redesign · content direction · management'], ['Stack', 'WordPress · WooCommerce'], ['For', 'Rayd Trading LLC']],
      published: true
    },
    {
      title: 'Al Barajeel 99',
      category: 'Business profile',
      type: 'Business profile website',
      status: 'In development',
      description: 'A business-profile site in active development. My part is the backend work and the visual presentation of the profile, built on a base coded by co-developer Christian James Dejolde.',
      url: 'https://albarajeel99.netlify.app/',
      domain: 'albarajeel99.netlify.app',
      screenshot: 'assets/img/web/albarajeel-99.webp',
      meta: [['Role', 'Backend · visual development'], ['Hosted', 'Netlify'], ['Credit', 'Base code by Christian James Dejolde']],
      published: true
    },
    {
      title: 'Sibs Style Beauty Lounge',
      category: 'Beauty & skincare',
      type: 'Business website',
      status: 'Live',
      description: 'A responsive front-end site for a skincare and beauty lounge, designed to present services clearly and turn visitors into enquiries.',
      url: 'https://sibs-style-beauty-lounge.onrender.com/',
      domain: 'sibs-style-beauty-lounge.onrender.com',
      screenshot: 'assets/img/web/sibs-style.webp',
      meta: [['Role', 'Front-end build'], ['Stack', 'HTML · CSS · JavaScript'], ['Hosted', 'Render']],
      published: true
    }
  ],

  /* ---------- 04 · Frames ----------
     layout: 'feature' (2×2), 'wide' (2×1), 'tall' (1×2) or 'standard' (1×1).
     thumb is optional — it falls back to src. w/h are the image's pixel size. */
  frames: [
    { title: 'Golden Hour', src: 'assets/photos/golden-hour.webp', thumb: 'assets/photos/golden-hour-sm.webp', alt: 'Palm silhouette on the beach as the sun sets', layout: 'feature', w: 1800, h: 1350, published: true },
    { title: 'Open Water', src: 'assets/photos/open-water.webp', thumb: 'assets/photos/open-water-sm.webp', alt: 'Calm sea horizon under a pale sky', layout: 'wide', w: 1800, h: 1350, published: true },
    { title: 'Palm Silhouette', src: 'assets/photos/palm-silhouette.webp', thumb: 'assets/photos/palm-silhouette-sm.webp', alt: 'Tall silhouette of a palm tree against a dusk sky over water', layout: 'tall', w: 1500, h: 2000, published: true },
    { title: 'Coastal Wide', src: 'assets/photos/coastal-wide.webp', thumb: 'assets/photos/coastal-wide-sm.webp', alt: 'Wide view of the Dubai coastline in daylight', layout: 'standard', w: 1800, h: 1350, published: true },
    { title: 'Glass & Palms', src: 'assets/photos/glass-and-palms.webp', thumb: 'assets/photos/glass-and-palms-sm.webp', alt: 'Looking up through a glass atrium roof at palm trees', layout: 'tall', w: 1325, h: 2000, published: true },
    { title: 'Dusk Skies', src: 'assets/photos/dusk-skies.webp', thumb: 'assets/photos/dusk-skies-sm.webp', alt: 'Pastel dusk sky over a line of trees', layout: 'wide', w: 1800, h: 1350, published: true },
    { title: 'Sandwritten', src: 'assets/photos/sandwritten.webp', thumb: 'assets/photos/sandwritten-sm.webp', alt: 'Word written by hand in beach sand', layout: 'standard', w: 1800, h: 1350, published: true },
    { title: 'Blossom & Blue', src: 'assets/photos/blossom-blue.webp', thumb: 'assets/photos/blossom-blue-sm.webp', alt: 'White blossoms on a tree against a clear blue sky', layout: 'wide', w: 1800, h: 1350, published: true }
  ],

  /* ---------- 05 · Edits & motion ----------
     type 'drive' → a Google Drive share/preview link (file must be shared as "Anyone with the link").
     type 'video' → a local .mp4 in assets/videos. */
  reel: [
    { title: 'Fighting Gold But Meta', description: 'Short edit built around fast cuts and motion.', type: 'drive', src: 'https://drive.google.com/file/d/1dCVsN5u4b2lstu2yS3fQvaVa1fvI0UCF/preview', published: true },
    { title: 'Filipino Project — Final Cut', description: 'Final cut for a class filmmaking project.', type: 'drive', src: 'https://drive.google.com/file/d/1sbc6ElpePeexXKCALR7cKEg2RA2eZOvk/preview', published: true },
    { title: 'Tom Cruise Edit', description: 'Fan edit, cut for pace and punch.', type: 'video', src: 'assets/videos/tom-cruise-edit.mp4', published: true },
    { title: 'Metaverse Server Teaser', description: 'Teaser edit for a community game server.', type: 'drive', src: 'https://drive.google.com/file/d/1ILAAxO3DypBn_ZSCxQSut__HpNeO5iA_/preview', published: true },
    { title: 'Green Screen Test', description: 'First pass at a chroma-key composite.', type: 'video', src: 'assets/videos/green-screen-test.mp4', published: true }
  ],

  /* ---------- Lightbox galleries for the case studies ---------- */
  galleries: {
    posters: [
      { src: 'assets/img/posters/01-split-grid.webp', caption: 'Concept 01 — Split Grid', alt: 'Fresher’s Party ’26 poster, concept 01 Split Grid' },
      { src: 'assets/img/posters/02-side-a-side-b.webp', caption: 'Concept 02 — Side A / Side B', alt: 'Fresher’s Party ’26 poster, concept 02 Side A / Side B' },
      { src: 'assets/img/posters/03-two-eras.webp', caption: 'Concept 03 — Two Eras', alt: 'Fresher’s Party ’26 poster, concept 03 Two Eras' },
      { src: 'assets/img/posters/04-engraved-hud.webp', caption: 'Concept 04 — Engraved / HUD', alt: 'Fresher’s Party ’26 poster, concept 04 Engraved / HUD' },
      { src: 'assets/img/posters/05-duality.webp', caption: 'Concept 05 — Duality', alt: 'Fresher’s Party ’26 poster, concept 05 Duality' }
    ],
    reallux: [
      { src: 'assets/img/reallux/process-01-wireframe.webp', caption: 'Real Lux · 01 Wireframe' },
      { src: 'assets/img/reallux/process-02-first-pass.webp', caption: 'Real Lux · 02 First visual pass' },
      { src: 'assets/img/reallux/process-03-final.webp', caption: 'Real Lux · 03 Final direction' },
      { src: 'assets/img/reallux/homepage-hero.webp', caption: 'Real Lux · Desktop homepage hero' },
      { src: 'assets/img/reallux/homepage-gold.webp', caption: 'Real Lux · Full homepage, gold (final)' },
      { src: 'assets/img/reallux/homepage-mono.webp', caption: 'Real Lux · Full homepage, mono (alternate)' },
      { src: 'assets/img/reallux/section-features.webp', caption: 'Real Lux · Smart Features' },
      { src: 'assets/img/reallux/section-why.webp', caption: 'Real Lux · Why Choose Real Lux?' },
      { src: 'assets/img/reallux/section-partners.webp', caption: 'Real Lux · Shared Success Model' },
      { src: 'assets/img/reallux/section-placement.webp', caption: 'Real Lux · Any Space, Any Setup' }
    ]
  }
};
