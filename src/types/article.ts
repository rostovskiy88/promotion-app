export interface Article {
  id?: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: any; // Firebase Timestamp
  imageUrl?: string;
  readMoreUrl?: string;
  // add other fields as needed
} 