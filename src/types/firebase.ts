import { Timestamp } from 'firebase/firestore';
import type { Article } from './article';

// Firebase Error interface
export interface FirebaseError extends Error {
  code: string;
  message: string;
}

// Generic error type that covers Firebase errors and standard errors
export type AppError = FirebaseError | Error | { message: string } | unknown;

// Firebase Timestamp type - can be either Firebase Timestamp or Date or string
export type FirebaseTimestamp = Timestamp | Date | string;

// Ant Design Upload File interface
export interface UploadFile {
  uid: string;
  name: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  response?: Record<string, unknown>;
  linkProps?: Record<string, unknown>;
  xhr?: XMLHttpRequest;
  url?: string;
  originFileObj?: File;
  size?: number;
  type?: string;
}

// Custom request parameters for Ant Design Upload
export interface CustomUploadRequestParams {
  file: File;
  onSuccess: (response?: any) => void;
  onError: (error: Error) => void;
  onProgress?: (event: { percent: number }) => void;
}

// Weather API response types
export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility?: number;
  clouds: {
    all: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export interface CityOption {
  value: string;
  label: string;
  country: string;
}

export interface GeocodingResponse {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}

// Cache and offline types
export interface CacheData {
  articles?: Article[];
  users?: User[];
  [key: string]: unknown;
}

export interface OfflineQueueItem {
  id: string;
  action: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

// Redux action payload types
export interface ModalPayload {
  id: string;
  title?: string;
  content?: React.ReactNode | string;
}

export interface PreferencesPayload {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
  [key: string]: unknown;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Firebase related types

export interface UploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
  size: number;
  contentType: string;
}

export interface CustomRequestOption {
  file: File;
  filename?: string;
  onProgress?: (event: { percent: number }) => void;
  onError?: (error: Error) => void;
  onSuccess?: (response?: UploadResult) => void;
  response?: UploadResult;
  linkProps?: Record<string, unknown>;
  xhr?: XMLHttpRequest;
}

export interface UploadChangeInfo {
  file: {
    uid: string;
    name: string;
    status: 'uploading' | 'done' | 'error' | 'removed';
    response?: UploadResult;
  };
  fileList: CustomRequestOption['file'][];
}

export interface UploadConfig {
  accept: string;
  multiple: boolean;
  beforeUpload?: (file: File) => boolean | Promise<File>;
  onSuccess: (response?: UploadResult) => void;
  onError: (error: Error) => void;
  onProgress: (percent: number) => void;
}

export interface OfflineData {
  articles: unknown[];
  users: unknown[];
  lastSync: number;
  version: number;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number;
  errors: string[];
}

export interface NetworkStatus {
  isOnline: boolean;
  lastOnlineTime: number;
  hasBeenOfflineSession: boolean;
}

// Firebase document interfaces
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

export interface FirebaseDocument {
  id: string;
  createdAt: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

// Placeholder User type if not defined elsewhere
export interface User {
  id: string;
  email: string;
  displayName?: string;
  // Add more fields as needed
}
