import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Simple auth handlers for login/register
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const googleBtn = document.getElementById('googleBtn');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
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
      window.location = '/';
    } catch (err) {
      alert(err.message);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(loginForm);
    const email = fd.get('email');
    const password = fd.get('password');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location = '/';
    } catch (err) {
      alert(err.message);
    }
  });
}

if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // ensure user doc exists
      await setDoc(doc(db, 'users', user.uid), {
        username: user.email.split('@')[0],
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        bio: '',
        createdAt: serverTimestamp()
      }, { merge: true });
      window.location = '/';
    } catch (err) {
      alert(err.message);
    }
  });
}

// Auth listener helper
onAuthStateChanged(auth, (user) => {
  // If pages require auth, redirect when not authenticated
  // Example: if a page has data-protect attribute, redirect to login
  const protectedRoot = document.querySelector('[data-protect]');
  if (protectedRoot && !user) window.location = '/login.html';
});

export { auth };