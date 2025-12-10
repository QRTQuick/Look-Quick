import { db, auth } from './firebase.js';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const displayNameEl = document.getElementById('displayName');
const bioEl = document.getElementById('bio');
const userPostsEl = document.getElementById('userPosts');

async function loadProfile(){
  if (!auth.currentUser) return; // simple behavior — enhance as needed
  const udoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  if (udoc.exists()){
    const data = udoc.data();
    displayNameEl.textContent = data.displayName || data.username || 'User';
    bioEl.textContent = data.bio || '';
  }

  const q = query(collection(db, 'posts'), where('uid', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
  onSnapshot(q, snap => {
    userPostsEl.innerHTML = '';
    if (snap.empty) userPostsEl.innerHTML = '<p class="muted">No posts yet.</p>';
    snap.forEach(d => {
      const p = d.data();
      const card = document.createElement('article');
      card.className = 'post-card';
      card.innerHTML = `<p>${p.text}</p>${p.imageUrl ? `<img src="${p.imageUrl}" class="post-image">` : ''}`;
      userPostsEl.appendChild(card);
    });
  });
}

// Wait until auth ready
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
onAuthStateChanged(auth, user => { if (user) loadProfile(); else window.location = '/login.html'; });
