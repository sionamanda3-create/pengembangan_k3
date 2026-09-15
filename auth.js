/* ============================================================
   AUTH.JS — Media K3 Pemesinan
   ============================================================ */

import {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  doc, setDoc, getDoc, getDocs,
  collection, query, where,
  serverTimestamp
} from "./firebase-config.js";

/* ============================================================
   REGISTER — DENGAN DEBUG ALERT
   ============================================================ */
export async function registerUser({ email, password, nama, role, kelas, nip, nis, mapel, kelasAmpu }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userData = {
      uid, email, nama, role,
      createdAt: serverTimestamp(),
      status: "aktif"
    };

    if (role === "siswa") {
      userData.kelas = kelas;
      userData.nis = nis;
    } else if (role === "guru") {
      userData.nip = nip;
      userData.mapel = mapel || "K3 Teknik Pemesinan";
      userData.kelasAmpu = kelasAmpu || [];
    }

    await setDoc(doc(db, "users", uid), userData);

    alert("✅ BERHASIL DAFTAR!\n\nEmail: " + email + "\nRole: " + role + "\n\nSilakan login.");
    return { ok: true, user: userData };

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    alert("❌ ERROR DAFTAR\n\nCode: " + error.code + "\n\nMessage: " + error.message);
    return { ok: false, msg: "Error: " + error.code };
  }
}

/* ============================================================
   LOGIN — DENGAN DEBUG ALERT
   ============================================================ */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      alert("❌ Data user tidak ada di database");
      return { ok: false, msg: "Data user tidak ada" };
    }

    const userData = { uid, ...userDoc.data() };
    sessionStorage.setItem("userK3", JSON.stringify(userData));
    localStorage.setItem("userK3", JSON.stringify(userData));

    return { ok: true, user: userData };
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("❌ ERROR LOGIN\n\nCode: " + error.code + "\n\nMessage: " + error.message);
    return { ok: false, msg: "Error: " + error.code };
  }
}

/* ============================================================
   LOGOUT
   ============================================================ */
export async function logoutUser() {
  try {
    await signOut(auth);
    sessionStorage.removeItem("userK3");
    localStorage.removeItem("userK3");
    window.location.href = "index.html";
  } catch (error) { console.error(error); }
}

/* ============================================================
   GET CURRENT USER
   ============================================================ */
export function getCurrentUser() {
  const s = sessionStorage.getItem("userK3") || localStorage.getItem("userK3");
  return s ? JSON.parse(s) : null;
}/* ============================================================
   AUTH.JS — DENGAN DEBUG ALERT
   ============================================================ */

import {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc, setDoc, getDoc, getDocs,
  collection, query, where,
  serverTimestamp
} from "./firebase-config.js";

export async function registerUser({
  email, password, nama, role,
  kelas, nip, nis, mapel, kelasAmpu
}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userData = {
      uid, email, nama, role,
      createdAt: serverTimestamp(),
      status: "aktif"
    };

    if (role === "siswa") {
      userData.kelas = kelas;
      userData.nis = nis;
    } else if (role === "guru") {
      userData.nip = nip;
      userData.mapel = mapel || "K3 Teknik Pemesinan";
      userData.kelasAmpu = kelasAmpu || [];
    }

    await setDoc(doc(db, "users", uid), userData);

    alert("✅ BERHASIL DAFTAR!\n\nUID: " + uid + "\nEmail: " + email);
    return { ok: true, user: userData };

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    alert("❌ ERROR DAFTAR:\n\nCODE: " + error.code + "\n\nMESSAGE: " + error.message);
    return { ok: false, msg: "Error: " + error.code };
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      alert("❌ Data user tidak ditemukan di Firestore");
      return { ok: false, msg: "Data user tidak ditemukan" };
    }

    const userData = { uid, ...userDoc.data() };
    sessionStorage.setItem("userK3", JSON.stringify(userData));
    localStorage.setItem("userK3", JSON.stringify(userData));

    return { ok: true, user: userData };
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("❌ ERROR LOGIN:\n\nCODE: " + error.code + "\n\nMESSAGE: " + error.message);
    return { ok: false, msg: "Error: " + error.code };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    sessionStorage.removeItem("userK3");
    localStorage.removeItem("userK3");
    window.location.href = "index.html";
  } catch (error) { console.error(error); }
}

