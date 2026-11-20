import gen from './generated.json';
import land from './land.json';

export const papers = gen.papers
  .map((p) => ({ ...p, t: p.year + p.month / 12 }))
  .sort((a, b) => b.t - a.t);
export const life = gen.life;
export const cities = gen.cities;
export const portrait = gen.portrait;
export { land };

export const THEMES = {
  robust: { name: 'LLM robustness and evaluation', color: '#ffd27a',
    blurb: 'How reliable language models stay across many turns, and how to measure that rigorously.' },
  agents: { name: 'Agentic AI systems', color: '#7fe0d0',
    blurb: 'Long-horizon reasoning, tool use and skills that let agents finish multi-step work.' },
  clinical: { name: 'Clinical AI', color: '#ff9db0',
    blurb: 'Disease progression modeling and explainable risk prediction that clinicians can rely on.' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const SITE = __SITE__;
export const CLASSIC = { home: '/about/', research: '/publications/', news: '/news/', journey: '/cv/', awards: '/about/', teaching: '/teaching/', blog: '/blog/', life: '/life/', contact: '/contact/' };

export const news = [
  ['2026-11-09', 'Invited to serve as a reviewer for <a href="https://jmlr.org/tmlr/">Transactions on Machine Learning Research</a>.'],
  ['2026-10-09', `Gave two invited talks on <a href="${SITE}/jev-as-a-judge/">JEV-as-a-Judge</a>, one at Microsoft and one at Conviva.ai (<a href="${SITE}/assets/pdf/jev_as_a_judge_talk.pdf">slides</a>).`],
  ['2026-09-24', '<a href="https://www.skillsbench.ai/">SkillsBench</a>, where I was a core contributor, was accepted at NeurIPS 2026.'],
  ['2026-07-03', 'Our research on reliable LLMs for organ transplantation patient support was selected for <a href="https://openai.com/form/researcher-access-program/">OpenAI’s Researcher Access Program</a>.'],
  ['2026-05-09', 'Hosting an invited tutorial on LLM and AI agent measurement science at <a href="https://pomsmeetings.org/conf-2026/">POMS 2026</a> with Dr. Ramayya Krishnan and Dr. Rema Padman.'],
  ['2026-01-26', '“Time-To-Inconsistency: A Survival Analysis of Large Language Model Robustness to Adversarial Attacks” was accepted to <a href="https://iclr.cc/">ICLR 2026</a>.'],
  ['2025-11-16', '“No Black Box Anymore” took 3rd place in the <a href="https://amia.org/about-amia/amia-awards/research-awards/amia-student-paper-award-winners">AMIA 2025 Student Paper Competition</a>.'],
  ['2025-10-02', '“No Black Box Anymore” was accepted to AMIA 2025 and named one of eight student paper finalists.'],
  ['2025-07-01', '“Enhancing end-stage renal disease outcome prediction” was accepted to the <a href="https://pubmed.ncbi.nlm.nih.gov/40795063/">Journal of the American Medical Informatics Association</a>.'],
  ['2025-05-15', '“Firm or Fickle? Evaluating Large Language Models Consistency in Sequential Interactions” was accepted to <a href="https://aclanthology.org/2025.findings-acl.347/">ACL 2025</a>.'],
  ['2024-06-28', '“Towards Interpretable End-Stage Renal Disease Prediction” was accepted to <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12099416/">AMIA 2024</a>.'],
];

const journey = [
  ['Jun to Aug 2026', 'ML Research Scientist Intern, Netflix', 'AI Foundations team', 'https://research.netflix.com/'],
  ['Jun to Aug 2025', 'Applied Scientist Intern, Amazon', 'Generative recommendation systems, Customer Behavior Analytics team', 'https://www.amazon.science/'],
  ['Aug 2022', 'Started the Ph.D. in Information Systems, Carnegie Mellon University', 'Co-advised by Rema Padman and Ramayya Krishnan', 'https://www.heinz.cmu.edu/'],
  ['Aug 2020', 'Started the Master’s in Information Systems, Carnegie Mellon University', 'Business Intelligence and Data Analytics track', null],
];

const awards = [
  ['2026', 'Presidential Fellowship, Carnegie Mellon University', null],
  ['2025', 'TCS Presidential Fellowship, Carnegie Mellon University', null],
  ['2024', 'CMLH Fellowship in Generative AI in Healthcare, Carnegie Mellon University', 'https://www.cs.cmu.edu/cmlh/2024-generative-ai-fellows'],
  ['2023', 'CMLH Fellowship in Digital Health Innovation, Carnegie Mellon University', 'https://www.cs.cmu.edu/cmlh/digital-health-archive/cmlh-digital-health-fellows-2023'],
];

const lectures = [
  ['95-891 Introduction to AI', 'Spring 2026', 'AI Agents', null],
  ['95-891 Introduction to AI', 'Spring 2026', 'AI Coding', null],
  ['94-706 Healthcare Information Systems', 'Spring 2026', 'GenAI in Healthcare', `${SITE}/assets/slides/s26_94706.pdf`],
  ['95-891 Introduction to AI', 'Fall 2025', 'AI Agents', `${SITE}/assets/slides/fall25_95891_ai_agents.pdf`],
  ['95-891 Introduction to AI', 'Spring 2025', 'Deep Learning for NLP', `${SITE}/assets/slides/spring25_95891_dl_nlp.pdf`],
];
const taNow = [
  ['95-891', 'Introduction to AI', 'https://www.heinz.cmu.edu/current-students/courses/95-891'],
  ['95-864', 'AI Model Development', 'https://www.heinz.cmu.edu/current-students/courses/95-864'],
  ['94-815', 'Agentic Technologies', 'https://www.heinz.cmu.edu/current-students/courses/94-815'],
];
const taPast = [
  ['95-891', 'Introduction to AI', 'Fall 25, Spring 25, Fall 24'],
  ['95-865', 'Unstructured Data Analytics', 'Fall 25, Spring 25, Fall 24'],
  ['95-888', 'Data Focused Python', 'Fall 25'],
  ['11-711', 'Advanced NLP', 'Fall 24'],
  ['10-681', 'Computational Foundation for Machine Learning', 'Summer 24'],
  ['10-680', 'Mathematical Foundation for Machine Learning', 'Summer 24'],
  ['95-760', 'Decision Making under Uncertainty', 'Spring 24'],
];

const links = [
  ['Email', 'mailto:yubol@andrew.cmu.edu', 'yubol@andrew.cmu.edu'],
  ['Google Scholar', 'https://scholar.google.com/citations?user=hgN6B6kAAAAJ', 'Citations and full list'],
  ['GitHub', 'https://github.com/yubol-bobo', 'yubol-bobo'],
  ['LinkedIn', 'https://www.linkedin.com/in/yubol', 'in/yubol'],
  ['DBLP', 'https://dblp.org/pid/97/8968-4.html', 'Publication index'],
  ['ORCID', 'https://orcid.org/0009-0002-8234-4415', '0009-0002-8234-4415'],
  ['Résumé', `${SITE}/assets/pdf/Resume_Yubo.pdf`, 'PDF'],
];

const fmtDate = (d) => { const [y, m] = d.split('-'); return `${MONTHS[+m - 1]} ${y}`; };
const a = (href, text) => href ? `<a href="${href}" target="${__TARGET__}" rel="noopener">${text}</a>` : text;

function authorLine(p) {
  let list = p.authors;
  if (list.length > 6) {
    const i = list.indexOf('Yubo Li');
    list = i > 3 ? [...list.slice(0, 3), 'Yubo Li', 'et al.'] : [...list.slice(0, 5), 'et al.'];
  }
  return list.map((n) => (n === 'Yubo Li' ? '<b>Yubo Li</b>' : n)).join(', ');
}
export const venueOf = (p) => {
  if (['Preprint'].includes(p.abbr)) return p.venue && /review/.test(p.venue) ? p.venue.replace('Preprint, u', 'U') : 'Preprint';
  return p.abbr || p.venue;
};

function paperItem(p) {
  return `<li class="paper" data-key="${p.key}" data-theme="${p.theme}">
    ${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : '<span class="noimg"></span>'}
    <div>
      <h4>${a(p.link, p.title)}</h4>
      <p class="authors">${authorLine(p)}</p>
      <p class="meta"><span class="venue${/Preprint|review/.test(venueOf(p)) ? '' : ' peer'}">${venueOf(p)}</span><span>${MONTHS[p.month]} ${p.year}</span>${p.page ? a(p.page, 'Project page') : ''}</p>
    </div></li>`;
}

export const PANELS = {
  home: {
    place: 'The cabin', title: 'About', html: () => `
      <div class="about-top"><img class="portrait" src="${portrait}" alt="Yubo Li smiling by a lake at sunset">
      <div><p class="lede">I’m Yubo Li, a Ph.D. candidate in Information Systems at Carnegie Mellon University.</p>
      <p>I’m co-advised by ${a('https://www.heinz.cmu.edu/faculty-research/profiles/padman-rema/', 'Dr. Rema Padman')} and ${a('https://www.heinz.cmu.edu/faculty-research/profiles/krishnan-ramayya', 'Dr. Ramayya Krishnan')}, and affiliated with the CMU-NIST AI Measurement Science &amp; Engineering Cooperative Research Center (${a('https://www.cmu.edu/aimsec/', 'AIMSEC')}).</p></div></div>
      <h3>What I work on</h3>
      <dl class="directions">
        <dt style="--c:${THEMES.robust.color}">LLM robustness and evaluation</dt><dd>I study the reliability of large language models, with emphasis on multi-turn interactions and rigorous evaluation frameworks for LLM-based systems.</dd>
        <dt style="--c:${THEMES.agents.color}">Agentic AI systems</dt><dd>Long-horizon reasoning and planning, tool use and function calling, and multi-agent coordination: the capabilities that let agents tackle complex, multi-step tasks on their own.</dd>
        <dt style="--c:${THEMES.clinical.color}">Clinical AI deployment</dt><dd>Methods for deploying these systems in healthcare, including disease progression modeling, explainable clinical risk prediction, and agentic QA systems for organ transplant patients.</dd>
      </dl>
      <p>At the heart of my work is a commitment to human–AI collaboration that actually works: systems that clinicians can rely on, that patients can benefit from, and that fail gracefully when they’re uncertain. I’m always excited to connect with others who share this vision.</p>
      <p class="actions"><a class="btn" href="mailto:yubol@andrew.cmu.edu">Email me</a><a class="btn ghost" href="${SITE}/assets/pdf/Resume_Yubo.pdf" target="${__TARGET__}" rel="noopener">Open my résumé</a></p>`,
  },
  research: {
    place: 'The observatory', title: 'Research', html: () => `
      <p class="lede">Every star overhead is a paper. Each constellation is one research direction, joined in the order the papers appeared.</p>
      <div class="chips" role="group" aria-label="Filter papers">
        <button class="chip on" data-filter="all">All ${papers.length}</button>
        ${Object.entries(THEMES).map(([k, t]) => `<button class="chip" data-filter="${k}" style="--c:${t.color}"><i></i>${t.name}</button>`).join('')}
        <button class="chip" data-filter="selected">Selected</button>
      </div>
      ${Object.entries(THEMES).map(([k, t]) => `<section class="theme" data-theme="${k}"><h3 style="--c:${t.color}"><i></i>${t.name}</h3><p class="blurb">${t.blurb}</p>
        <ul class="papers">${papers.filter((p) => p.theme === k).map(paperItem).join('')}</ul></section>`).join('')}`,
  },
  news: {
    place: 'The lighthouse', title: 'News', html: () => `
      <ol class="timeline">${news.map(([d, t]) => `<li><time>${fmtDate(d)}</time><p>${t.replace(/<a /g, '<a target="${__TARGET__}" rel="noopener" ')}</p></li>`).join('')}</ol>`,
  },
  journey: {
    place: 'The railway', title: 'Experience', html: () => `
      <p class="lede">Four stops so far, most recent first.</p>
      <ol class="timeline stops">${journey.map(([d, r, s, l]) => `<li><time>${d}</time><p><b>${a(l, r)}</b><br>${s}</p></li>`).join('')}</ol>`,
  },
  awards: {
    place: 'The summit', title: 'Awards', html: () => `
      <p class="lede">One flag on the peak for each fellowship.</p>
      <ol class="timeline">${awards.map(([y, t, l]) => `<li><time>${y}</time><p>${a(l, t)}</p></li>`).join('')}</ol>`,
  },
  teaching: {
    place: 'The open-air classroom', title: 'Teaching', html: () => `
      <blockquote>If you want to master something, teach it.<cite>Richard Feynman</cite></blockquote>
      <h3>Guest lectures</h3>
      <ul class="rows">${lectures.map(([c, term, topic, l]) => `<li><b>${topic}</b><span>${c}, ${term}</span>${l ? a(l, 'Slides') : '<em>Slides coming soon</em>'}</li>`).join('')}</ul>
      <h3>Teaching assistant, Spring 2026</h3>
      <ul class="rows">${taNow.map(([n, t, l]) => `<li><b>${t}</b><span>${a(l, n)}</span></li>`).join('')}</ul>
      <h3>Past semesters</h3>
      <ul class="rows">${taPast.map(([n, t, s]) => `<li><b>${t}</b><span>${n}</span><span>${s}</span></li>`).join('')}</ul>`,
  },
  blog: {
    place: 'The jacaranda desk', title: 'Writing', html: () => `
      <ul class="posts">
        <li><time>Mar 2026</time><h4>${a(`${SITE}/blog/2026/multi-project-management/`, 'Multi-threaded research and project management')}</h4><p>Tips and strategies for running several research projects at once. The write-up is on its way; the ${a(`${SITE}/assets/pdf/multi_projects_talk.pptx`, 'slides')} are available now.</p></li>
        <li><time>Dec 2025</time><h4>${a(`${SITE}/blog/2025/2025-ai-summary/`, '2025 AI research reflections')}</h4><p>What makes good work in the era of LLMs and agents? Notes from NeurIPS on letting go of human constraints, the field’s reunification around agents, and three directions I want to go deeper on: agents must act, collaborate, and be judged.</p></li>
      </ul>`,
  },
  life: {
    place: 'The campsite', title: 'Life', html: () => `
      <h3>Moments that stay</h3>
      <div class="photos">${life.map((l, i) => `<figure><img src="${l.src}" alt="" loading="lazy"><figcaption>${i === 3 ? `A joyful corner with ${a('https://weiyisongsoprano.github.io/', 'my love, Weiyi')}.` : l.cap}</figcaption></figure>`).join('')}</div>
      <h3>Places I’ve visited</h3>
      <div class="mapwrap"><canvas id="citymap" width="960" height="430" role="img" aria-label="World map with ${cities.length} visited places marked"></canvas><p id="cityname" aria-live="polite">${cities.length} places so far. Hover a pin to see its name.</p></div>
      <ul class="citylist">${cities.map((c) => `<li${c.note !== 'Visited' ? ' class="special"' : ''}>${c.name}${c.note !== 'Visited' ? ` <span>${c.note.toLowerCase()}</span>` : ''}</li>`).join('')}</ul>`,
  },
  contact: {
    place: 'The dock', title: 'Contact', html: () => `
      <p class="lede">The quickest way to reach me is email. I read everything and I’m glad to talk research, collaborations, or internships.</p>
      <ul class="rows links">${links.map(([n, h, s]) => `<li><b>${a(h, n)}</b><span>${s}</span></li>`).join('')}</ul>`,
  },
};

export function drawCityMap(canvas, label) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const { W: gw, H: gh, latTop, latBot, rows } = land;
  const px = (lng) => ((lng + 180) / 360) * W;
  const py = (lat) => ((latTop - lat) / (latTop - latBot)) * H;
  let hover = -1;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(190,205,255,.28)';
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) if (rows[j][i] === '1') {
      ctx.beginPath(); ctx.arc((i + 0.5) * W / gw, (j + 0.5) * H / gh, 2.3, 0, 7); ctx.fill();
    }
    cities.forEach((c, i) => {
      const x = px(c.lng), y = py(c.lat), sp = c.note !== 'Visited';
      ctx.beginPath(); ctx.arc(x, y, i === hover ? 13 : sp ? 10 : 7, 0, 7);
      ctx.fillStyle = sp ? 'rgba(255,157,176,.28)' : 'rgba(255,210,122,.25)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, sp ? 4.5 : 3.2, 0, 7);
      ctx.fillStyle = sp ? '#ff9db0' : '#ffd27a'; ctx.fill();
    });
  };
  draw();
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * W / r.width, my = (e.clientY - r.top) * H / r.height;
    let best = -1, bd = 22 * 22;
    cities.forEach((c, i) => { const d = (px(c.lng) - mx) ** 2 + (py(c.lat) - my) ** 2; if (d < bd) { bd = d; best = i; } });
    if (best !== hover) {
      hover = best; draw();
      label.textContent = best < 0 ? `${cities.length} places so far. Hover a pin to see its name.`
        : cities[best].name + (cities[best].note !== 'Visited' ? ` (${cities[best].note.toLowerCase()})` : '');
    }
  });
}
