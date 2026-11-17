/* Shared behavior + content rendering for every page.
   Content lives in content/projects.json, content/posts.json and content/posts/*.md */
document.documentElement.classList.remove('no-js');

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getJSON = (url) => fetch(url, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(url); return r.json(); });
const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtDate = (s) => parseDate(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const byNewest = (a, b) => parseDate(b.date) - parseDate(a.date);
const pad = (n) => String(n).padStart(2, '0');
const tagsHTML = (tags = []) => tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1 });
const observeReveals = (root = document) => root.querySelectorAll('.reveal:not(.visible)').forEach((el) => revealObserver.observe(el));
observeReveals();

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- Header: solid once you scroll past the hero (home only) ---------- */
const header = document.querySelector('.is-home .site-header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Project tiles ---------- */
function projectCard(p) {
  const img = p.cover || p.demo?.src || 'assets/placeholders/post-image.svg';
  return `
    <a class="project-card reveal" href="project.html?id=${encodeURIComponent(p.id)}">
      <div class="card-visual"><img src="${esc(img)}" alt="" loading="lazy"></div>
      <div class="card-body">
        <span class="card-meta">${esc(p.context ? p.context + ' · ' : '')}${esc(p.period)}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.headline)}</p>
        <span class="card-cta">View project →</span>
      </div>
    </a>`;
}
const slotCard = () => `
  <div class="slot-card reveal">
    <div><h3>Next project</h3><p>Coming soon.</p></div>
  </div>`;

function noteRow(p) {
  return `
    <li class="note-row reveal">
      <a href="post.html?slug=${encodeURIComponent(p.slug)}">
        <time class="note-date" datetime="${esc(p.date)}">${fmtDate(p.date)}</time>
        <div><h3>${esc(p.title)}</h3>${p.summary ? `<p>${esc(p.summary)}</p>` : ''}</div>
        ${tagsHTML(p.tags)}
      </a>
    </li>`;
}
const loadError = (what) => `<div class="empty">Couldn't load ${what}. If you opened this file directly, serve the <code>dist/</code> folder over HTTP instead (see README).</div>`;

/* ---------- Page renderers ---------- */
const pages = {
  async home() {
    const projEl = $('[data-projects]');
    const notesEl = $('[data-notes]');
    getJSON('content/projects.json').then((list) => {
      const shown = list.filter((p) => p.featured !== false);
      projEl.innerHTML = shown.map(projectCard).join('');
      observeReveals(projEl);
    }).catch(() => { projEl.innerHTML = loadError('projects'); });
    getJSON('content/posts.json').then((list) => {
      const latest = list.filter((p) => !p.draft).sort(byNewest).slice(0, 3);
      notesEl.innerHTML = latest.length ? latest.map(noteRow).join('') : '<li class="empty">No notes yet — the first one is coming.</li>';
      observeReveals(notesEl);
    }).catch(() => { notesEl.innerHTML = `<li>${loadError('notes')}</li>`; });
  },

  async projects() {
    const el = $('[data-projects]');
    try {
      const list = await getJSON('content/projects.json');
      el.innerHTML = list.map(projectCard).join('');
      observeReveals(el);
    } catch { el.innerHTML = loadError('projects'); }
  },

  async project() {
    const id = new URLSearchParams(location.search).get('id');
    const root = $('[data-project]');
    let list;
    try { list = await getJSON('content/projects.json'); } catch { root.innerHTML = `<div class="shell" style="padding:80px 0">${loadError('this project')}</div>`; return; }
    const p = list.find((x) => x.id === id);
    if (!p) { root.innerHTML = `<div class="shell" style="padding:80px 0"><div class="empty">No project called “${esc(id || '')}”. <a class="text-link" href="projects.html">All projects →</a></div></div>`; return; }
    document.title = `${p.title} — Thomas Tan`;

    const link = (url, label, primary) => url
      ? `<a class="btn ${primary ? 'btn-primary' : ''}" href="${esc(url)}" target="_blank" rel="noreferrer">${label} <span aria-hidden="true">↗</span></a>`
      : `<span class="btn" aria-disabled="true">${label} · coming soon</span>`;

    const d = p.demo || {};
    let stage;
    if (d.type === 'iframe' && d.src) stage = `<iframe src="${esc(d.src)}" title="${esc(p.title)} live demo" loading="lazy" allow="fullscreen; clipboard-write" referrerpolicy="no-referrer"></iframe>`;
    else if (d.type === 'video' && d.src) stage = `<video src="${esc(d.src)}" ${d.poster ? `poster="${esc(d.poster)}"` : ''} controls playsinline preload="metadata"></video>`;
    else stage = `<img src="${esc(d.src || 'assets/placeholders/post-image.svg')}" alt="${esc(d.alt || p.title + ' demo placeholder')}">`;
    const live = d.type === 'iframe' && d.src;

    root.innerHTML = `
      <div class="shell">
        <header class="proj-head">
          <div>
            <a class="crumb" href="projects.html">← All projects</a>
            <p class="eyebrow">${esc(p.context || 'Project')} · ${esc(p.period)}</p>
            <h1>${esc(p.title)}</h1>
            <p class="headline">${esc(p.headline)}</p>
            <div class="proj-links">${link(p.links?.demo, 'Live demo', true)}${link(p.links?.code, 'Source code')}${p.links?.writeup ? link(p.links.writeup, 'Write-up') : ''}</div>
          </div>
          <dl class="spec">
            <div><dt>Role</dt><dd>${esc(p.role || '—')}</dd></div>
            <div><dt>When</dt><dd>${esc(p.period)}</dd></div>
            <div><dt>Context</dt><dd>${esc(p.context || '—')}</dd></div>
            <div><dt>Stack</dt><dd>${esc((p.stack || []).join(', '))}</dd></div>
          </dl>
        </header>

        <section class="demo" aria-label="Demo">
          <div class="demo-bar"><i></i><i></i><i></i><span>${live ? esc(d.src) : 'demo / ' + esc(p.id)}</span>${live ? '<b class="live">● LIVE</b>' : ''}</div>
          <div class="demo-stage">${stage}</div>
          ${d.caption ? `<p class="demo-caption">${esc(d.caption)}</p>` : ''}
        </section>

        <div class="proj-body">
          <div>${(p.sections || []).map((s) => `
            <section class="proj-section reveal">
              <h2>${esc(s.heading)}</h2>
              ${s.body ? `<p>${esc(s.body)}</p>` : `<p class="todo">${esc(s.placeholder || 'Add this section in content/projects.json.')}</p>`}
            </section>`).join('')}
          </div>
          <aside class="post-aside"><b>Summary</b>${esc(p.summary)}</aside>
        </div>

        ${(p.gallery || []).length ? `<div class="gallery">${p.gallery.map((g) => `
          <figure class="reveal"><img src="${esc(g.src)}" alt="${esc(g.alt || '')}" loading="lazy">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('')}
        </div>` : ''}
      </div>`;
    observeReveals(root);
  },

  async blog() {
    const listEl = $('[data-notes]');
    const filterEl = $('[data-filter]');
    let posts;
    try { posts = (await getJSON('content/posts.json')).filter((p) => !p.draft).sort(byNewest); }
    catch { listEl.innerHTML = `<li>${loadError('notes')}</li>`; return; }

    const tags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();
    let active = new URLSearchParams(location.search).get('tag') || 'all';
    if (active !== 'all' && !tags.includes(active)) active = 'all';

    const render = () => {
      filterEl.innerHTML = ['all', ...tags].map((t) => `<button class="chip" type="button" data-tag="${esc(t)}" aria-pressed="${t === active}">${t === 'all' ? `All (${posts.length})` : esc(t)}</button>`).join('');
      const shown = active === 'all' ? posts : posts.filter((p) => (p.tags || []).includes(active));
      listEl.innerHTML = shown.length ? shown.map(noteRow).join('') : '<li class="empty">Nothing tagged that yet.</li>';
      listEl.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    };
    filterEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tag]');
      if (!b) return;
      active = b.dataset.tag;
      const url = new URL(location.href);
      active === 'all' ? url.searchParams.delete('tag') : url.searchParams.set('tag', active);
      history.replaceState(null, '', url);
      render();
    });
    render();
  },

  async post() {
    const slug = new URLSearchParams(location.search).get('slug');
    const root = $('[data-post]');
    const fail = (msg) => { root.innerHTML = `<div class="shell" style="padding:80px 0"><div class="empty">${msg} <a class="text-link" href="blog.html">All notes →</a></div></div>`; };
    let all;
    try { all = await getJSON('content/posts.json'); } catch { return fail("Couldn't load notes."); }
    const posts = all.filter((p) => !p.draft).sort(byNewest);
    const p = all.find((x) => x.slug === slug); // drafts are reachable by direct URL for previewing
    if (!p) return fail(`No note called “${esc(slug || '')}”.`);
    const i = posts.indexOf(p);

    let md;
    try { const r = await fetch(`content/posts/${encodeURIComponent(p.slug)}.md`, { cache: 'no-cache' }); if (!r.ok) throw 0; md = await r.text(); }
    catch { return fail(`The file content/posts/${esc(p.slug)}.md is missing.`); }

    const html = window.marked ? window.marked.parse(md) : `<pre>${esc(md)}</pre>`;
    const minutes = Math.max(1, Math.round(md.split(/\s+/).length / 230));
    document.title = `${p.title} — Thomas Tan`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && p.summary) desc.content = p.summary;

    const newer = i > 0 ? posts[i - 1] : null;
    const older = i >= 0 ? posts[i + 1] : null;
    root.innerHTML = `
      <div class="shell">
        <header class="post-head">
          <a class="crumb" href="blog.html">← All notes</a>
          <h1>${esc(p.title)}</h1>
          <div class="post-meta">${p.draft ? '<span style="color:var(--coral)">Draft · not listed</span>' : ''}<time datetime="${esc(p.date)}">${fmtDate(p.date)}</time><span>${minutes} min read</span>${tagsHTML(p.tags)}</div>
        </header>
        <div class="post-layout">
          <article class="prose">${html}</article>
          <aside class="post-aside" data-outline hidden><b>Outline</b></aside>
        </div>
        <nav class="post-nav" aria-label="More notes">
          ${older ? `<a href="post.html?slug=${encodeURIComponent(older.slug)}"><small>← Older</small>${esc(older.title)}</a>` : '<span></span>'}
          ${newer ? `<a class="next" href="post.html?slug=${encodeURIComponent(newer.slug)}"><small>Newer →</small>${esc(newer.title)}</a>` : ''}
        </nav>
      </div>`;

    // Outline from headings
    const heads = root.querySelectorAll('.prose h2, .prose h3');
    const outline = $('[data-outline]', root);
    if (heads.length > 1) {
      heads.forEach((h, n) => {
        h.id = h.id || `s-${n}-${h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
        const a = document.createElement('a');
        a.href = `#${h.id}`; a.textContent = h.textContent;
        if (h.tagName === 'H3') a.style.paddingLeft = '12px';
        outline.appendChild(a);
      });
      outline.hidden = false;
    }
    root.querySelectorAll('.prose a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noreferrer'; });
    root.querySelectorAll('.prose img').forEach((img) => { img.loading = 'lazy'; });
  },
};

const page = document.body.dataset.page;
if (pages[page]) pages[page]();
