import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAp5-5mqMSoj1YxHZBQJlaNh-PBLRTvnMM",
  authDomain: "vats-innovation.firebaseapp.com",
  projectId: "vats-innovation",
  storageBucket: "vats-innovation.firebasestorage.app",
  messagingSenderId: "872599940633",
  appId: "1:872599940633:web:e729f68a290eb132b34488",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;