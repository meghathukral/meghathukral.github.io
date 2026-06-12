/* =====================================================================
   Megha Thukral · interactive site visualizations
   pure vanilla JS, no dependencies.

   two visualizations live here:
   1. venue clusters: each circle is a venue, each dot orbiting it is a paper.
   2. research universe: a single core circle in the center with five
      research-program clusters around it. clicking the core or any cluster
      expands a side panel and brightens the cross-cluster connection lines
      that link papers and people across institutions.
   ===================================================================== */

const SVG = "http://www.w3.org/2000/svg";

/* ---------- shared paper index (used by both visualizations) ---------- */
const PAPER_INDEX = {
  "tdost":         { title:"TDOST: Layout-Agnostic HAR via Textual Descriptions of Sensor Triggers",
                     venue:"IMWUT 2025",                             anchor:"#pub-tdost",          first:true  },
  "cdhar":         { title:"Cross-Domain HAR: Few-Shot Transfer Learning for Human Activity Recognition",
                     venue:"ACM TIST 2025",                          anchor:"#pub-cdhar",          first:true  },
  "agentsense":    { title:"AgentSense: Virtual Sensor Data Generation Using LLM Agents",
                     venue:"AAAI 2026",                              anchor:"#pub-agentsense",     first:true  },
  "sslhar":        { title:"How Much Unlabeled Data is Really Needed for Effective Self-Supervised HAR?",
                     venue:"ISWC 2023",                              anchor:"#pub-sslhar"                      },
  "genai4hs":      { title:"Generative AI and Foundation Models for Human Sensing (GenAI4HS)",
                     venue:"UbiComp 2025",                           anchor:"#pub-genai4hs"                    },
  "wavelet-arxiv": { title:"Wavelet-Driven Masked Multiscale Reconstruction for PPG Foundation Models",
                     venue:"under review at ICML 2026 (arXiv 2026)", anchor:"#pub-wavelet-arxiv",  first:true  },
  "wavelet-w":     { title:"Wavelet-Based Masked Multiscale Reconstruction for PPG Foundation Models",
                     venue:"NeurIPS 2025 Workshop on Time Series for Health",
                                                                     anchor:"#pub-wavelet-w",      first:true  },
  "ondevice":      { title:"Towards On-Device Foundation Models for Raw Wearable Signals",
                     venue:"NeurIPS 2025 Workshop on Time Series for Health",
                                                                     anchor:"#pub-ondevice"                    },
  "himae":         { title:"HiMAE: Hierarchical Masked Autoencoders for Wearable Time Series",
                     venue:"ICLR 2026",                              anchor:"#pub-himae"                       },
  "voice":         { title:"A Personalized Real-Time Proactive Voice Memory Assistant",
                     venue:"ICASSP 2026",                            anchor:"#pub-voice"                       },
  "sleep":         { title:"Multimodal Self-Supervised Learning for Wearable Sleep Staging Using PPG and Accelerometer Signals",
                     venue:"ICASSP 2026",                            anchor:"#pub-sleep"                       },
  "wafer":         { title:"WAFER: Evaluating MLLMs on Structured Health Data and Clinical Waveforms",
                     venue:"in submission at NeurIPS 2026",          anchor:"#pub-wafer",          first:true, upcoming:true },
  "k9bench":       { title:"K9-Bench: Evaluating Multimodal LLMs on Canine-Centric Videos",
                     venue:"in submission at NeurIPS 2026 (Datasets and Benchmarks)", anchor:"#pub-k9",      upcoming:true },
  "hicd":          { title:"On Hierarchical Modeling of ICD Codes for EHR Foundation Models",
                     venue:"under review at MLHC 2025",              anchor:"#pub-hicd",                      upcoming:true },
};

/* =====================================================================
   1. venue clusters
   ===================================================================== */

const VENUE_PAPERS = {
  "IMWUT":     ["tdost"],
  "ACM TIST":  ["cdhar"],
  "AAAI":      ["agentsense"],
  "NeurIPS-W": ["wavelet-w","ondevice"],
  "ICLR":      ["himae"],
  "ICASSP":    ["voice","sleep"],
  "ISWC":      ["sslhar"],
  "UbiComp":   ["genai4hs"],
  "arXiv":     ["wavelet-arxiv"],
  "NeurIPS":   ["wafer","k9bench"],
  "MLHC":      ["hicd"],
};

