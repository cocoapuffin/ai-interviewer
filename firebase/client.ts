import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgnVKMs_B0yoKrxYEyLnkqQiJ61mOLsk8",
  authDomain: "vapi-ai-interviewer.firebaseapp.com",
  projectId: "vapi-ai-interviewer",
  storageBucket: "vapi-ai-interviewer.firebasestorage.app",
  messagingSenderId: "403849489181",
  appId: "1:403849489181:web:301d4956f0dbc2bb6dcff4",
  measurementId: "G-VJ1D2X8NYL"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Auto sign in anonymously if no user
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((err) => console.error("Anonymous sign-in error:", err));
  }
});

export { auth, db };
// // Initialize Firebase
// const app = !getApps.length ? initializeApp(firebaseConfig) : getApp() ;

// export const auth = getAuth(app);
// export const db = getFirestore(app);