import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const feedEl = document.getElementById('feed');

if (feedEl) {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  onSnapshot(q, snapshot => {
    feedEl.innerHTML = '';
    if (snapshot.empty) {
      feedEl.innerHTML = '<p class="muted">No posts yet.</p>';
      return;
    }
    snapshot.forEach(doc => {
      const p = doc.data();
      const card = document.createElement('article');
      card.className = 'post-card';
      card.innerHTML = `
        <header><strong>${p.displayName || 'User'}</strong> <small class="muted">${new Date(p.createdAt?.toDate?.() || Date.now()).toLocaleString()}</small></header>
        <p>${escapeHtml(p.text || '')}</p>
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="post image" class="post-image">` : ''}
      `;
      feedEl.appendChild(card);
    });
  }, err => {
    feedEl.innerHTML = `<p class="muted">Error loading feed: ${err.message}</p>`;
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
}
