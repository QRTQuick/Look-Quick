// Minimal client-side router that fetches HTML pages and injects their <main> content
export default function createRouter(routes){
  // Determine a base path for deployments that live under a repo subpath
  // (e.g. GitHub Pages: https://user.github.io/repo/). Prefer a <base> tag
  // if present, otherwise detect github.io patterns.
  const BASE = (() => {
    const baseEl = document.querySelector('base');
    if (baseEl) return baseEl.getAttribute('href') || '/';
    const parts = location.pathname.split('/').filter(Boolean);
    // If hosted on github.io assume first path segment is the repo name
    if (window.location.hostname.endsWith('github.io') && parts.length >= 1) {
      return `/${parts[0]}/`;
    }
    return '/';
  })();

  let outlet = document.querySelector('main.container') || document.querySelector('main');

  function resolveUrl(path){
    const p = path || 'index.html';
    // Use the BASE to construct an absolute URL for fetching
    try {
      return new URL(p, location.origin + BASE).href;
    } catch (e) {
      // fallback to relative
      return (BASE + p).replace(/\/+/g, '/');
    }
  }

  function historyPathFor(path){
    const p = path || 'index.html';
    const url = new URL(p, location.origin + BASE);
    return url.pathname + url.search + url.hash;
  }

  async function loadPage(path, addToHistory = true){
    try {
      const requested = path || 'index.html';
      const fetchUrl = resolveUrl(requested);
      const res = await fetch(fetchUrl, { cache: 'no-store' });
      if (!res.ok) {
        if (outlet) outlet.innerHTML = `<p class="muted">Failed to load ${requested}: ${res.status}</p>`;
        return;
      }
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newMain = doc.querySelector('main');
      const newTitle = doc.querySelector('title');
      if (newMain) {
        if (outlet && outlet.parentNode) outlet.parentNode.replaceChild(newMain, outlet);
        outlet = newMain;
      }
      if (newTitle) document.title = newTitle.textContent;
      // Determine route key from the requested path (basename)
      const routeKey = (requested.split('?')[0].split('/').pop()) || 'index.html';
      const init = routes && routes[routeKey];
      if (typeof init === 'function') init(outlet);
      if (addToHistory) {
        const hp = historyPathFor(requested);
        history.pushState({ path: hp }, '', hp);
      }
    } catch (err) {
      if (outlet) outlet.innerHTML = `<p class="muted">Error loading page: ${err.message}</p>`;
    }
  }

  function onLinkClick(e){
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // allow external links, anchors and mailto
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    e.preventDefault();
    navigate(href);
  }

  function navigate(path){ loadPage(path); }

  window.addEventListener('popstate', (e) => {
    // When the user navigates with back/forward, load the current pathname
    const raw = (e.state && e.state.path) || location.pathname + location.search + location.hash;
    // Convert the absolute pathname back to a relative path under BASE
    let rel = raw.replace(new RegExp('^' + BASE), '');
    if (rel.startsWith('/')) rel = rel.replace(/^\//, '');
    if (!rel) rel = 'index.html';
    loadPage(rel, false);
  });

  document.addEventListener('click', onLinkClick);

  return { navigate, loadPage, routes, BASE };
}
