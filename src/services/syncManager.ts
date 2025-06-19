import { store } from '../store';
import {
  removeFromOfflineQueue,
  incrementRetries,
  addSyncError,
  clearSyncErrors,
  setSyncing,
} from '../store/slices/cacheSlice';
import { addArticle } from '../services/articleService';
import { updateUser } from '../services/userService';
import { OfflineQueueItem } from '../types/firebase';
import { Article } from '../types/article';

interface CreateArticleData {
  title: string;
  content: string;
  category: string;
  userId: string;
  authorName?: string;
  authorAvatar?: string;
  imageUrl?: string;
}

interface UpdateArticleData {
  id: string;
  updates: Partial<Article>;
}

interface DeleteArticleData {
  id: string;
}

interface UpdateProfileData {
  userId: string;
  updates: Record<string, unknown>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class SyncManager {
  private static instance: SyncManager;
  private isProcessing = false;

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async processOfflineQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    const state = store.getState();
    const { offlineQueue } = state.cache;

    if (offlineQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    store.dispatch(setSyncing(true));
    store.dispatch(clearSyncErrors());

    for (const item of offlineQueue) {
      try {
        await this.processQueueItem(item);
        store.dispatch(removeFromOfflineQueue(item.id));
      } catch (error) {
        console.error('Failed to sync item:', item, error);

        if (item.retries < MAX_RETRIES) {
          store.dispatch(incrementRetries(item.id));
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, item.retries)));
        } else {
          store.dispatch(addSyncError(`Failed to sync ${item.action}`));
          store.dispatch(removeFromOfflineQueue(item.id));
        }
      }
    }

    store.dispatch(setSyncing(false));
    this.isProcessing = false;
  }

  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    switch (item.action) {
      case 'CREATE_ARTICLE':
        await this.syncCreateArticle(item.data as unknown as CreateArticleData);
        break;
      case 'UPDATE_ARTICLE':
        await this.syncUpdateArticle(item.data as unknown as UpdateArticleData);
        break;
      case 'DELETE_ARTICLE':
        await this.syncDeleteArticle(item.data as unknown as DeleteArticleData);
        break;
      case 'UPDATE_PROFILE':
        await this.syncUpdateProfile(item.data as unknown as UpdateProfileData);
        break;
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  private async syncCreateArticle(data: CreateArticleData): Promise<void> {
    const { title, content, category, userId } = data;
    await addArticle({
      title,
      content,
      category,
      authorId: userId,
      authorName: data.authorName || 'Unknown',
      authorAvatar: data.authorAvatar || '',
      imageUrl: data.imageUrl || '',
    });
  }

  private async syncUpdateArticle(data: UpdateArticleData): Promise<void> {
    // Implement article update sync
    console.log('Syncing article update:', data);
    // await updateArticle(data.id, data.updates);
  }

  private async syncDeleteArticle(data: DeleteArticleData): Promise<void> {
    console.log('Syncing article deletion:', data);
    // await deleteArticle(data.id);
  }

  private async syncUpdateProfile(data: UpdateProfileData): Promise<void> {
    const { userId, updates } = data;
    await updateUser(userId, updates);
  }

  // Register background sync (for supported browsers)
  static async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // TypeScript doesn't have types for sync API yet
        (registration as any).sync.register('background-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Handle background sync event (called from service worker)
  static async handleBackgroundSync(): Promise<void> {
    const syncManager = SyncManager.getInstance();
    await syncManager.processOfflineQueue();
  }
}

// Auto-register background sync
if (typeof window !== 'undefined') {
  SyncManager.registerBackgroundSync();
}

export const syncManager = SyncManager.getInstance();
