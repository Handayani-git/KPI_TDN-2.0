// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- Tambahkan import ini
import { getFirestore } from "firebase/firestore"; // <-- Tambahkan import ini
// Hapus import getAnalytics jika tidak digunakan
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "", // Sebaiknya ganti dengan kunci asli Anda
  authDomain: "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Hapus atau beri komentar jika tidak digunakan

// Ekspor service yang akan kita gunakan
export const auth = getAuth(app);
export const db = getFirestore(app);
