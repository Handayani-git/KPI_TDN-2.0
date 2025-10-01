// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- Tambahkan import ini
import { getFirestore } from "firebase/firestore"; // <-- Tambahkan import ini
// Hapus import getAnalytics jika tidak digunakan
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnjKYSHGYpNA1nyTJCfm-HCVFsBeV5mIU", // Sebaiknya ganti dengan kunci asli Anda
  authDomain: "kpi-429cf.firebaseapp.com",
  projectId: "kpi-429cf",
  storageBucket: "kpi-429cf.appspot.com", // Perbaiki .firebasestorage menjadi .appspot
  messagingSenderId: "252385462360",
  appId: "1:252385462360:web:b7d6810b0b1df8ad8b222d",
  measurementId: "G-G4P6K7NSNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Hapus atau beri komentar jika tidak digunakan

// Ekspor service yang akan kita gunakan
export const auth = getAuth(app);
export const db = getFirestore(app);