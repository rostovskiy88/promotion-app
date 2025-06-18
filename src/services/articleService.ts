import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types/article';

export async function addArticle(article: Omit<Article, 'createdAt'>) {
  return await addDoc(collection(db, 'articles'), {
    ...article,
    createdAt: Timestamp.now(),
  });
}

export async function getArticles(
  category?: string,
  sortOrder: 'Ascending' | 'Descending' = 'Descending',
  pageSize: number = 6,
  lastDocId?: string
) {
  try {
    console.log('[getArticles] 📥 Request:', {
      category,
      sortOrder,
      pageSize,
      hasLastDocId: !!lastDocId,
    });

    let q;
    const orderDirection = sortOrder === 'Ascending' ? 'asc' : 'desc';

    // If we have a lastDocId, we need to find that document first
    let lastDoc: QueryDocumentSnapshot | undefined;
    if (lastDocId) {
      try {
        const lastDocRef = doc(db, 'articles', lastDocId);
        const lastDocSnapshot = await getDoc(lastDocRef);
        if (lastDocSnapshot.exists()) {
          lastDoc = lastDocSnapshot as QueryDocumentSnapshot;
        }
      } catch (error) {
        console.warn('Could not find last document, starting from beginning:', error);
      }
    }

    if (category && category !== 'All Categories') {
      console.log('[getArticles] Filtering by category:', category);
      if (lastDoc) {
        q = query(
          collection(db, 'articles'),
          where('category', '==', category),
          orderBy('createdAt', orderDirection),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, 'articles'),
          where('category', '==', category),
          orderBy('createdAt', orderDirection),
          limit(pageSize)
        );
      }
    } else {
      if (lastDoc) {
        q = query(
          collection(db, 'articles'),
          orderBy('createdAt', orderDirection),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        q = query(collection(db, 'articles'), orderBy('createdAt', orderDirection), limit(pageSize));
      }
    }

    const querySnapshot = await getDocs(q);
    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const result = {
      articles,
      lastDocId: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1].id : null,
      hasMore: querySnapshot.docs.length === pageSize,
    };

    console.log('[getArticles] 📤 Response:', {
      articlesCount: articles.length,
      hasMore: result.hasMore,
      hasLastDocId: !!result.lastDocId,
      requestedPageSize: pageSize,
    });

    return result;
  } catch (error) {
    console.error('[getArticles] Error fetching articles:', error);
    throw error;
  }
}

export async function getAllArticles(category?: string, sortOrder: 'Ascending' | 'Descending' = 'Descending') {
  try {
    console.log('[getAllArticles] category:', category, 'sortOrder:', sortOrder);
    let q;

    const orderDirection = sortOrder === 'Ascending' ? 'asc' : 'desc';

    if (category && category !== 'All Categories') {
      console.log('[getAllArticles] Filtering by category:', category);
      q = query(collection(db, 'articles'), where('category', '==', category), orderBy('createdAt', orderDirection));
    } else {
      q = query(collection(db, 'articles'), orderBy('createdAt', orderDirection));
    }

    const querySnapshot = await getDocs(q);
    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('[getAllArticles] Fetched articles:', articles);
    return articles;
  } catch (error) {
    console.error('[getAllArticles] Error fetching articles:', error);
    throw error;
  }
}

export async function searchArticles(
  searchTerm: string,
  category?: string,
  sortOrder: 'Ascending' | 'Descending' = 'Descending'
) {
  try {
    console.log('[searchArticles] searchTerm:', searchTerm, 'category:', category, 'sortOrder:', sortOrder);

    if (!searchTerm.trim()) {
      // If no search term, return regular articles
      return getAllArticles(category, sortOrder);
    }

    const orderDirection = sortOrder === 'Ascending' ? 'asc' : 'desc';

    // Get all articles first (Firestore doesn't support full-text search natively)
    let q;
    if (category && category !== 'All Categories') {
      q = query(collection(db, 'articles'), where('category', '==', category), orderBy('createdAt', orderDirection));
    } else {
      q = query(collection(db, 'articles'), orderBy('createdAt', orderDirection));
    }

    const querySnapshot = await getDocs(q);
    const articles = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter articles client-side for better search functionality
    const searchTermLower = searchTerm.toLowerCase();
    const filteredArticles = articles.filter((article: any) => {
      const titleMatch = article.title?.toLowerCase().includes(searchTermLower);
      const authorMatch = article.authorName?.toLowerCase().includes(searchTermLower);
      const contentMatch = article.content?.toLowerCase().includes(searchTermLower);

      return titleMatch || authorMatch || contentMatch;
    });

    console.log('[searchArticles] Found articles:', filteredArticles);
    return filteredArticles;
  } catch (error) {
    console.error('[searchArticles] Error searching articles:', error);
    throw error;
  }
}

export async function updateArticle(id: string, article: Partial<Article>) {
  const articleRef = doc(db, 'articles', id);
  return await updateDoc(articleRef, article);
}

export const deleteArticle = async (id: string) => {
  await deleteDoc(doc(db, 'articles', id));
};

export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    const docRef = doc(db, 'articles', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Article;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};
