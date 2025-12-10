import { auth, db, storage } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

export function initCreatePost(container){
  const form = container ? container.querySelector('#postForm') : document.getElementById('postForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return navigateTo('/login.html');
    const fd = new FormData(form);
    const text = fd.get('text');
    const image = fd.get('image');
    let imageUrl = '';
    try {
      if (image && image.size) {
        const storageRef = ref(storage, `postImages/${Date.now()}_${image.name}`);
        const blob = await image.arrayBuffer();
        await uploadBytes(storageRef, new Uint8Array(blob));
        imageUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'posts'), {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || '',
        text: text || '',
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        likeCount: 0,
        commentCount: 0
      });
      alert('Post created');
      navigateTo('/index.html');
    } catch (err) {
      alert(err.message);
    }
  });
}

function navigateTo(path){
  if (window.router && typeof window.router.navigate === 'function') window.router.navigate(path.replace(/^\//,''));
  else window.location = path;
}
