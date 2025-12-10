import { auth, db, storage } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const form = document.getElementById('postForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return window.location = '/login.html';
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
      window.location = '/';
    } catch (err) {
      alert(err.message);
    }
  });
}
