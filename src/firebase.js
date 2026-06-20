import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlRqQ84F-IkkrEZqipUr43YRVj9IZ5KzY",
  authDomain: "edutrack-d4c4d.firebaseapp.com",
  projectId: "edutrack-d4c4d",
  storageBucket: "edutrack-d4c4d.firebasestorage.app",
  messagingSenderId: "1080893982796",
  appId: "1:1080893982796:web:c3db8f15383eef6f438ce9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const isFirebaseConfigured = true;

// ✅ Creates a new Firebase Auth user (e.g. a new Teacher) WITHOUT
// logging out the currently signed-in Admin. Uses a temporary,
// isolated Firebase app instance that gets destroyed right after.
export const createUserWithoutSignIn = async (email, password) => {
  const tempAppName = 'TempUserCreation_' + Date.now();
  const tempApp = initializeApp(firebaseConfig, tempAppName);
  const tempAuth = getAuth(tempApp);

  try {
    const credential = await createUserWithEmailAndPassword(tempAuth, email, password);
    const newUid = credential.user.uid;
    return newUid;
  } finally {
    // Always clean up the temp app, even if creation fails
    await deleteApp(tempApp);
  }
};
