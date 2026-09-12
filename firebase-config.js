/* ============================================================
   FIREBASE CONFIG — Media K3 Pemesinan
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== KONFIGURASI FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyDFLbfQRwgANDYt8CfmV2aSSUW9ng1KIoY",
  authDomain: "media-k3-pemesinan.firebaseapp.com",
  projectId: "media-k3-pemesinan",
  storageBucket: "media-k3-pemesinan.firebasestorage.app",
  messagingSenderId: "32001771733",
  appId: "1:32001771733:web:397c253906b19b42f5fa5c",
  measurementId: "G-RSMPERCH9X"
};

// ===== INISIALISASI =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== EXPORT SEMUA =====
export {
  app, auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc, setDoc, getDoc, getDocs,
  collection, query, where,
  addDoc, updateDoc, deleteDoc,
  serverTimestamp, onSnapshot, orderBy
};
