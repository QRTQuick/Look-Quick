import { auth, db, storage } from './firebase.js';
import { doc, getDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

export function initSettings(container){
  const root = container || document;
  const form = root.getElementById('settingsForm');
  const displayInput = root.getElementById('displayNameInput');
  const bioInput = root.getElementById('bioInput');
  const photoInput = root.getElementById('profilePhoto');
  const signOutBtn = root.getElementById('signOutBtn');
  const deleteBtn = root.getElementById('deleteAccountBtn');

  async function load(){
    if (!auth.currentUser) return navigateTo('login.html');
    const udoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (udoc.exists()){
      const data = udoc.data();
      if (displayInput) displayInput.value = data.displayName || '';
      if (bioInput) bioInput.value = data.bio || '';
    }
  }

  if (form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if (!auth.currentUser) return navigateTo('login.html');
      try {
        let photoUrl = undefined;
        if (photoInput && photoInput.files && photoInput.files[0]){
          const file = photoInput.files[0];
          const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
          const buf = await file.arrayBuffer();
          await uploadBytes(storageRef, new Uint8Array(buf));
          photoUrl = await getDownloadURL(storageRef);
        }
        const updates = { displayName: displayInput.value || '', bio: bioInput.value || '', updatedAt: serverTimestamp() };
        if (photoUrl) updates.photoURL = photoUrl;
        await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
        alert('Profile updated');
      } catch (err){
        alert('Error updating profile: ' + err.message);
      }
    });
  }

  if (signOutBtn) signOutBtn.addEventListener('click', async (e)=>{ e.preventDefault(); await auth.signOut(); navigateTo('login.html'); });

  if (deleteBtn) deleteBtn.addEventListener('click', async ()=>{
    if (!auth.currentUser) return navigateTo('login.html');
    const ok = confirm('Delete your account? This cannot be undone.');
    if (!ok) return;
    try {
      // Attempt to delete. If it fails due to auth, instruct user to re-auth.
      await deleteUser(auth.currentUser);
      alert('Account deleted');
      navigateTo('landing.html');
    } catch (err){
      alert('Could not delete account: ' + err.message + '. You may need to re-authenticate first.');
    }
  });

  load();
}

function navigateTo(path){
  if (window.router && typeof window.router.navigate === 'function') window.router.navigate(path);
  else window.location = path;
}

export default { initSettings };
