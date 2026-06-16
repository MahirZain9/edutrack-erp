import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlRqQ84f-IkkrEZqipUr43YRVj9IZ6KzY",
  authDomain: "edutrack-d4c4d.firebaseapp.com",
  projectId: "edutrack-d4c4d",
  storageBucket: "edutrack-d4c4d.firebasestorage.app",
  messagingSenderId: "1080893982796",
  appId: "1:1080893982796:web:c3db8f15383aef6f438ce9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const isFirebaseConfigured = true;

export { db, auth };