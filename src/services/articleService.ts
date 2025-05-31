import { collection, addDoc, Timestamp, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types/article';

export async function addArticle(article: Omit<Article, 'createdAt'>) {
  return await addDoc(collection(db, 'articles'), {
    ...article,
    createdAt: Timestamp.now(),
  });
}

export async function getArticles(category?: string) {
  let q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
  
  if (category && category !== 'All Categories') {
    q = query(q, where('category', '==', category));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function updateArticle(id: string, article: Partial<Article>) {
  const articleRef = doc(db, 'articles', id);
  return await updateDoc(articleRef, article);
}

export async function deleteArticle(id: string) {
  const articleRef = doc(db, 'articles', id);
  return await deleteDoc(articleRef);
} 