const VENUE_META = {
  "IMWUT":     { full:"Proc. ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies",  track:"published", klass:"v-imwut"    },
  "ACM TIST":  { full:"ACM Transactions on Intelligent Systems and Technology",                  track:"published", klass:"v-tist"     },
  "AAAI":      { full:"AAAI Conference on Artificial Intelligence",                              track:"published", klass:"v-aaai"     },
  "NeurIPS-W": { full:"NeurIPS Workshop on Learning from Time Series for Health",                track:"published", klass:"v-neuripsw" },
  "ICLR":      { full:"International Conference on Learning Representations",                    track:"published", klass:"v-iclr"     },
  "ICASSP":    { full:"IEEE Conference on Acoustics, Speech and Signal Processing",              track:"published", klass:"v-icassp"   },
  "ISWC":      { full:"ACM International Symposium on Wearable Computers",                       track:"published", klass:"v-iswc"     },
  "UbiComp":   { full:"ACM International Joint Conference on Pervasive and Ubiquitous Computing",track:"published", klass:"v-ubicomp"  },
  "arXiv":     { full:"arXiv preprints",                                                         track:"preprint",  klass:"v-arxiv"    },
  "NeurIPS":   { full:"NeurIPS 2026 Datasets and Benchmarks, currently in submission",           track:"upcoming",  klass:"v-neurips"  },
  "MLHC":      { full:"Machine Learning for Healthcare 2025, currently under review",            track:"upcoming",  klass:"v-mlhc"     },
};

const VENUE_ORDER = [
  "IMWUT","ACM TIST","AAAI","ICLR","NeurIPS-W","ICASSP","ISWC","UbiComp","arXiv",
  "NeurIPS","MLHC"
];

function buildVenueViz(rootId, hintId) {
  const root = document.getElementById(rootId);
  const hint = document.getElementById(hintId);
  if (!root) return;

  VENUE_ORDER.forEach(v => {
    const ids = VENUE_PAPERS[v]; if (!ids) return;
    const meta = VENUE_META[v];
    const cluster = document.createElement("div");
    cluster.className = "v-cluster track-" + meta.track;

    const W = 220, H = 220, cx = W/2, cy = H/2;
    const hubR = 36 + Math.min(ids.length, 4) * 2;
    const ringR = hubR + 36;

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("class", "v-svg " + meta.klass);

    const halo = document.createElementNS(SVG, "circle");
    halo.setAttribute("cx", cx); halo.setAttribute("cy", cy);
    halo.setAttribute("r", ringR + 14); halo.setAttribute("class", "v-halo");
    svg.appendChild(halo);

    const hub = document.createElementNS(SVG, "circle");
    hub.setAttribute("cx", cx); hub.setAttribute("cy", cy);
    hub.setAttribute("r", hubR); hub.setAttribute("class", "v-hub");
    svg.appendChild(hub);

    const name = document.createElementNS(SVG, "text");
    name.setAttribute("x", cx); name.setAttribute("y", cy - 2);
    name.setAttribute("class", "v-name"); name.textContent = v;
    svg.appendChild(name);

    const count = document.createElementNS(SVG, "text");
    count.setAttribute("x", cx); count.setAttribute("y", cy + 14);
    count.setAttribute("class", "v-num");
    count.textContent = ids.length + (ids.length === 1 ? " paper" : " papers");
    svg.appendChild(count);

    const n = ids.length;
    ids.forEach((pid, i) => {
      const p = PAPER_INDEX[pid];
      const a = (-Math.PI/2) + (2*Math.PI * i / Math.max(n, 1));
      const px = cx + ringR * Math.cos(a);
      const py = cy + ringR * Math.sin(a);

      const line = document.createElementNS(SVG, "line");
      line.setAttribute("x1", cx); line.setAttribute("y1", cy);
      line.setAttribute("x2", px); line.setAttribute("y2", py);
      line.setAttribute("class", "v-link");
      svg.appendChild(line);

      const a11 = document.createElementNS(SVG, "a");
      a11.setAttribute("href", p.anchor);
      a11.setAttribute("class", "v-dot-link");

      const dot = document.createElementNS(SVG, "circle");
      dot.setAttribute("cx", px); dot.setAttribute("cy", py);
      dot.setAttribute("r", p.first ? 9 : 7);
      dot.setAttribute("class",
        "v-dot" +
        (p.first ? " is-first" : "") +
        (p.upcoming ? " is-upcoming" : "")
      );
      dot.style.animationDelay = (i * 0.08) + "s";

      const tt = document.createElementNS(SVG, "title");
      tt.textContent = `${p.title}. ${v} ${p.venue}.`;
      dot.appendChild(tt);
      a11.appendChild(dot);
      svg.appendChild(a11);

      dot.addEventListener("mouseenter", () => {
        if (hint) hint.textContent =
          `${p.first ? "★ " : ""}${p.upcoming ? "[in submission] " : ""}${p.title}. ${p.venue}.`;
      });
      dot.addEventListener("mouseleave", () => {
        if (hint) hint.textContent = hint.dataset.default;
      });
    });

    cluster.appendChild(svg);

    const cap = document.createElement("div");
    cap.className = "v-cap";
    cap.innerHTML = `<span class="v-cap-name">${v}</span><span class="v-cap-meta">${meta.full}</span>`;
    cluster.appendChild(cap);

    root.appendChild(cluster);
  });
  if (hint) hint.dataset.default = hint.textContent;
}