export function getCurrentUser() {
  const s = sessionStorage.getItem("userK3") || localStorage.getItem("userK3");
  return s ? JSON.parse(s) : null;
}

export function requireLogin(expectedRole = null) {
  const user = getCurrentUser();
  if (!user) { window.location.href = "index.html"; return null; }
  if (expectedRole && user.role !== expectedRole) {
    alert("Akses ditolak");
    window.location.href = "index.html";
    return null;
  }
  return user;
}

export async function getUserData(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function getAllSiswa() {
  const q = query(collection(db, "users"), where("role", "==", "siswa"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function getSiswaByKelas(kelas) {
  const q = query(
    collection(db, "users"),
    where("role", "==", "siswa"),
    where("kelas", "==", kelas)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function updateUserData(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
    return { ok: true };
  } catch (error) {
    return { ok: false, msg: error.code };
  }
}/* ============================================================
   AUTH.JS — DENGAN DEBUG ALERT
   ============================================================ */

import {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc, setDoc, getDoc, getDocs,
  collection, query, where,
  serverTimestamp
} from "./firebase-config.js";

/* ============================================================
   REGISTER USER — DENGAN DEBUG
   ============================================================ */
export async function registerUser({
  email, password, nama, role,
  kelas, nip, nis, mapel, kelasAmpu
}) {
  try {
    // STEP 1: Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // STEP 2: Data user
    const userData = {
      uid, email, nama, role,
      createdAt: serverTimestamp(),
      status: "aktif"
    };

    if (role === "siswa") {
      userData.kelas = kelas;
      userData.nis = nis;
    } else if (role === "guru") {
      userData.nip = nip;
      userData.mapel = mapel || "K3 Teknik Pemesinan";
      userData.kelasAmpu = kelasAmpu || [];
    }

    // STEP 3: Firestore
    await setDoc(doc(db, "users", uid), userData);

    // ✅ SUKSES
    alert("✅ BERHASIL!\n\nUID: " + uid + "\nEmail: " + email);
    return { ok: true, user: userData };

  } catch (error) {
    // ❌ DEBUG — Tampilkan error asli
    console.error("REGISTER ERROR:", error);
    alert("❌ ERROR:\n\nCODE: " + error.code + "\n\nMESSAGE: " + error.message);
    return { ok: false, msg: "Error: " + error.code };
  }
}

/* ============================================================
   LOGIN USER
   ============================================================ */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      alert("❌ Data user tidak ditemukan di Firestore");
      return { ok: false, msg: "Data user tidak ditemukan" };
    }

    const userData = { uid, ...userDoc.data() };
    sessionStorage.setItem("userK3", JSON.stringify(userData));
    localStorage.setItem("userK3", JSON.stringify(userData));

    return { ok: true, user: userData };
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("❌ LOGIN ERROR:\n\nCODE: " + error.code + "\n\nMESSAGE: " + error.message);
    return { ok: false, msg: "Error: " + error.code };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    sessionStorage.removeItem("userK3");
    localStorage.removeItem("userK3");
    window.location.href = "index.html";
  } catch (error) { console.error(error); }
}

export function getCurrentUser() {
  const s = sessionStorage.getItem("userK3") || localStorage.getItem("userK3");
  return s ? JSON.parse(s) : null;
}

export function requireLogin(expectedRole = null) {
  const user = getCurrentUser();
  if (!user) { window.location.href = "index.html"; return null; }
  if (expectedRole && user.role !== expectedRole) {
    alert("Akses ditolak");
    window.location.href = "index.html";
    return null;
  }
  return user;
}

export async function getUserData(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function getAllSiswa() {
  const q = query(collection(db, "users"), where("role", "==", "siswa"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function getSiswaByKelas(kelas) {
  const q = query(
    collection(db, "users"),
    where("role", "==", "siswa"),
    where("kelas", "==", kelas)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function updateUserData(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
    return { ok: true };
  } catch (error) {
    return { ok: false, msg: error.code };
  }
}
