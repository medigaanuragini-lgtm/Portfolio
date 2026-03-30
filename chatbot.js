(function () {

  /* ── Inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    #chat-bubble {
      position: fixed;
      bottom: 24px;
      left: 22px;
      z-index: 8000;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      cursor: pointer;
      user-select: none;
      /* lens glass */
      background:
        radial-gradient(circle at 38% 32%, rgba(100,150,255,0.38) 0%, transparent 42%),
        radial-gradient(circle at 66% 62%, rgba(30,55,160,0.22) 0%, transparent 38%),
        radial-gradient(circle at 50% 50%, #0d1528 0%, #060810 55%, #030305 100%);
      /* lens body rings */
      box-shadow:
        0 0 0 5px #111111,
        0 0 0 9px #090909,
        0 6px 28px rgba(0,0,0,0.92),
        inset 0 2px 4px rgba(255,255,255,0.05);
      overflow: hidden;
      transition: box-shadow 0.35s ease;
    }
    /* rotating focus ring */
    #chat-bubble::before {
      content: '';
      position: absolute;
      inset: 10px;
      border-radius: 50%;
      border: 1.5px solid transparent;
      border-top-color: rgba(255,255,255,0.14);
      border-right-color: rgba(255,255,255,0.05);
      border-bottom-color: rgba(255,255,255,0.14);
      border-left-color: rgba(255,255,255,0.05);
      animation: lensRotate 4s linear infinite;
    }
    /* light sweep */
    #chat-bubble::after {
      content: '';
      position: absolute;
      top: -20%;
      left: -50%;
      width: 42%;
      height: 140%;
      background: linear-gradient(to right,
        transparent,
        rgba(255,255,255,0.52) 50%,
        transparent
      );
      transform: skewX(-14deg) translateX(-20px);
      opacity: 0;
      pointer-events: none;
    }
    #chat-bubble:hover {
      box-shadow:
        0 0 0 5px #141414,
        0 0 0 9px #0a0a0a,
        0 6px 28px rgba(0,0,0,0.92),
        0 0 18px rgba(201,168,76,0.18),
        inset 0 2px 4px rgba(255,255,255,0.05);
    }
    #chat-bubble:hover::after {
      animation: lensSweep 0.65s ease forwards;
    }
    #chat-bubble.open {
      box-shadow:
        0 0 0 5px #161616,
        0 0 0 9px #0d0d0d,
        0 0 28px rgba(201,168,76,0.45),
        0 0 55px rgba(201,168,76,0.18),
        inset 0 2px 4px rgba(255,255,255,0.05);
      animation: lensPulse 2s ease-in-out infinite;
    }
    @keyframes lensRotate {
      to { transform: rotate(360deg); }
    }
    @keyframes lensSweep {
      from { transform: skewX(-14deg) translateX(-20px); opacity: 0.85; }
      to   { transform: skewX(-14deg) translateX(200px); opacity: 0; }
    }
    @keyframes lensPulse {
      0%,100% { box-shadow: 0 0 0 5px #161616, 0 0 0 9px #0d0d0d, 0 0 24px rgba(201,168,76,0.4), inset 0 2px 4px rgba(255,255,255,0.05); }
      50%      { box-shadow: 0 0 0 5px #161616, 0 0 0 9px #0d0d0d, 0 0 38px rgba(201,168,76,0.65), inset 0 2px 4px rgba(255,255,255,0.05); }
    }
    #chat-panel {
      position: fixed;
      bottom: 100px;
      left: 22px;
      z-index: 8000;
      width: 310px;
      max-height: 400px;
      display: flex;
      flex-direction: column;
      background: #080808;
      border: 1px solid rgba(201,168,76,0.35);
      box-shadow: 0 12px 40px rgba(0,0,0,0.8);
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px);
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
    #chat-panel.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0);
    }
    #chat-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 13px;
      border-bottom: 1px solid rgba(201,168,76,0.18);
      background: rgba(201,168,76,0.05);
    }
    #chat-head-label {
      font-family: 'VT323', monospace;
      font-size: 1.05rem;
      letter-spacing: 0.2em;
      color: #c9a84c;
    }
    #chat-x {
      background: none;
      border: none;
      color: rgba(201,168,76,0.45);
      font-size: 0.9rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.15s;
      font-family: 'Space Mono', monospace;
    }
    #chat-x:hover { color: #c9a84c; }
    #chat-log {
      flex: 1;
      overflow-y: auto;
      padding: 11px 13px;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    #chat-log::-webkit-scrollbar { width: 2px; }
    #chat-log::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); }
    .cm {
      font-family: 'Space Mono', monospace;
      font-size: 0.65rem;
      line-height: 1.6;
      max-width: 88%;
      padding: 7px 10px;
      white-space: pre-wrap;
    }
    .cm.bot {
      align-self: flex-start;
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(255,255,255,0.07);
      color: rgba(216,212,188,0.82);
    }
    .cm.usr {
      align-self: flex-end;
      background: rgba(201,168,76,0.1);
      border: 1px solid rgba(201,168,76,0.22);
      color: rgba(216,212,188,0.88);
    }
    .chat-dots {
      align-self: flex-start;
      display: flex;
      gap: 4px;
      padding: 9px 13px;
    }
    .chat-dots span {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: rgba(201,168,76,0.45);
      animation: cdot 1.1s infinite;
    }
    .chat-dots span:nth-child(2) { animation-delay: 0.18s; }
    .chat-dots span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes cdot {
      0%,60%,100% { opacity: 0.25; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-3px); }
    }
    #chat-bar {
      display: flex;
      align-items: center;
      gap: 7px;
      border-top: 1px solid rgba(201,168,76,0.13);
      padding: 7px 10px;
    }
    #chat-in {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-family: 'Space Mono', monospace;
      font-size: 0.63rem;
      color: rgba(216,212,188,0.85);
      caret-color: #c9a84c;
    }
    #chat-in::placeholder { color: rgba(201,168,76,0.28); }
    #chat-go {
      background: none;
      border: 1px solid rgba(201,168,76,0.3);
      color: #c9a84c;
      font-family: 'VT323', monospace;
      font-size: 1rem;
      padding: 2px 8px;
      cursor: pointer;
      letter-spacing: 0.05em;
      transition: background 0.15s;
    }
    #chat-go:hover { background: rgba(201,168,76,0.1); }

    @media (max-width: 600px) {
      #chat-bubble { bottom: 82px; left: 14px; width: 54px; height: 54px; }
      #chat-panel  { width: calc(100vw - 28px); left: 14px; bottom: 148px; max-height: 44vh; }
    }
  `;
  document.head.appendChild(style);

  /* ── Build HTML ── */
  const bubble = document.createElement('div');
  bubble.id = 'chat-bubble';

  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.innerHTML = `
    <div id="chat-head">
      <span id="chat-head-label">// ASK ANU</span>
      <button id="chat-x">✕</button>
    </div>
    <div id="chat-log">
      <div class="cm bot">Hey! Ask me about Anu's work, creative process, or how to get in touch.</div>
    </div>
    <div id="chat-bar">
      <input id="chat-in" type="text" placeholder="type your question…" autocomplete="off">
      <button id="chat-go">→</button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  /* ── Knowledge base ── */
  const KB = [
    { k: ['hello','hi','hey','sup','yo','hiya','howdy','greetings','start'],
      r: 'Hey! I can tell you about Anu\'s work, projects, process, or how to hire her. What would you like to know?' },

    { k: ['who is','who are','about anu','anuragini','bio','background','herself'],
      r: 'Anu (Anuragini Mediga) is a Creative Producer, Video Artist and Director based in New York City, originally from Hyderabad, India. She works across brand content, film editing, photography, podcasts and documentary filmmaking.' },

    { k: ['what do you do','what does','role','title','job','position'],
      r: 'Anu is a Creative Producer, Video Artist and Director — she leads projects from concept through production and post, working hands-on at every stage.' },

    { k: ['services','offer','specialize','what can','capabilities','provide'],
      r: 'Anu offers:\n→ Creative Production\n→ Video Direction & Editing\n→ Brand & Ad Content\n→ Event & Product Photography\n→ Podcast Production\n→ Documentary Filmmaking' },

    { k: ['process','how do you work','workflow','approach','method','creative process','production process'],
      r: 'Anu\'s process: concept development → pre-production & scheduling → production → post (editing, color, sound). She stays hands-on throughout and adapts to each project\'s needs.' },

    { k: ['hire','work together','collaborate','start a project','commission','brief','take on'],
      r: 'To start a project with Anu, email her at medigaanuragini@gmail.com with your brief and timeline. She\'s happy to hop on a call too.' },

    { k: ['contact','email','reach','get in touch','dm','message'],
      r: '📧 medigaanuragini@gmail.com\n📷 instagram.com/anuragini22\n💼 linkedin.com/in/anuragini-m-786a1b19a' },

    { k: ['rate','price','cost','fee','budget','charge','pricing','how much'],
      r: 'Rates vary by scope and timeline. Email medigaanuragini@gmail.com with your project details and Anu will get back to you.' },

    { k: ['available','availability','schedule','timeline','book','when can'],
      r: 'For availability, email medigaanuragini@gmail.com with your project dates and she\'ll get back to you quickly.' },

    { k: ['brand','ads','commercial','advertising','brand work','branded'],
      r: 'Brand & ads work includes: HubSpot (multi-video campaign), Kled AI Promo, Kled AI Talking Video, Brand Innovators I & II, P-tal Dabba Party I & II, and Oases. All in Works → Brands/Ads.' },

    { k: ['hubspot','hub spot'],
      r: 'Anu produced a full campaign of videos for HubSpot — you can browse all of them as a collection in Works → Brands/Ads.' },

    { k: ['kled','kled ai'],
      r: 'For Kled AI, Anu produced two pieces — a Promo and a Talking Video. Both are in Works → Brands/Ads.' },

    { k: ['brand innovators'],
      r: 'Brand Innovators I and II are both in the Brands/Ads section of Works.' },

    { k: ['p-tal','ptal','dabba','dabba party','p tal'],
      r: 'P-tal work spans two sections: Dabba Party I & II (brand content in Brands/Ads) and P-tal Product Photography (in Photography).' },

    { k: ['oases'],
      r: 'Oases is a brand project — viewable in Works → Brands/Ads.' },

    { k: ['arcesium','arcesium'],
      r: 'Arcesium is no longer featured in the current portfolio.' },

    { k: ['film','editing','edit','films','short film','narrative','cinematic','cuts'],
      r: 'Films & editing work includes: Somewhere Nowhere, REM, MOSAIC, The Building Blocks, OONO, Sensitive Content, Night of Melancholia, Unraveled, Threshold, Nightmare, Music Video, EUSEXUA (BTS + Trailer), Pink Visual (BTS + Trailer), Surfing Promo — all in Works → Films/Editing.' },

    { k: ['eusexua'],
      r: 'EUSEXUA has both BTS footage and a Trailer — available in Works → Films/Editing.' },

    { k: ['rem','mosaic','oono','threshold','unraveled','nightmare','surfing','somewhere nowhere','building blocks','sensitive content','melancholia','music video','pink visual'],
      r: 'Those are all in the Films/Editing section on the Works page — click any clip to view.' },

    { k: ['photo','photography','photographer','shoot','shoots','images','portraits','portrait'],
      r: 'Photography work covers: NYFW 2025, Portraits, Book Launch Event, Latinx Storytelling Event 2025, Holi Event 2025, Met 2025, New York City, Vellorex Product, and P-tal Product Photography.' },

    { k: ['nyfw','fashion week','new york fashion','fashion'],
      r: 'Anu shot NYFW 2025 — available in Works → Photography.' },

    { k: ['met gala','met 2025','met gala 2025'],
      r: 'MET 2025 photography is in the Photography section of Works.' },

    { k: ['holi','holi event'],
      r: 'Holi Event 2025 photography is in Works → Photography.' },

    { k: ['latinx','latinx storytelling'],
      r: 'Latinx Storytelling Event 2025 photography is in Works → Photography.' },

    { k: ['vellorex','product photography'],
      r: 'Vellorex Product and P-tal Product Photography are both in Works → Photography.' },

    { k: ['podcast','podcasts'],
      r: 'Anu has produced podcast content — find it in the Podcast track on the Works page.' },

    { k: ['documentary','documentaries','doc','docs','documentary film'],
      r: 'Anu\'s documentary film work is in the Documentary Films section of Works.' },

    { k: ['location','where','city','based','nyc','new york','new york city'],
      r: 'Anu is based in New York City.' },

    { k: ['hyderabad','india','indian','origin','from'],
      r: 'Anu is originally from Hyderabad, India — now based in New York City.' },

    { k: ['instagram','ig','@anuragini'],
      r: 'Instagram: @anuragini22\nhttps://www.instagram.com/anuragini22/' },

    { k: ['linkedin'],
      r: 'LinkedIn:\nhttps://www.linkedin.com/in/anuragini-m-786a1b19a/' },

    { k: ['resume','cv','reel','showreel','demo reel'],
      r: 'Her full work is on the Works page. For a resume or CV, reach out at medigaanuragini@gmail.com.' },

    { k: ['thanks','thank you','ty','appreciate','great','awesome','cool','perfect','nice','helpful'],
      r: 'Happy to help! Feel free to ask anything else, or reach out to Anu directly at medigaanuragini@gmail.com.' },

    { k: ['bye','goodbye','ciao','later','see you','done'],
      r: 'Thanks for stopping by! You can always reach Anu at medigaanuragini@gmail.com.' },
  ];

  const FALLBACKS = [
    "I don't have that detail — try asking about Anu's work, process, or how to hire her.",
    "For that one you'd be best off emailing Anu directly at medigaanuragini@gmail.com.",
    "Not sure! Want to know about her brand work, films, photography, or contact info?",
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
    bubble.classList.toggle('open', isOpen);
    if (isOpen) setTimeout(() => document.getElementById('chat-in').focus(), 230);
  }

  function addMsg(text, who) {
    const log = document.getElementById('chat-log');
    const div = document.createElement('div');
    div.className = `cm ${who}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function send() {
    const inp = document.getElementById('chat-in');
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';
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
    }, 550 + Math.random() * 350);
  }

  bubble.addEventListener('click', toggleChat);
  document.getElementById('chat-x').addEventListener('click', toggleChat);
  document.getElementById('chat-go').addEventListener('click', send);
  document.getElementById('chat-in').addEventListener('keydown', e => {
    if (e.key === 'Enter') send();
  });

})();
