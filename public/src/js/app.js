import createRouter from './router.js';
import { initAuthListener, initLogin, initRegister, doSignOut } from './auth.js';
import { initFeed } from './feed.js';
import { initCreatePost } from './createPost.js';
import { initProfile } from './profile.js';
import { initLanding } from './landing.js';

// Map static page filenames to init functions
const routes = {
  'index.html': (outlet) => initLanding(outlet),
  '': (outlet) => initLanding(outlet),
  'landing.html': (outlet) => initLanding(outlet),
  'feed.html': (outlet) => initFeed(outlet),
  'login.html': (outlet) => initLogin(outlet),
  'register.html': (outlet) => initRegister(outlet),
  'settings.html': (outlet) => {
    // lazy init settings module
    import('./settings.js').then(m => m.initSettings(outlet)).catch(() => {});
  },
  'create-post.html': (outlet) => initCreatePost(outlet),
  'profile.html': (outlet) => initProfile(outlet)
};

const router = createRouter(routes);
window.router = router;

// Wire auth state to header UI
function updateHeader(user){
  const nav = document.querySelector('header .topbar nav');
  if (!nav) return;
  nav.innerHTML = '';
  if (user) {
    const aProfile = document.createElement('a'); aProfile.href = 'profile.html'; aProfile.textContent = 'Profile';
    const aCreate = document.createElement('a'); aCreate.href = 'create-post.html'; aCreate.textContent = 'Create';
    const aSignOut = document.createElement('a'); aSignOut.href = '#'; aSignOut.textContent = 'Sign out';
    aSignOut.addEventListener('click', async (e) => { e.preventDefault(); await doSignOut(); router.navigate('login.html'); });
    nav.appendChild(aCreate);
    nav.appendChild(aProfile);
    nav.appendChild(aSignOut);
  } else {
    const aLogin = document.createElement('a'); aLogin.href = 'login.html'; aLogin.textContent = 'Login';
    const aRegister = document.createElement('a'); aRegister.href = 'register.html'; aRegister.textContent = 'Register';
    nav.appendChild(aLogin);
    nav.appendChild(aRegister);
  }
}

// Start auth listener and router
initAuthListener(updateHeader);

// Load initial page (use pathname if direct link)
const initialPath = (location.pathname.replace(/^\//,'') || 'index.html');
router.loadPage(initialPath, false);

export default { router };
