import { Timestamp } from 'firebase/firestore';

// Firebase Error interface
export interface FirebaseError {
  code: string;
  message: string;
  name?: string;
  stack?: string;
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
  response?: any;
  linkProps?: any;
  xhr?: any;
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
  articles?: any[];
  users?: any[];
  [key: string]: any;
}

export interface OfflineQueueItem {
  id: string;
  action: string;
  data: Record<string, any>;
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
  [key: string]: any;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
} 