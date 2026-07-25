import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

export const register = async (
  name,
  email,
  password,
  role
) => {
  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email,
    role,
    createdAt: new Date(),
  });

  return user;
};

export const login = async (email, password) => {
  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user = userCredential.user;

  const docSnap = await getDoc(
    doc(db, "users", user.uid)
  );

  if (!docSnap.exists()) {
    throw new Error("User profile not found.");
  }

  return {
    firebaseUser: user,
    profile: docSnap.data(),
  };
};

export const logout = () => signOut(auth);