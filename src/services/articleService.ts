import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types/article';

export async function addArticle(article: Omit<Article, 'createdAt'>) {
  return await addDoc(collection(db, 'articles'), {
    ...article,
    createdAt: Timestamp.now(),
  });
} 