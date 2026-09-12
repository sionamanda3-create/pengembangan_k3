/* ============================================================
   AUTH.JS — Helper Authentication & User Management
   Media K3 Pemesinan — SMK Negeri 2 Medan
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
   1. REGISTER USER BARU (GURU / SISWA)
   ============================================================ */
export async function registerUser({
  email, password, nama, role,
  kelas, nip, nis, mapel, kelasAmpu
}) {
  try {
    // Buat user di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Data dasar
    const userData = {
      uid,
      email,
      nama,
      role,                       // "guru" atau "siswa"
      createdAt: serverTimestamp(),
      status: "aktif"
    };

    // Data tambahan per role
    if (role === "siswa") {
      userData.kelas = kelas;     // "TP 1", "TP 2", "TP 3"
      userData.nis = nis;
    } else if (role === "guru") {
      userData.nip = nip;
      userData.mapel = mapel || "K3 Teknik Pemesinan";
      userData.kelasAmpu = kelasAmpu || [];
    }

    // Simpan ke Firestore
    await setDoc(doc(db, "users", uid), userData);

    return { ok: true, user: userData };
  } catch (error) {
    return { ok: false, msg: translateError(error.code) };
  }
}

/* ============================================================
   2. LOGIN USER
   ============================================================ */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Ambil data user dari Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      return { ok: false, msg: "Data user tidak ditemukan" };
    }

    const userData = { uid, ...userDoc.data() };

    // Simpan session
    sessionStorage.setItem("userK3", JSON.stringify(userData));
    localStorage.setItem("userK3", JSON.stringify(userData));

    return { ok: true, user: userData };
  } catch (error) {
    return { ok: false, msg: translateError(error.code) };
  }
}

/* ============================================================
   3. LOGOUT
   ============================================================ */
export async function logoutUser() {
  try {
    await signOut(auth);
    sessionStorage.removeItem("userK3");
    localStorage.removeItem("userK3");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

/* ============================================================
   4. GET CURRENT USER (dari session)
   ============================================================ */
export function getCurrentUser() {
  const s = sessionStorage.getItem("userK3") || localStorage.getItem("userK3");
  return s ? JSON.parse(s) : null;
}

/* ============================================================
   5. REQUIRE LOGIN — Redirect kalau belum login
   ============================================================ */
export function requireLogin(expectedRole = null) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  if (expectedRole && user.role !== expectedRole) {
    alert("Akses ditolak — role tidak sesuai");
    window.location.href = "login.html";
    return null;
  }
  return user;
}

/* ============================================================
   6. AMBIL DATA USER DARI FIRESTORE
   ============================================================ */
export async function getUserData(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

/* ============================================================
   7. AMBIL SEMUA SISWA (untuk dashboard guru)
   ============================================================ */
export async function getAllSiswa() {
  const q = query(collection(db, "users"), where("role", "==", "siswa"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

/* ============================================================
   8. AMBIL SISWA PER KELAS (TP 1 / TP 2 / TP 3)
   ============================================================ */
export async function getSiswaByKelas(kelas) {
  const q = query(
    collection(db, "users"),
    where("role", "==", "siswa"),
    where("kelas", "==", kelas)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
}

/* ============================================================
   9. UPDATE PASSWORD / DATA USER
   ============================================================ */
export async function updateUserData(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
    return { ok: true };
  } catch (error) {
    return { ok: false, msg: translateError(error.code) };
  }
}

/* ============================================================
   10. TERJEMAHKAN ERROR FIREBASE KE BAHASA INDONESIA
   ============================================================ */
function translateError(code) {
  const errors = {
    "auth/email-already-in-use": "Email sudah terdaftar",
    "auth/invalid-email": "Format email tidak valid",
    "auth/weak-password": "Password minimal 6 karakter",
    "auth/user-not-found": "Email atau password salah",
    "auth/wrong-password": "Email atau password salah",
    "auth/invalid-credential": "Email atau password salah",
    "auth/too-many-requests": "Terlalu banyak percobaan, coba lagi nanti",
    "auth/network-request-failed": "Gagal terhubung ke server",
    "auth/missing-password": "Password wajib diisi",
    "auth/missing-email": "Email wajib diisi"
  };
  return errors[code] || "Terjadi kesalahan, coba lagi";
}
