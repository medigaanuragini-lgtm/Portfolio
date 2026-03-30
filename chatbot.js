(function () {

  const style = document.createElement('style');
  style.textContent = `
    /* ── Lens trigger ── */
    #chat-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 8000;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      cursor: pointer;
      user-select: none;
      background-image: url('Camera lens.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: 0 0 0 2px rgba(201,168,76,0.0), 0 6px 24px rgba(0,0,0,0.85);
      overflow: hidden;
      transition: box-shadow 0.3s ease;
      animation: lensRotate 7s linear infinite;
    }
    #chat-bubble::after {
      content: '';
      position: absolute;
      top: -10%; left: -60%;
      width: 40%; height: 120%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.5) 50%, transparent);
      transform: skewX(-12deg);
      opacity: 0;
      pointer-events: none;
    }
    #chat-bubble:hover {
      box-shadow: 0 0 0 2px rgba(201,168,76,0.55), 0 0 20px rgba(201,168,76,0.22), 0 6px 24px rgba(0,0,0,0.85);
    }
    #chat-bubble:hover::after { animation: lensSweep 0.7s ease forwards; }
    #chat-bubble.open {
      box-shadow: 0 0 0 2px rgba(201,168,76,0.7), 0 0 32px rgba(201,168,76,0.45), 0 6px 24px rgba(0,0,0,0.85);
      animation: lensRotate 7s linear infinite, lensPulse 2.2s ease-in-out infinite;
    }
    @keyframes lensRotate { to { transform: rotate(360deg); } }
    @keyframes lensSweep {
      from { left: -60%; opacity: 0.9; }
      to   { left: 120%;  opacity: 0; }
    }
    @keyframes lensPulse {
      0%,100% { box-shadow: 0 0 0 2px rgba(201,168,76,0.55), 0 0 22px rgba(201,168,76,0.3); }
      50%      { box-shadow: 0 0 0 2px rgba(201,168,76,0.9), 0 0 44px rgba(201,168,76,0.6); }
    }

    /* ── Panel overlay ── */
    #chat-overlay {
      position: fixed;
      inset: 0;
      z-index: 7998;
      background: rgba(0,0,0,0.45);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s ease;
    }
    #chat-overlay.open { opacity: 1; pointer-events: all; }

    /* ── Main panel — centered card ── */
    #chat-panel {
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 7999;
      width: 340px;
      display: flex;
      flex-direction: column;
      background: rgba(10,10,12,0.96);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,76,0.08);
      transform: translateY(16px) scale(0.97);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
      overflow: hidden;
    }
    #chat-panel.open {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    /* orb + title section */
    #chat-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 28px 24px 18px;
      gap: 12px;
      position: relative;
    }
    #chat-x {
      position: absolute;
      top: 14px; right: 16px;
      background: rgba(255,255,255,0.06);
      border: none;
      color: rgba(255,255,255,0.4);
      width: 26px; height: 26px;
      border-radius: 50%;
      font-size: 0.75rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
      line-height: 1;
    }
    #chat-x:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }
    #chat-orb {
      width: 58px; height: 58px;
      border-radius: 50%;
      background-image: url('Camera lens.jpg');
      background-size: cover;
      background-position: center;
      box-shadow: 0 0 0 2px rgba(201,168,76,0.25), 0 0 24px rgba(201,168,76,0.2);
      animation: lensRotate 7s linear infinite;
      flex-shrink: 0;
    }
    #chat-title {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.55);
      text-align: center;
    }
    #chat-title strong {
      display: block;
      font-family: 'VT323', monospace;
      font-size: 1.6rem;
      letter-spacing: 0.18em;
      color: rgba(232,224,208,0.9);
      font-weight: normal;
    }

    /* suggestion chips */
    #chat-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      padding: 0 18px 16px;
      justify-content: center;
    }
    .chip {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.58rem;
      letter-spacing: 0.08em;
      color: rgba(201,168,76,0.75);
      background: rgba(201,168,76,0.06);
      border: 1px solid rgba(201,168,76,0.18);
      border-radius: 20px;
      padding: 5px 12px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .chip:hover {
      background: rgba(201,168,76,0.14);
      color: #c9a84c;
      border-color: rgba(201,168,76,0.4);
    }

    /* messages */
    #chat-log {
      flex: 1;
      overflow-y: auto;
      max-height: 240px;
      padding: 4px 18px 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #chat-log:empty { display: none; }
    #chat-log::-webkit-scrollbar { width: 2px; }
    #chat-log::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.18); border-radius: 2px; }

    .cm {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.66rem;
      line-height: 1.65;
      white-space: pre-wrap;
      max-width: 92%;
    }
    .cm.bot {
      align-self: flex-start;
      color: rgba(216,212,188,0.78);
      background: rgba(255,255,255,0.04);
      border-radius: 10px 10px 10px 2px;
      padding: 9px 13px;
    }
    .cm.usr {
      align-self: flex-end;
      color: rgba(232,224,208,0.92);
      background: rgba(201,168,76,0.1);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 10px 10px 2px 10px;
      padding: 9px 13px;
    }

    /* typing dots */
    .chat-dots {
      align-self: flex-start;
      display: flex;
      gap: 5px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.04);
      border-radius: 10px 10px 10px 2px;
    }
    .chat-dots span {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: rgba(201,168,76,0.5);
      animation: cdot 1.1s infinite;
    }
    .chat-dots span:nth-child(2) { animation-delay: 0.18s; }
    .chat-dots span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes cdot {
      0%,60%,100% { opacity: 0.2; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-3px); }
    }

    /* divider above input */
    #chat-divider {
      height: 1px;
      background: rgba(255,255,255,0.05);
      margin: 0 0;
      flex-shrink: 0;
    }

    /* input bar */
    #chat-bar {
      display: flex;
      align-items: center;
      padding: 12px 14px;
      gap: 10px;
      flex-shrink: 0;
    }
    #chat-in {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      outline: none;
      padding: 9px 16px;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.65rem;
      color: rgba(216,212,188,0.85);
      caret-color: #c9a84c;
      transition: border-color 0.15s;
    }
    #chat-in:focus { border-color: rgba(201,168,76,0.3); }
    #chat-in::placeholder { color: rgba(255,255,255,0.2); }
    #chat-go {
      width: 34px; height: 34px;
      border-radius: 50%;
      border: none;
      background: rgba(201,168,76,0.85);
      color: #080808;
      font-size: 1rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s, transform 0.1s;
    }
    #chat-go:hover { background: #c9a84c; transform: scale(1.06); }

    @media (max-width: 600px) {
      #chat-bubble { bottom: 82px; right: 14px; width: 52px; height: 52px; }
      #chat-panel  { width: calc(100vw - 20px); right: 10px; bottom: 146px; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build HTML ── */
  const bubble = document.createElement('div');
  bubble.id = 'chat-bubble';

  const overlay = document.createElement('div');
  overlay.id = 'chat-overlay';

  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.innerHTML = `
    <div id="chat-hero">
      <button id="chat-x">✕</button>
      <div id="chat-orb"></div>
      <div id="chat-title">
        <strong>HEY, I'M ANU</strong>
        ask me anything
      </div>
    </div>
    <div id="chat-chips">
      <div class="chip">What do you do?</div>
      <div class="chip">What tools do you use?</div>
      <div class="chip">Are you available for hire?</div>
      <div class="chip">What makes you different?</div>
      <div class="chip">How do I reach you?</div>
    </div>
    <div id="chat-log"></div>
    <div id="chat-divider"></div>
    <div id="chat-bar">
      <input id="chat-in" type="text" placeholder="Message…" autocomplete="off">
      <button id="chat-go">↑</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  /* ── Knowledge base ── */
  const KB = [
    { k: ['hello','hi','hey','sup','yo','hiya','howdy','start'],
      r: 'Hey! I\'m Anu — ask me anything about my work, process, tools, or how to work together.' },

    { k: ['who is','who are','about anu','anuragini','bio','background','yourself','who you'],
      r: 'I\'m Anuragini Mediga — a Creative Producer, Video Artist, and Director based in NYC, originally from Hyderabad. I work across the full production pipeline, from concept to camera to post, for brands, films, events, and documentaries.' },

    { k: ['what do you do','role','title','job','position'],
      r: 'I work as a Creative Producer, Director, Cinematographer, Editor, and Colorist — often all at once. I\'ve led full productions from concept through final delivery across brand content, short films, live events, and documentary.' },

    { k: ['services','offer','specialize','capabilities','what kind of work','take on','projects'],
      r: 'I take on:\n→ Films & narrative projects\n→ Brand ads & brand films\n→ Scripting all the way through production\n→ Social media content — end to end\n→ Event videography & photography\n→ Live streaming & broadcast\n→ Podcast & documentary production' },

    { k: ['tool','software','gear','camera','equipment','shoot with','edit on','work with'],
      r: 'Cameras: Sony A7 IV, A7S III, A7C, FX3, FX6 · Canon EOS R · RED KOMODO 6K · Arri Alexa 35 · Blackmagic Cinema · DJI Ronin\n\nPost: Premiere Pro · DaVinci Resolve · After Effects · Avid · Photoshop · Lightroom\n\nAudio: Pro Tools · Logic Pro · Rode · Deity · Sennheiser Lavs · Zoom H-Series\n\nLive: Blackmagic ATEM Mini Pro\n\nAI: Runway · ElevenLabs · Topaz Video AI · Descript AI · Captions' },

    { k: ['pre-production','preproduction','prep','planning'],
      r: 'For pre-production I work with Notion, StudioBinder, Milanote, Shot Designer, Celtx, and Google Workspace. I handle everything from concept decks and shot lists to scheduling and crew coordination.' },

    { k: ['hubspot','hub spot','how to hubspot'],
      r: 'At HubSpot I was a Video Production Intern managing the full pipeline for the How to HubSpot YouTube channel — pre-production, scripting, shot lists, on-set coordination, editing in Premiere Pro, and YouTube optimization including metadata, thumbnails, and audience retention strategy.' },

    { k: ['kled','kled ai'],
      r: 'For Kled AI I was Freelance Creative Producer and Director. I produced two ads — a product update announcement and a promotional brand video — leading everything from creative development and location scouting to camera operation, teleprompter setup, audio, and final delivery.' },

    { k: ['eusexua'],
      r: 'For EUSEXUA I was a freelance collaborator — shooting and editing trailers, music video content, and BTS footage. Fast-turnaround creative cycle, handled camera, framing, and all post-production.' },

    { k: ['brand innovators','leadership summit'],
      r: 'At Brand Innovators Leadership Summit 2025 in NYC, I was Lead Event Videographer — capturing keynote sessions, executive panels, and backstage interviews across multi-camera Canon EOS setups, and delivering platform-optimized content for YouTube and LinkedIn.' },

    { k: ['p-tal','ptal','launch film'],
      r: 'On the P-tal USA Launch Film I was Cinematographer and Assistant Director — directing lighting, camera setup, and shot composition, working closely with the director to translate their creative vision into a strong visual narrative.' },

    { k: ['red dog','red dog productions','live stream','livestream'],
      r: 'At Red Dog Productions I was Live Stream Producer handling multi-camera setups using ATEM Mini Pro and Blackmagic gear at The New School — simultaneously serving as Videographer, Editor, Colorist, and Video Mixer.' },

    { k: ['nyfw','fashion week','new york fashion week','runway'],
      r: 'At NYFW 2025 I was Press Photographer — shooting editorial-style runway and backstage imagery with Sony A7 IV and a 70-200mm lens, contributing to real-time social coverage and post-event brand campaigns.' },

    { k: ['mosaic','rem','nyc ferry','favorite place','short film','narrative film'],
      r: 'On Mosaic, REM, NYC Ferry Documentary, and Favorite Place in New York I had full creative control as Writer, Director, Producer, and Editor — from concept through post. These were showcased in academic and festival contexts.' },

    { k: ['visitor','night of melancholia','executive producer'],
      r: 'On The Visitor and Night of Melancholia I was Executive Producer — overseeing 5 to 25+ crew members, managing budgets, timelines, creative direction, festival submissions, and strategic promotion from pre to post.' },

    { k: ['roots to rooftops','sensitive content','unraveled','threshold','cinematographer','assistant director'],
      r: 'Across Roots to Rooftops, Sensitive Content, Unraveled, and Threshold I served as Cinematographer and Assistant Director — designing lighting, framing, and shot composition. On several of these I also handled production sound as the Boom Operator and Sound Mixer.' },

    { k: ['building blocks','music video','gaffer','lighting'],
      r: 'On Building Blocks of the Bridge and several music video projects I worked as Gaffer — designing and executing lighting setups using gels, LEDs, and cinematic lighting techniques.' },

    { k: ['pixelway','agency experience','agency exp','agency background'],
      r: 'I have 4 years of agency experience at Pixelway in India, where I worked with 25+ brands. My work covered social media content production, content strategy, handling postings and content calendars, packaging design, end-to-end branding, and client handling. I increased audience engagement by 30% in six months and maintained a 90%+ client retention rate.' },

    { k: ['brand mandir','digital video intern'],
      r: 'At Brand Mandir I was a Digital Video Intern — producing live content attracting 1,000+ daily viewers, editing 15+ projects in Premiere Pro and After Effects, planning up to 4 shoots daily, and contributing to campaigns that boosted reach by 20%.' },

    { k: ['solo','alone','by yourself','one person','handle everything'],
      r: 'Absolutely — I can handle a full project solo. I\'ve done it many times. From writing the concept and planning the shoot to operating camera, recording audio, editing, and delivering the final cut. I\'m built for that.' },

    { k: ['team','manage','crew','lead','management'],
      r: 'I\'m very comfortable managing teams — I learned it at Pixelway where I was the connector between the creative team, clients, and management across 25+ brand accounts. I\'ve also managed crews of up to 25+ people on film productions as Executive Producer.' },

    { k: ['different','stand out','unique','why you','why hire you','what makes you'],
      r: 'Most people specialize in one thing. I do the whole thing. I can walk onto a set as the cinematographer, direct the shoot, edit the footage, grade the color, and deliver platform-ready content — without a middle person. Four years of agency experience across 25+ brands means I also understand the business side: client communication, strategy, timelines, and what actually performs. I\'m not just a creative — I\'m the person who gets it done.' },

    { k: ['strongest','best at','main skill','skill','jack of all'],
      r: 'I\'d call myself a jack of all trades — but I\'m actively mastering every one of them. Camera, direction, editing, color, audio, strategy, client management — I\'ve done all of it professionally and I keep pushing each one forward.' },

    { k: ['hire','available','freelance','full time','full-time','looking for','open to','job','work','actively looking'],
      r: 'I\'m open to both full-time and freelance. Actively looking for Creative Producer, Director, Producer, Video Editor, Video Production, or Account Manager roles — ideally at a studio, agency, or media company.\n\nI love work that spans the full pipeline, but I\'m also up for execution-focused roles.' },

    { k: ['turnaround','how long','timeline','deadline','delivery'],
      r: 'Turnaround really depends on the scope of the project — let\'s talk about it. Reach me at medigaanuragini@gmail.com and we\'ll figure out a timeline that works.' },

    { k: ['process','how do you work','workflow','approach','method','pipeline'],
      r: 'My process:\n1. We talk through the brief or I help develop the concept\n2. Pre-production — shot lists, scheduling, crew, gear\n3. Production — camera, lighting, audio, direction\n4. Post — edit, color, audio mix\n5. Delivery — platform-ready formats, metadata, thumbnails\n\nI\'m comfortable leading at any stage.' },

    { k: ['on-site','remote','location','onsite','travel'],
      r: 'I\'m available on-site and remote — depends on the project. Based in NYC, and also open to DC-area work.' },

    { k: ['brief','concept','idea','start a project','creative direction','from scratch'],
      r: 'I can work from a brief or develop the concept from scratch — most clients come somewhere in between. Happy to jump on a call and figure out the right starting point together.' },

    { k: ['contact','email','reach','get in touch','dm','message'],
      r: '→ medigaanuragini@gmail.com\n→ instagram.com/anuragini22\n→ linkedin.com/in/anuragini-m-786a1b19a' },

    { k: ['instagram','ig'],
      r: 'Find me at @anuragini22\ninstagram.com/anuragini22' },

    { k: ['linkedin'],
      r: 'linkedin.com/in/anuragini-m-786a1b19a' },

    { k: ['rate','price','cost','fee','budget','how much','charge'],
      r: 'Rates depend on scope and timeline. Drop me an email at medigaanuragini@gmail.com with your project details and I\'ll get back to you.' },

    { k: ['photography','photo','shoot','portrait','event photo'],
      r: 'I shoot on Sony A7 IV with prime and zoom lenses. My photography work includes NYFW 2025, Portraits, Book Launch Event, Latinx Storytelling Event, Holi Event, Met 2025, NYC street photography, and product photography for Vellorex and P-tal.' },

    { k: ['podcast','documentary','doc'],
      r: 'I\'ve produced podcast and documentary content — check out the Podcast and Documentary Films sections on my Works page.' },

    { k: ['color','grading','colour','davinci','lumetri','lut'],
      r: 'I grade in DaVinci Resolve Color Page and Lumetri Color — including LUT design, color correction, and full color grading for narrative, brand, and documentary work.' },

    { k: ['audio','sound','mix','boom','lav','microphone','record'],
      r: 'Audio kit I work with: Rode · Deity · Sennheiser Lavs · Boom Pole · Sound Devices · Zoom H-Series. Software: Audition · Pro Tools · Logic Pro · Descript.' },

    { k: ['nyc','new york','based','dc','washington','where are you'],
      r: 'I\'m based in New York City, and open to work in the DC area too.' },

    { k: ['experience','how long','years'],
      r: 'I\'ve worked across brand content, narrative films, live events, documentary, and photography — spanning HubSpot, independent productions in NYC, freelance directing and producing, and 4 years of agency work in India across 25+ brands.' },

    { k: ['resume','cv','reel','showreel'],
      r: 'My full work is on the Works page. For a resume or reel, just email me at medigaanuragini@gmail.com.' },

    { k: ['social media','instagram content','tiktok','reels','content creation'],
      r: 'I handle social media content end to end — strategy, scripting, shooting, editing, and publishing. I work with Meta Business Suite, TikTok Studio, Later, Sprout Social, and YouTube Studio.' },

    { k: ['ai','runway','elevenlabs','topaz','descript ai'],
      r: 'I use AI tools actively in my workflow — Runway, ElevenLabs, Captions, Opia, Descript AI, Topaz Video AI, Claude, and ChatGPT. I\'m always exploring what\'s new.' },

    { k: ['thanks','thank you','ty','appreciate','great','awesome','perfect','helpful','cool','nice'],
      r: 'Of course! Feel free to ask anything else — or just email me at medigaanuragini@gmail.com.' },

    { k: ['bye','goodbye','ciao','done','later','see you'],
      r: 'Thanks for stopping by! Reach me anytime at medigaanuragini@gmail.com.' },
  ];

  const FALLBACKS = [
    "Hmm, I don't have that one — try asking about my work, tools, or how to get in touch.",
    "Best bet is to email me directly at medigaanuragini@gmail.com for that.",
    "Not sure about that one — ask me about my projects, process, or availability?",
  ];
  let fbIdx = 0;

  function match(msg) {
    const lower = msg.toLowerCase();
    let best = null, top = 0;
    for (const entry of KB) {
      let score = 0;
      for (const k of entry.k) {
        if (lower.includes(k)) score += k.split(' ').length;
      }
      if (score > top) { top = score; best = entry; }
    }
    return top > 0 ? best.r : null;
  }

  /* ── UI logic ── */
  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    bubble.classList.toggle('open', isOpen);
    if (isOpen) setTimeout(() => document.getElementById('chat-in').focus(), 280);
  }

  function addMsg(text, who) {
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = `cm ${who}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function send(text) {
    text = (text || document.getElementById('chat-in').value).trim();
    if (!text) return;
    document.getElementById('chat-in').value = '';
    addMsg(text, 'usr');

    const log = document.getElementById('chat-log');
    const dots = document.createElement('div');
    dots.className = 'chat-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(dots);
    log.scrollTop = log.scrollHeight;

    setTimeout(() => {
      dots.remove();
      const reply = match(text) || FALLBACKS[fbIdx++ % FALLBACKS.length];
      addMsg(reply, 'bot');
    }, 500 + Math.random() * 400);
  }

  bubble.addEventListener('click', toggleChat);
  overlay.addEventListener('click', toggleChat);

  panel.addEventListener('click', e => {
    if (e.target.id === 'chat-x') toggleChat();
    if (e.target.classList.contains('chip')) send(e.target.textContent);
    if (e.target.id === 'chat-go') send();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && isOpen && document.activeElement.id === 'chat-in') send();
    if (e.key === 'Escape' && isOpen) toggleChat();
  });

})();
