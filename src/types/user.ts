import { FirebaseTimestamp } from './firebase';

export interface FirestoreUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  age?: number;
  createdAt?: FirebaseTimestamp; // Properly typed Firebase Timestamp
} 