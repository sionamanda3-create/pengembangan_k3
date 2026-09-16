/* ============================================================
   AUTH.JS — Media K3 Pemesinan (PASTI SIMPAN KE FIRESTORE)
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
   REGISTER USER — SIMPAN KE AUTH + FIRESTORE
   ============================================================ */
export async function registerUser({ email, password, nama, role, kelas, nip, nis, mapel, kelasAmpu }) {
  try {
    // STEP 1: Buat user di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // STEP 2: Siapkan data user
    const userData = {
      uid: uid,
      email: email,
      nama: nama,
      role: role,
      status: "aktif",
      createdAt: serverTimestamp()
    };

    if (role === "siswa") {
      userData.kelas = kelas;
      userData.nis = nis;
    } else if (role === "guru") {
      userData.nip = nip;
      userData.mapel = mapel || "K3 Teknik Pemesinan";
      userData.kelasAmpu = kelasAmpu || [];
    }

    // STEP 3: Simpan ke Firestore — WAJIB BERHASIL
    try {
      await setDoc(doc(db, "users", uid), userData);
      console.log("✅ Data tersimpan di Firestore:", userData);
    } catch (firestoreError) {
      console.error("❌ Gagal simpan ke Firestore:", firestoreError);
      // Tetap return error karena data utama harus tersimpan
      return {
        ok: false,
        msg: "Gagal simpan ke database: " + firestoreError.message
      };
    }

    return { ok: true, user: userData };

  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    return { ok: false, msg: translateError(error.code) };
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
      return { ok: false, msg: "Data user tidak ditemukan di database" };
    }

    const userData = { uid: uid, ...userDoc.data() };
    sessionStorage.setItem("userK3", JSON.stringify(userData));
    localStorage.setItem("userK3", JSON.stringify(userData));

    return { ok: true, user: userData };
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    return { ok: false, msg: translateError(error.code) };
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
}

/* ============================================================
   AMBIL SEMUA SISWA (untuk dashboard guru)
   ============================================================ */
export async function getAllSiswa() {
  try {
    const q = query(collection(db, "users"), where("role", "==", "siswa"));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
    console.log("✅ Siswa ditemukan:", list.length);
    return list;
  } catch (error) {
    console.error("❌ Gagal ambil siswa:", error);
    throw error;
  }
}

/* ============================================================
   TRANSLATE ERROR
   ============================================================ */
function translateError(code) {
  const errors = {
    "auth/email-already-in-use": "Email sudah terdaftar",
    "auth/invalid-email": "Format email tidak valid",
    "auth/weak-password": "Password minimal 6 karakter",
    "auth/user-not-found": "Email atau password salah",
    "auth/wrong-password": "Email atau password salah",
    "auth/invalid-credential": "Email atau password salah",
    "auth/too-many-requests": "Terlalu banyak percobaan",
    "auth/network-request-failed": "Gagal terhubung ke server",
    "auth/unauthorized-domain": "Domain belum diotorisasi",
    "auth/operation-not-allowed": "Metode login belum aktif",
    "permission-denied": "Izin Firestore ditolak"
  };
  return errors[code] || ("Error: " + code);
}
