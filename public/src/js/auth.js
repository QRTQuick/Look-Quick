import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

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
        alert(err.message);
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
        alert('Google sign-in failed: ' + err.message);
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
        alert(err.message);
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
        alert('Google sign-up failed: ' + err.message);
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
  if (window.router && typeof window.router.navigate === 'function') window.router.navigate(path);
  else window.location = path;
}

