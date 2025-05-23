export interface FirestoreUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  age?: number;
  createdAt?: any; // You can use Firebase Timestamp type if you want
} 