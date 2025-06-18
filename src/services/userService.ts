import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createOrGetUser(user: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  age?: number;
}) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    let firstName = '';
    let lastName = '';
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      avatarUrl: user.photoURL || '',
      age: user.age || null,
      createdAt: serverTimestamp(),
    });
    return {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      avatarUrl: user.photoURL || '',
      age: user.age || null,
    };
  } else {
    return userSnap.data();
  }
}

export async function getUserById(uid: string) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

export async function updateUser(
  uid: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    avatarUrl: string;
    age: number;
  }>
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}

export async function getAllAuthors() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => doc.data());
}