/* =====================================================================
   2. research universe (clusters around a central core)

   each cluster represents a research program (not just an institution),
   so a single paper can belong to two clusters at once. for example
   WAFER lives in both the OptumAI cluster and the MLLM cluster, and the
   visualization makes that overlap visible as a curve linking the two.

   clicking the core or a cluster expands a detail panel and brightens
   the cross-cluster connection lines that touch the active node.
   ===================================================================== */

const CLUSTERS = [
  {
    id: "aicaring",
    klass: "rc-aicaring",
    short: "AI CARING",
    name: "NSF AI CARING",
    institution: "Georgia Tech, NSF AI Institute",
    when: "2021 to present",
    blurb: "An NSF AI Institute on collaborative AI for care of older adults at home, anchored in the Plotz lab at Georgia Tech. This is the largest cluster of my PhD work, and most of my smart-home and human activity recognition publications come out of it. Research in this cluster spans wearable HAR, smart-home sensing, self-supervised learning, and LLM agents for synthetic data generation.",
    advisor: "Thomas Plotz",
    pos: { x: 220, y: 200 },
    members: [
      { name:"Thomas Plotz", role:"advisor", lead:true },
      { name:"Harish Haresamudram" },
      { name:"Sourish Dhekane" },
      { name:"Shruthi K. Hiremath" },
      { name:"Zikang Leng" },
      { name:"YaQi Liu" },
      { name:"Hrudhai Rajasekhar" },
      { name:"Jingyuan He" },
      { name:"Chi Ian Tang" },
    ],
    papers: ["tdost","cdhar","agentsense","sslhar","genai4hs"],
  },
  {
    id: "sra",
    klass: "rc-sra",
    short: "SRA",
    name: "Samsung Research America Digital Health",
    institution: "Samsung Research America, Mountain View",
    when: "May 2025 to present",
    blurb: "An industry research internship on the Biomarkers team in the Digital Health Lab. The thread here is foundation models for raw wearable signals at population scale, including photoplethysmography, accelerometer streams, sleep, and voice. Everything in this cluster is downstream of the same large-scale pretraining infrastructure. The team received the SRA President Award in 2025.",
    advisor: "Sharanya Arcot Desai",
    pos: { x: 780, y: 200 },
    members: [
      { name:"Sharanya Arcot Desai", role:"lead", lead:true },
      { name:"Sang-Ah Lee" },
      { name:"Cyrus Tanade" },
      { name:"Juhyeon Lee" },
      { name:"Hao Zhou" },
      { name:"Baiying Lu" },
      { name:"Md Mahbubur Rahman" },
      { name:"Viswam Nathan" },
      { name:"Keum San Chun" },
      { name:"Migyeong Gwak" },
      { name:"Md S. H. Khan" },
      { name:"Minkyu Han" },
      { name:"Rebecca Choi" },
    ],
    papers: ["wavelet-arxiv","wavelet-w","ondevice","himae","voice","sleep"],
  },
  {
    id: "mllm",
    klass: "rc-mllm",
    short: "MLLM",
    name: "MLLM Health and Vision",
    institution: "Multi-institutional collaboration",
    when: "2025 to present",
    blurb: "A collaborative thread on probing multimodal large language models in domains where they are still poorly characterized, including clinical waveforms paired with structured EHR and canine-centric video understanding. Both papers in this cluster are currently in submission to the NeurIPS 2026 Datasets and Benchmarks track. WAFER also overlaps with the OptumAI cluster, since the same evaluation framework is used to characterize clinical foundation models.",
    pos: { x: 780, y: 420 },
    members: [
      { name:"Yusuf Ali", role:"lead", lead:true },
      { name:"WAFER co-authors" },
      { name:"K9-Bench co-authors" },
    ],
    papers: ["wafer","k9bench"],
  },
  {
    id: "optumai",
    klass: "rc-optumai",
    short: "OptumAI",
    name: "OptumAI Clinical Foundation Models",
    institution: "OptumAI, industry collaboration",
    when: "2024 to present",
    blurb: "An industry collaboration on foundation models for clinical electronic health records. The cluster includes hierarchy-aware ICD encoding for EHR representation learning, and the multimodal evaluation work that pairs structured EHR with physiological waveforms. WAFER is shared with the MLLM cluster because it is the bridge between clinical foundation models and multimodal LLM evaluation.",
    pos: { x: 220, y: 420 },
    members: [
      { name:"OptumAI ML team", role:"team" },
      { name:"Clinical collaborators" },
    ],
    papers: ["hicd","wafer"],
  },
  {
    id: "bbg",
    klass: "rc-bbg",
    short: "BBG",
    name: "Bloomberg AI Group",
    institution: "Bloomberg LP, New York",
    when: "Summer 2022",
    blurb: "An ML internship on the AI Platform team in New York. The work focused on building and deploying an FAQ retrieval system using sentence encoders and on automating ML workflows with Argo while containerizing models on Kubernetes and KServe for resilient model serving. This cluster is intentionally separate from the academic and digital-health clusters because its output was deployed infrastructure rather than papers.",
    pos: { x: 500, y: 540 },
    members: [
      { name:"Bloomberg AI Platform team" },
    ],
    papers: [],
  },
];

