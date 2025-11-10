// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4b4ntioea7DW2cmtuIl1spCpgQc2O1N0",
  authDomain: "projetoscrum-c994e.firebaseapp.com",
  projectId: "projetoscrum-c994e",
  storageBucket: "projetoscrum-c994e.firebasestorage.app",
  messagingSenderId: "1057296800501",
  appId: "1:1057296800501:web:c37193ef0ec41c91a043bc",
  measurementId: "G-RRSG0ZBEGX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
