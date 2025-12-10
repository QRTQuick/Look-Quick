import { db, auth } from './firebase.js';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

export function initProfile(container){
  const displayNameEl = container ? container.querySelector('#displayName') : document.getElementById('displayName');
  const bioEl = container ? container.querySelector('#bio') : document.getElementById('bio');
  const userPostsEl = container ? container.querySelector('#userPosts') : document.getElementById('userPosts');

  async function loadProfile(){
    if (!auth.currentUser) return navigateTo('/login.html');
    const udoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (udoc.exists()){
      const data = udoc.data();
      if (displayNameEl) displayNameEl.textContent = data.displayName || data.username || 'User';
      if (bioEl) bioEl.textContent = data.bio || '';
    }

    const q = query(collection(db, 'posts'), where('uid', '==', auth.currentUser.uid), orderBy('createdAt', 'desc'));
    onSnapshot(q, snap => {
      if (!userPostsEl) return;
      userPostsEl.innerHTML = '';
      if (snap.empty) userPostsEl.innerHTML = '<p class="muted">No posts yet.</p>';
      snap.forEach(d => {
        const p = d.data();
        const card = document.createElement('article');
        card.className = 'post-card';
        card.innerHTML = `<p>${escapeHtml(p.text)}</p>${p.imageUrl ? `<img src="${p.imageUrl}" class="post-image">` : ''}`;
        userPostsEl.appendChild(card);
      });
    });
  }

  onAuthStateChanged(auth, user => { if (user) loadProfile(); else navigateTo('/login.html'); });
}

function navigateTo(path){
  if (window.router && typeof window.router.navigate === 'function') window.router.navigate(path.replace(/^\//,''));
  else window.location = path;
}

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, (m)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
}