const CORE = {
  id: "core",
  klass: "rc-core",
  short: "MT",
  name: "Megha Thukral",
  blurb: "I am a third-year PhD candidate at Georgia Tech. My research lives at the intersection of machine learning, ubiquitous sensing, and digital health, and the five clusters around this central node represent the research programs I have been most active in. The dotted curves drawn between clusters indicate papers and collaborators that span more than one program. Click on any cluster to expand its details below, including the full list of papers and people, and to brighten the cross-cluster links that touch it.",
};

function buildResearchUniverse(svgId, panelId) {
  const svgEl   = document.getElementById(svgId);
  const panelEl = document.getElementById(panelId);
  if (!svgEl || !panelEl) return;
  const containerEl = svgEl.parentElement;

  const W = 1100, H = 760;
  svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const cx = W/2, cy = 380;
  const coreR = 96;
  const clusterR = 70;
  const previewR = clusterR + 28;
  const expandR  = clusterR + 88;

  // re-layout cluster positions for the larger canvas
  const POS = {
    aicaring: { x: 240, y: 220 },
    sra:      { x: 860, y: 220 },
    mllm:     { x: 860, y: 540 },
    optumai:  { x: 240, y: 540 },
    bbg:      { x: 550, y: 660 },
  };
  CLUSTERS.forEach(c => { if (POS[c.id]) c.pos = POS[c.id]; });

  /* ---------- compute cross-cluster paper overlaps ---------- */
  const overlaps = [];
  for (let i = 0; i < CLUSTERS.length; i++) {
    for (let j = i+1; j < CLUSTERS.length; j++) {
      const A = CLUSTERS[i], B = CLUSTERS[j];
      const shared = A.papers.filter(p => B.papers.includes(p));
      if (shared.length) overlaps.push({ a:A.id, b:B.id, shared });
    }
  }

  /* ---------- defs ---------- */
  const defs = document.createElementNS(SVG, "defs");
  defs.innerHTML = `
    <radialGradient id="rc-core-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="var(--accent-soft)"/>
      <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.65"/>
    </radialGradient>
    <filter id="rc-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  `;
  svgEl.appendChild(defs);

  /* ---------- spoke lines core to each cluster ---------- */
  const spokes = document.createElementNS(SVG, "g");
  spokes.setAttribute("class", "rc-spokes");
  CLUSTERS.forEach(c => {
    const ln = document.createElementNS(SVG, "line");
    ln.setAttribute("x1", cx); ln.setAttribute("y1", cy);
    ln.setAttribute("x2", c.pos.x); ln.setAttribute("y2", c.pos.y);
    ln.setAttribute("class", "rc-spoke");
    ln.dataset.cluster = c.id;
    spokes.appendChild(ln);
  });
  svgEl.appendChild(spokes);

  /* ---------- cross-cluster curves ---------- */
  const xlinkLayer = document.createElementNS(SVG, "g");
  xlinkLayer.setAttribute("class", "rc-xlinks");
  overlaps.forEach(ov => {
    const A = CLUSTERS.find(c => c.id === ov.a);
    const B = CLUSTERS.find(c => c.id === ov.b);
    const mx = (A.pos.x + B.pos.x) / 2;
    const my = (A.pos.y + B.pos.y) / 2;
    // curve outward away from core
    const dx = mx - cx, dy = my - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const off = 60;
    const px = mx + (dx/len)*off;
    const py = my + (dy/len)*off;
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", `M${A.pos.x},${A.pos.y} Q${px},${py} ${B.pos.x},${B.pos.y}`);
    path.setAttribute("class", "rc-xlink");
    path.dataset.a = ov.a;
    path.dataset.b = ov.b;
    path.dataset.shared = ov.shared.join(",");

    const tt = document.createElementNS(SVG, "title");
    const sharedTitles = ov.shared.map(id => PAPER_INDEX[id].title).join(" · ");
    tt.textContent = `${A.short} and ${B.short} share ${ov.shared.length} paper${ov.shared.length>1?"s":""}: ${sharedTitles}`;
    path.appendChild(tt);

    xlinkLayer.appendChild(path);

    // small label dot at midpoint
    const lbl = document.createElementNS(SVG, "circle");
    lbl.setAttribute("cx", px); lbl.setAttribute("cy", py); lbl.setAttribute("r", 4);
    lbl.setAttribute("class", "rc-xlink-dot");
    lbl.dataset.a = ov.a; lbl.dataset.b = ov.b;
    xlinkLayer.appendChild(lbl);
  });
  svgEl.appendChild(xlinkLayer);

  /* ---------- core node ---------- */
  const coreG = document.createElementNS(SVG, "g");
  coreG.setAttribute("class", "rc-node rc-core-node");
  coreG.setAttribute("data-id", "core");

  const coreHaloOuter = document.createElementNS(SVG, "circle");
  coreHaloOuter.setAttribute("cx", cx); coreHaloOuter.setAttribute("cy", cy);
  coreHaloOuter.setAttribute("r", coreR + 56);
  coreHaloOuter.setAttribute("class", "rc-core-halo-outer rc-pulse");
  coreG.appendChild(coreHaloOuter);

  const coreHalo = document.createElementNS(SVG, "circle");
  coreHalo.setAttribute("cx", cx); coreHalo.setAttribute("cy", cy);
  coreHalo.setAttribute("r", coreR + 28);
  coreHalo.setAttribute("class", "rc-core-halo");
  coreG.appendChild(coreHalo);

  const coreCircle = document.createElementNS(SVG, "circle");
  coreCircle.setAttribute("cx", cx); coreCircle.setAttribute("cy", cy);
  coreCircle.setAttribute("r", coreR);
  coreCircle.setAttribute("class", "rc-core-circle");
  coreG.appendChild(coreCircle);

  const coreLbl = document.createElementNS(SVG, "text");
  coreLbl.setAttribute("x", cx); coreLbl.setAttribute("y", cy - 6);
  coreLbl.setAttribute("class", "rc-core-label");
  coreLbl.textContent = "Megha Thukral";
  coreG.appendChild(coreLbl);

  const coreSub = document.createElementNS(SVG, "text");
  coreSub.setAttribute("x", cx); coreSub.setAttribute("y", cy + 18);
  coreSub.setAttribute("class", "rc-core-sub");
  coreSub.textContent = "five research clusters";
  coreG.appendChild(coreSub);

  const coreHint = document.createElementNS(SVG, "text");
  coreHint.setAttribute("x", cx); coreHint.setAttribute("y", cy + 40);
  coreHint.setAttribute("class", "rc-core-hint");
  coreHint.textContent = "click any cluster to explore";
  coreG.appendChild(coreHint);

  svgEl.appendChild(coreG);

  /* ---------- cluster nodes ---------- */
  CLUSTERS.forEach(c => {
    const g = document.createElementNS(SVG, "g");
    g.setAttribute("class", "rc-node rc-cluster-node " + c.klass);
    g.setAttribute("data-id", c.id);

    const halo = document.createElementNS(SVG, "circle");
    halo.setAttribute("cx", c.pos.x); halo.setAttribute("cy", c.pos.y);
    halo.setAttribute("r", clusterR + 22);
    halo.setAttribute("class", "rc-cluster-halo");
    g.appendChild(halo);

    const ring = document.createElementNS(SVG, "circle");
    ring.setAttribute("cx", c.pos.x); ring.setAttribute("cy", c.pos.y);
    ring.setAttribute("r", clusterR);
    ring.setAttribute("class", "rc-cluster-ring");
    g.appendChild(ring);

    const lbl = document.createElementNS(SVG, "text");
    lbl.setAttribute("x", c.pos.x); lbl.setAttribute("y", c.pos.y - 8);
    lbl.setAttribute("class", "rc-cluster-label");
    lbl.textContent = c.short;
    g.appendChild(lbl);

    const counts = document.createElementNS(SVG, "text");
    counts.setAttribute("x", c.pos.x); counts.setAttribute("y", c.pos.y + 14);
    counts.setAttribute("class", "rc-cluster-count");
    counts.textContent = `${c.papers.length} paper${c.papers.length===1?"":"s"} · ${c.members.length} ${c.members.length===1?"person":"people"}`;
    g.appendChild(counts);

    const hint = document.createElementNS(SVG, "text");
    hint.setAttribute("x", c.pos.x); hint.setAttribute("y", c.pos.y + 32);
    hint.setAttribute("class", "rc-cluster-hint");
    hint.textContent = "click to expand";
    g.appendChild(hint);

    /* paper dots in two layouts:
       - small preview ring (default)
       - larger expanded ring with labels (when active)
       both positions are computed up-front; CSS transitions animate cx/cy. */
    const n = c.papers.length;
    if (n > 0) {
      const dx = c.pos.x - cx, dy = c.pos.y - cy;
      const baseAngle = Math.atan2(dy, dx);
      const spread = Math.PI * (n <= 2 ? 0.55 : 0.95);
      const start = baseAngle - spread/2;

      c.papers.forEach((pid, i) => {
        const a = start + spread * (n === 1 ? 0.5 : i/(n-1));
        const ca = Math.cos(a), sa = Math.sin(a);

        const sx = c.pos.x + previewR * ca;
        const sy = c.pos.y + previewR * sa;
        const ex = c.pos.x + expandR * ca;
        const ey = c.pos.y + expandR * sa;

        // connecting line from cluster center to paper, also animated
        const link = document.createElementNS(SVG, "line");
        link.setAttribute("x1", c.pos.x); link.setAttribute("y1", c.pos.y);
        link.setAttribute("x2", sx); link.setAttribute("y2", sy);
        link.dataset.exX = ex; link.dataset.exY = ey;
        link.dataset.smX = sx; link.dataset.smY = sy;
        link.setAttribute("class", "rc-paper-link-line");
        g.appendChild(link);

        const meta = PAPER_INDEX[pid];

        const a11 = document.createElementNS(SVG, "a");
        a11.setAttribute("href", meta.anchor);

        const d = document.createElementNS(SVG, "circle");
        d.setAttribute("cx", sx); d.setAttribute("cy", sy);
        d.dataset.exX = ex; d.dataset.exY = ey;
        d.dataset.smX = sx; d.dataset.smY = sy;
        d.setAttribute("r", meta.first ? 9 : 7);
        d.setAttribute("class", "rc-cluster-paper" + (meta.first?" is-first":"") + (meta.upcoming?" is-upcoming":""));
        const tt = document.createElementNS(SVG, "title");
        tt.textContent = `${meta.title}. ${meta.venue}.`;
        d.appendChild(tt);
        a11.appendChild(d);
        g.appendChild(a11);

        // paper label, hidden until cluster is active
        const labelOff = (meta.first ? 9 : 7) + 8;
        const lx = c.pos.x + (expandR + labelOff) * ca;
        const ly = c.pos.y + (expandR + labelOff) * sa;
        const anchor = ca > 0.2 ? "start" : (ca < -0.2 ? "end" : "middle");
        const t = document.createElementNS(SVG, "text");
        t.setAttribute("x", lx); t.setAttribute("y", ly + 4);
        t.setAttribute("text-anchor", anchor);
        t.setAttribute("class", "rc-paper-label");
        t.textContent = shortTitle(meta.title);
        g.appendChild(t);
      });
    }

    svgEl.appendChild(g);
  });

  function shortTitle(t) {
    // pick the part before the first colon, or the first ~5 words
    const head = t.split(":")[0];
    const words = head.split(/\s+/);
    return words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : "");
  }

  /* ---------- side detail panel ---------- */
  function findClusterById(id) { return CLUSTERS.find(c => c.id === id); }

  function renderPanelCore() {
    panelEl.classList.add("rc-panel--core");
    panelEl.classList.remove("rc-panel--cluster");
    panelEl.innerHTML = `
      <button class="rc-panel-close" aria-label="Close panel" data-close>×</button>
      <div class="rc-panel-eyebrow">overview</div>
      <h3 class="rc-panel-title">${CORE.name}</h3>
      <p class="rc-panel-blurb">${CORE.blurb}</p>
      <div class="rc-panel-grid">
        ${CLUSTERS.map(c => `
          <button class="rc-cluster-card ${c.klass}" data-pick="${c.id}">
            <div class="rc-cluster-card-name">${c.short}</div>
            <div class="rc-cluster-card-full">${c.name}</div>
            <div class="rc-cluster-card-meta">${c.papers.length} paper${c.papers.length===1?"":"s"} · ${c.members.length} ${c.members.length===1?"person":"people"}</div>
          </button>
        `).join("")}
      </div>
      <div class="rc-cross-section">
        <div class="rc-panel-eyebrow rc-panel-subhead">cross-cluster links</div>
        <ul class="rc-cross-list">
          ${overlaps.map(ov => {
            const A = findClusterById(ov.a), B = findClusterById(ov.b);
            return `<li><span class="rc-pill ${A.klass}">${A.short}</span> ↔ <span class="rc-pill ${B.klass}">${B.short}</span> share <strong>${ov.shared.length}</strong> paper${ov.shared.length>1?"s":""}: ${ov.shared.map(id => `<a href="${PAPER_INDEX[id].anchor}">${PAPER_INDEX[id].title}</a>`).join(" · ")}</li>`;
          }).join("")}
        </ul>
      </div>
    `;
    bindPanelButtons();
  }

  function renderPanelCluster(id) {
    const c = findClusterById(id);
    panelEl.classList.add("rc-panel--cluster");
    panelEl.classList.remove("rc-panel--core");
    const touching = overlaps.filter(ov => ov.a === id || ov.b === id);
    panelEl.innerHTML = `
      <button class="rc-panel-close" aria-label="Close panel" data-close>×</button>
      <div class="rc-panel-eyebrow">cluster ${c.short}</div>
      <h3 class="rc-panel-title">${c.name}</h3>
      <div class="rc-panel-meta"><span>${c.institution}</span><span>${c.when}</span></div>
      <p class="rc-panel-blurb">${c.blurb}</p>

      <div class="rc-panel-eyebrow rc-panel-subhead">papers in this cluster</div>
      <ul class="rc-paper-list">
        ${c.papers.length === 0
          ? `<li class="rc-empty">No papers in this cluster (this was an industry engineering internship rather than a research output cluster).</li>`
          : c.papers.map(pid => {
              const p = PAPER_INDEX[pid];
              const sharedWith = CLUSTERS
                .filter(other => other.id !== id && other.papers.includes(pid))
                .map(other => `<a class="rc-pill ${other.klass}" data-pick="${other.id}" href="javascript:void(0)">also in ${other.short}</a>`)
                .join(" ");
              return `<li>
                <a class="rc-paper-link" href="${p.anchor}">${p.title}</a>
                <div class="rc-paper-venue">${p.venue}${p.first?" · first author":""}${p.upcoming?" · in submission":""}</div>
                ${sharedWith ? `<div class="rc-paper-shared">${sharedWith}</div>` : ""}
              </li>`;
            }).join("")
        }
      </ul>

      <div class="rc-panel-eyebrow rc-panel-subhead">people in this cluster</div>
      <div class="rc-people-list">
        ${c.members.map(m => `<span class="person${m.lead?" lead":""}">${m.name}${m.role?` <em>(${m.role})</em>`:""}</span>`).join("")}
      </div>

      ${touching.length ? `
        <div class="rc-panel-eyebrow rc-panel-subhead">cross-cluster links touching ${c.short}</div>
        <ul class="rc-cross-list">
          ${touching.map(ov => {
            const otherId = ov.a === id ? ov.b : ov.a;
            const other = findClusterById(otherId);
            return `<li><button class="rc-pill ${other.klass}" data-pick="${other.id}">${other.short}</button> shares <strong>${ov.shared.length}</strong> paper${ov.shared.length>1?"s":""}: ${ov.shared.map(pid => `<a href="${PAPER_INDEX[pid].anchor}">${PAPER_INDEX[pid].title}</a>`).join(" · ")}</li>`;
          }).join("")}
        </ul>
      ` : `<div class="rc-panel-note">No cross-cluster paper overlaps for ${c.short}.</div>`}
    `;
    bindPanelButtons();
  }

  function bindPanelButtons() {
    panelEl.querySelectorAll("[data-pick]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const target = btn.getAttribute("data-pick");
        setActive(target, true);
      });
    });
    panelEl.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        closePanel();
      });
    });
  }

  function closePanel() {
    containerEl.classList.remove("panel-open");
    svgEl.querySelectorAll(".rc-node").forEach(n => {
      n.classList.remove("is-active", "is-dim");
      if (n.classList.contains("rc-cluster-node")) expandClusterDots(n, false);
    });
    svgEl.querySelectorAll(".rc-spoke").forEach(s => s.classList.remove("is-active"));
    svgEl.querySelectorAll(".rc-xlink, .rc-xlink-dot").forEach(p => p.classList.remove("is-active","is-dim"));
  }

  function expandClusterDots(node, expanded) {
    node.querySelectorAll(".rc-cluster-paper").forEach(d => {
      const x = expanded ? d.dataset.exX : d.dataset.smX;
      const y = expanded ? d.dataset.exY : d.dataset.smY;
      d.setAttribute("cx", x);
      d.setAttribute("cy", y);
    });
    node.querySelectorAll(".rc-paper-link-line").forEach(l => {
      const x = expanded ? l.dataset.exX : l.dataset.smX;
      const y = expanded ? l.dataset.exY : l.dataset.smY;
      l.setAttribute("x2", x);
      l.setAttribute("y2", y);
    });
  }

  function setActive(id) {
    svgEl.querySelectorAll(".rc-node").forEach(n => {
      const nid = n.getAttribute("data-id");
      const isActive = nid === id;
      const isCore   = nid === "core";
      n.classList.toggle("is-active",  isActive);
      n.classList.toggle("is-dim",     id !== "core" && !isActive && !isCore);
      if (n.classList.contains("rc-cluster-node")) {
        expandClusterDots(n, isActive);
      }
    });
    svgEl.querySelectorAll(".rc-spoke").forEach(s => {
      s.classList.toggle("is-active", id !== "core" && s.dataset.cluster === id);
    });
    svgEl.querySelectorAll(".rc-xlink, .rc-xlink-dot").forEach(p => {
      const touches = p.dataset.a === id || p.dataset.b === id;
      p.classList.toggle("is-active", id !== "core" && touches);
      p.classList.toggle("is-dim",    id !== "core" && !touches);
    });
    if (id === "core") renderPanelCore();
    else renderPanelCluster(id);
    containerEl.classList.add("panel-open");
    panelEl.scrollTop = 0;
  }

  function setHover(id) {
    svgEl.querySelectorAll(".rc-node").forEach(n => {
      n.classList.toggle("is-hover", n.getAttribute("data-id") === id);
    });
    if (!id) {
      svgEl.querySelectorAll(".rc-xlink, .rc-xlink-dot").forEach(p => p.classList.remove("is-peek"));
      svgEl.querySelectorAll(".rc-spoke").forEach(s => s.classList.remove("is-peek"));
      return;
    }
    svgEl.querySelectorAll(".rc-xlink, .rc-xlink-dot").forEach(p => {
      const touches = p.dataset.a === id || p.dataset.b === id;
      p.classList.toggle("is-peek", touches);
    });
    svgEl.querySelectorAll(".rc-spoke").forEach(s => {
      s.classList.toggle("is-peek", id !== "core" && s.dataset.cluster === id);
    });
  }

  /* ---------- click and hover bindings ---------- */
  svgEl.querySelectorAll(".rc-node").forEach(n => {
    n.style.cursor = "pointer";
    n.addEventListener("click", e => {
      e.stopPropagation();
      setActive(n.getAttribute("data-id"));
    });
    n.addEventListener("mouseenter", () => setHover(n.getAttribute("data-id")));
    n.addEventListener("mouseleave", () => setHover(null));
  });

  // click on empty SVG background closes the panel
  svgEl.addEventListener("click", () => closePanel());

  // esc closes the panel
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePanel();
  });

  // initial state: panel hidden, no node active
  closePanel();
}

/* ---------- bootstrap ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildVenueViz("venueViz", "venueHint");
  buildResearchUniverse("researchSvg", "researchPanel");
});
