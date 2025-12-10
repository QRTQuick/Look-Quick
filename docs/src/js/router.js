// Minimal client-side router that fetches HTML pages and injects their <main> content
export default function createRouter(routes){
  const outlet = document.querySelector('main.container');

  async function loadPage(path, addToHistory = true){
    try {
      const url = path || 'index.html';
      // normalize to remove leading slashes and directories when looking up routes
      const fetchUrl = url;
      const res = await fetch(fetchUrl, { cache: 'no-store' });
      if (!res.ok) {
        outlet.innerHTML = `<p class="muted">Failed to load ${url}: ${res.status}</p>`;
        return;
      }
      const text = await res.text();
      // Extract <title> and <main> content if present
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newMain = doc.querySelector('main');
      const newTitle = doc.querySelector('title');
      if (newMain) outlet.replaceWith(newMain); // replace the main element
      if (newTitle) document.title = newTitle.textContent;
      // Re-wire outlet reference
      const currentOutlet = document.querySelector('main');
      // Call route init if provided — use basename to match routes regardless of directory
      const routeKey = (url.split('?')[0].split('/').pop()) || 'index.html';
      const init = routes && routes[routeKey];
      if (typeof init === 'function') init(currentOutlet);
      if (addToHistory) history.pushState({ path: url }, '', url);
    } catch (err) {
      outlet.innerHTML = `<p class="muted">Error loading page: ${err.message}</p>`;
    }
  }

  function onLinkClick(e){
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // external links or anchors should work normally
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    e.preventDefault();
    navigate(href);
  }

  function navigate(path){ loadPage(path); }

  window.addEventListener('popstate', (e) => {
    const path = (e.state && e.state.path) || location.pathname.replace(/^\//,'') || 'index.html';
    loadPage(path, false);
  });

  document.addEventListener('click', onLinkClick);

  return { navigate, loadPage, routes };
}
