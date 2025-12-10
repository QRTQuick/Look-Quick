import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Small in-app banner utility for auth errors. Injects CSS once and shows a dismissible banner.
function ensureAuthBannerStyles(){
  if (document.getElementById('auth-banner-style')) return;
  const css = `
  .auth-banner{position:fixed;left:12px;right:12px;top:12px;z-index:9999;padding:12px 16px;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,.12);display:flex;align-items:center;gap:12px;font-weight:600}
  .auth-banner.error{background:#ffece8;color:#7a0200;border:1px solid #ffb4aa}
  .auth-banner.info{background:#eef6ff;color:#08306b;border:1px solid #bcdffb}
  .auth-banner .close{margin-left:auto;cursor:pointer;padding:4px 8px;border-radius:4px;background:rgba(0,0,0,0.06)}
  `;
  const s = document.createElement('style'); s.id = 'auth-banner-style'; s.textContent = css; document.head.appendChild(s);
}

function showAuthError(message, { type = 'error', timeout = 8000 } = {}){
  try {
    ensureAuthBannerStyles();
    let banner = document.getElementById('auth-banner');
    if (!banner){
      banner = document.createElement('div'); banner.id = 'auth-banner'; banner.className = `auth-banner ${type}`;
      const text = document.createElement('div'); text.className = 'text'; banner.appendChild(text);
      const close = document.createElement('div'); close.className = 'close'; close.textContent = '✕'; close.title = 'Dismiss';
      close.addEventListener('click', ()=>{ banner.remove(); });
      banner.appendChild(close);
      document.body.appendChild(banner);
    }
    banner.querySelector('.text').textContent = message;
    banner.className = `auth-banner ${type}`;
    if (timeout && timeout > 0){
      clearTimeout(banner._dismissTimer);
      banner._dismissTimer = setTimeout(()=>{ banner.remove(); }, timeout);
    }
    return banner;
  } catch (e){ console.error('Failed to show auth banner', e); }
}

// Make available globally so other modules can show auth issues
window.showAuthError = showAuthError;

// Auth module (cleaned up). Exposes page init functions and listener helper.
export function initLogin(){
  const loginForm = document.getElementById('loginForm');
  const googleBtn = document.getElementById('googleBtn');

  if (loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(loginForm);
      const email = fd.get('email');
      const password = fd.get('password');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigateTo('feed.html');
      } catch (err){
        console.error('Email sign-in error', err);
        showAuthError(err.message || 'Sign-in failed');
      }
    });
  }

  // If email & password provided as URL query params, auto-fill and attempt sign-in
  try {
    const params = new URLSearchParams(location.search);
    const preEmail = params.get('email');
    const prePassword = params.get('password');
    if (preEmail && prePassword && loginForm){
      const emailInput = loginForm.querySelector('input[name="email"]');
      const passInput = loginForm.querySelector('input[name="password"]');
      if (emailInput) emailInput.value = preEmail;
      if (passInput) passInput.value = prePassword;
      // attempt sign-in automatically using an async IIFE
      (async ()=>{
        try {
          await signInWithEmailAndPassword(auth, preEmail, prePassword);
          navigateTo('feed.html');
        } catch (err){
          console.error('Auto sign-in failed', err);
          showAuthError('Auto sign-in failed: ' + (err.message || err.code || 'Unknown'));
        }
      })();
    }
  } catch (e){ console.error('Error parsing login URL params', e); }

  if (googleBtn){
    googleBtn.addEventListener('click', async (e)=>{
      e.preventDefault();
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await setDoc(doc(db, 'users', user.uid), {
          username: user.email ? user.email.split('@')[0] : user.uid,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          bio: '',
          createdAt: serverTimestamp()
        }, { merge: true });
        navigateTo('feed.html');
      } catch (err){
        console.error('Google sign-in error', err);
        showAuthError('Google sign-in failed: ' + (err.message || err.code || 'Unknown'));
      }
    });
  }
}

export function initRegister(){
  const registerForm = document.getElementById('registerForm');
  const googleRegisterBtn = document.getElementById('googleRegisterBtn');

  if (registerForm){
    registerForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(registerForm);
      const displayName = fd.get('displayName');
      const username = fd.get('username');
      const email = fd.get('email');
      const password = fd.get('password');
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          username,
          displayName,
          bio: '',
          photoURL: '',
          createdAt: serverTimestamp(),
          followersCount: 0,
          followingCount: 0
        });
        navigateTo('feed.html');
      } catch (err){
        console.error('Register error', err);
        showAuthError(err.message || 'Registration failed');
      }
    });
  }

  if (googleRegisterBtn){
    googleRegisterBtn.addEventListener('click', async (e)=>{
      e.preventDefault();
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await setDoc(doc(db, 'users', user.uid), {
          username: user.email ? user.email.split('@')[0] : user.uid,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          bio: '',
          createdAt: serverTimestamp()
        }, { merge: true });
        navigateTo('feed.html');
      } catch (err){
        console.error('Google register error', err);
        showAuthError('Google sign-up failed: ' + (err.message || err.code || 'Unknown'));
      }
    });
  }
}

export function initAuthListener(cb){
  onAuthStateChanged(auth, (user)=>{ if (typeof cb === 'function') cb(user); });
}

export async function doSignOut(){
  try { await signOut(auth); } catch(err){ console.error('Sign out error', err); }
}

function navigateTo(path){
  if (window.router && typeof window.router.navigate === 'function') {
    window.router.navigate(path);
    return;
  }
  // If router not available, try to respect a BASE if one exists
  try {
    const base = (window.router && window.router.BASE) ? window.router.BASE : '/';
    // avoid double-prefix if path already contains base
    const final = (path && path.startsWith(base)) ? path : (base + path).replace(/\/+/g, '/');
    window.location.href = final;
  } catch (e) {
    window.location = path;
  }
}

