import { collection, addDoc, Timestamp, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types/article';

export async function addArticle(article: Omit<Article, 'createdAt'>) {
  return await addDoc(collection(db, 'articles'), {
    ...article,
    createdAt: Timestamp.now(),
  });
}

export async function getArticles(category?: string, sortOrder: 'Ascending' | 'Descending' = 'Descending') {
  try {
    console.log('[getArticles] category:', category, 'sortOrder:', sortOrder);
    let q;
    
    const orderDirection = sortOrder === 'Ascending' ? 'asc' : 'desc';
    
    if (category && category !== 'All Categories') {
      console.log('[getArticles] Filtering by category:', category);
      q = query(
        collection(db, 'articles'), 
        where('category', '==', category), 
        orderBy('createdAt', orderDirection)
      );
    } else {
      q = query(collection(db, 'articles'), orderBy('createdAt', orderDirection));
    }
    
    const querySnapshot = await getDocs(q);
    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('[getArticles] Fetched articles:', articles);
    return articles;
  } catch (error) {
    console.error('[getArticles] Error fetching articles:', error);
    throw error;
  }
}

export async function updateArticle(id: string, article: Partial<Article>) {
  const articleRef = doc(db, 'articles', id);
  return await updateDoc(articleRef, article);
}

export async function deleteArticle(id: string) {
  const articleRef = doc(db, 'articles', id);
  return await deleteDoc(articleRef);
} 