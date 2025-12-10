// Firebase initialization for Look-Quick (replace if you rotate keys)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_VA8bC2NEJyQJSUCgo1twN0fwlFgkpxc",
  authDomain: "look-quick-c14b3.firebaseapp.com",
  projectId: "look-quick-c14b3",
  storageBucket: "look-quick-c14b3.firebasestorage.app",
  messagingSenderId: "28183899364",
  appId: "1:28183899364:web:34638d05993606c36cd0f1",
  measurementId: "G-5094LPJ2F0",
  databaseURL: "https://look-quick-c14b3-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Keep production secrets out of public repos — use environment variables in CI.