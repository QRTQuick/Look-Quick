export function initLanding(container){
  // landing doesn't require heavy JS for now — this placeholder allows future hooks
  // Example: track clicks or animate hero
  const hero = container ? container.querySelector('.hero') : document.querySelector('.hero');
  if (hero) {
    // simple animation hook
    hero.classList.add('loaded');
  }
}

export default { initLanding };
