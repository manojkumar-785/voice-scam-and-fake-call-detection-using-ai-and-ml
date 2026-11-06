// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0pPwNfK6K7SPrQHqw8rp7nMaFWG2L54s",
  authDomain: "voice-scam-detection.firebaseapp.com",
  projectId: "voice-scam-detection",
  storageBucket: "voice-scam-detection.firebasestorage.app",
  messagingSenderId: "793749989475",
  appId: "1:793749989475:web:9b99a78239cc24a216b056",
  measurementId: "G-8B4PERQ4MK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);