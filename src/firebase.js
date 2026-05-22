import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmuPHMkI2i6ptVdgRAOKELPSviB88wt9E",
  authDomain: "financas-pro-aff9b.firebaseapp.com",
  projectId: "financas-pro-aff9b",
  storageBucket: "financas-pro-aff9b.firebasestorage.app",
  messagingSenderId: "359967610480",
  appId: "1:359967610480:web:78e8c33baa99b37e4c06b5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);