import { Timestamp } from 'firebase/firestore';

export interface Article {
  id?: string;
  title: string;
  content?: string;
  category?: string;
  authorName: string;
  authorId: string;
  createdAt: Timestamp | string; // Allow both Firebase Timestamp and ISO string
  imageUrl?: string | File[];
  authorAvatar: string;
  readMoreUrl?: string;
  // add other fields as needed
} 